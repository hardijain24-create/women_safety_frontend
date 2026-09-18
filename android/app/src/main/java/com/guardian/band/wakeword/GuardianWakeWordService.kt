package com.guardian.band.wakeword

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel
import kotlin.math.*

class GuardianWakeWordService : Service() {

    companion object {
        private const val TAG = "GuardianVoice"
        private const val CHANNEL_ID = "guardian_voice_channel"
        private const val NOTIFICATION_ID = 1001

        private const val SAMPLE_RATE = 16000
        private const val BUFFER_SIZE_MILLIS = 1000 // 1 second
        private const val AUDIO_SAMPLES_1_SEC = SAMPLE_RATE
        private const val FFT_SIZE = 512
        private const val HOP_LENGTH = 256
        private const val NUM_MELS = 40
        private const val ENERGY_THRESHOLD = 0.02f
        private const val COOLDOWN_MS = 10000L

        private const val MODEL_FILE = "guardian_guardian_sota.tflite"
        private const val CONFIDENCE_THRESHOLD = 0.85f

        var isRunning = false
            private set
    }

    private var audioRecord: AudioRecord? = null
    private var recordingThread: Thread? = null
    private var isRecording = false
    private var wakeLock: PowerManager.WakeLock? = null
    
    private var tflite: Interpreter? = null
    private var inputScale = 0.0f
    private var inputZeroPoint = 0
    private var outputScale = 0.0f
    private var outputZeroPoint = 0

    private var lastTriggerTime = 0L

    // For Mel Spectrogram calculation
    private val melFilterBank = computeMelFilterBank(FFT_SIZE, SAMPLE_RATE, NUM_MELS, 0.0, 8000.0)

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireWakeLock()
        loadModel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (!isRunning) {
            val notification = NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Guardian Voice SOS")
                .setContentText("Guardian is listening for your safety phrase...")
                .setSmallIcon(android.R.drawable.ic_btn_speak_now) // fallback icon
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build()

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE)
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }

            startRecording()
            isRunning = true
        }
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        stopRecording()
        tflite?.close()
        tflite = null
        releaseWakeLock()
        isRunning = false
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "GuardianVoice::WakeWordWakeLock")
        wakeLock?.acquire()
        Log.d(TAG, "WakeLock acquired")
    }

    private fun releaseWakeLock() {
        wakeLock?.let {
            if (it.isHeld) {
                it.release()
                Log.d(TAG, "WakeLock released")
            }
        }
        wakeLock = null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Guardian Voice SOS",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun loadModel() {
        try {
            val modelBuffer = loadModelFile()
            val options = Interpreter.Options()
            tflite = Interpreter(modelBuffer, options)
            
            val inputTensor = tflite!!.getInputTensor(0)
            val inputParams = inputTensor.quantizationParams()
            inputScale = inputParams.scale
            inputZeroPoint = inputParams.zeroPoint

            val outputTensor = tflite!!.getOutputTensor(0)
            val outputParams = outputTensor.quantizationParams()
            outputScale = outputParams.scale
            outputZeroPoint = outputParams.zeroPoint
            
            Log.d(TAG, "Model loaded successfully with Quant Params - In: ($inputScale, $inputZeroPoint), Out: ($outputScale, $outputZeroPoint)")
        } catch (e: Exception) {
            Log.e(TAG, "Error reading model file: $MODEL_FILE", e)
        }
    }

    private fun loadModelFile(): MappedByteBuffer {
        val fileDescriptor = assets.openFd(MODEL_FILE)
        val inputStream = FileInputStream(fileDescriptor.fileDescriptor)
        val fileChannel = inputStream.channel
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, fileDescriptor.startOffset, fileDescriptor.declaredLength)
    }

    private fun startRecording() {
        val bufferSize = AudioRecord.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        ).coerceAtLeast(FFT_SIZE * 2)

        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize
        )

        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
            Log.e(TAG, "AudioRecord initialization failed")
            return
        }

        isRecording = true
        audioRecord?.startRecording()

        recordingThread = Thread {
            val audioBuffer = ShortArray(FFT_SIZE)
            val rollingBuffer = FloatArray(AUDIO_SAMPLES_1_SEC)
            var bufferPos = 0

            while (isRecording) {
                val readResult = audioRecord?.read(audioBuffer, 0, FFT_SIZE) ?: 0
                if (readResult > 0) {
                    var rms = 0f
                    for (i in 0 until readResult) {
                        val sample = audioBuffer[i] / 32768.0f
                        rms += sample * sample
                        
                        // Shift rolling buffer and append
                        System.arraycopy(rollingBuffer, 1, rollingBuffer, 0, AUDIO_SAMPLES_1_SEC - 1)
                        rollingBuffer[AUDIO_SAMPLES_1_SEC - 1] = sample
                    }
                    rms = sqrt(rms / readResult)

                    if (rms > ENERGY_THRESHOLD) {
                        val currentTime = System.currentTimeMillis()
                        if (currentTime - lastTriggerTime > COOLDOWN_MS) {
                            processAudio(rollingBuffer)
                        }
                    }
                }
            }
        }
        recordingThread?.start()
    }

    private fun stopRecording() {
        isRecording = false
        recordingThread?.join(1000)
        recordingThread = null
        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null
    }

    private fun processAudio(audioData: FloatArray) {
        if (tflite == null) return

        try {
            val melFeatures = extractMelSpectrogram(audioData) // Shape: [40, 63] (assuming flat float array of 2520)
            
            // Expected input size
            val expectedSize = NUM_MELS * 63
            val inputBuffer = ByteBuffer.allocateDirect(expectedSize)
            inputBuffer.order(ByteOrder.nativeOrder())
            
            for (i in 0 until melFeatures.size) {
                var quantVal = (melFeatures[i] / inputScale) + inputZeroPoint
                quantVal = quantVal.coerceIn(-128.0f, 127.0f)
                inputBuffer.put(quantVal.toInt().toByte())
            }
            
            val outputBuffer = ByteBuffer.allocateDirect(1)
            outputBuffer.order(ByteOrder.nativeOrder())
            
            tflite?.run(inputBuffer, outputBuffer)
            
            outputBuffer.rewind()
            val quantOutput = outputBuffer.get().toInt()
            val confFloat = (quantOutput - outputZeroPoint) * outputScale
            
            Log.d(TAG, "Inference completed. Confidence: $confFloat")
            
            if (confFloat > CONFIDENCE_THRESHOLD) {
                Log.d(TAG, "Wake word detected!")
                lastTriggerTime = System.currentTimeMillis()
                GuardianVoiceModule.onWakeWordDetected()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in processAudio", e)
        }
    }

    private fun extractMelSpectrogram(audioData: FloatArray): FloatArray {
        val numFrames = (audioData.size - FFT_SIZE) / HOP_LENGTH + 1 // should be 63 for 1 sec
        val melSpectrogram = FloatArray(NUM_MELS * numFrames)

        val window = hannWindow(FFT_SIZE)
        
        for (i in 0 until numFrames) {
            val frameStart = i * HOP_LENGTH
            val frame = FloatArray(FFT_SIZE)
            for (j in 0 until FFT_SIZE) {
                frame[j] = audioData[frameStart + j] * window[j]
            }

            val magnitudes = computeMagnitudeSpectrum(frame)
            val melEnergies = applyMelFilterBank(magnitudes, melFilterBank)
            
            for (m in 0 until NUM_MELS) {
                // Log10 with epsilon to avoid log(0)
                var logMel = log10(max(melEnergies[m].toDouble(), 1e-10)).toFloat()
                melSpectrogram[m * numFrames + i] = logMel
            }
        }
        
        return melSpectrogram
    }

    private fun hannWindow(length: Int): FloatArray {
        val win = FloatArray(length)
        for (i in 0 until length) {
            win[i] = (0.5 - 0.5 * cos(2.0 * Math.PI * i / (length - 1))).toFloat()
        }
        return win
    }

    private fun computeMagnitudeSpectrum(frame: FloatArray): FloatArray {
        val real = FloatArray(FFT_SIZE) { frame[it] }
        val imag = FloatArray(FFT_SIZE) { 0f }
        
        fft(real, imag)
        
        val magnitudes = FloatArray(FFT_SIZE / 2 + 1)
        for (i in 0..FFT_SIZE / 2) {
            magnitudes[i] = sqrt(real[i] * real[i] + imag[i] * imag[i])
        }
        return magnitudes
    }

    // Radix-2 Cooley-Tukey FFT
    private fun fft(real: FloatArray, imag: FloatArray) {
        val n = real.size
        var j = 0
        for (i in 0 until n - 1) {
            if (i < j) {
                val tempR = real[i]
                real[i] = real[j]
                real[j] = tempR
                val tempI = imag[i]
                imag[i] = imag[j]
                imag[j] = tempI
            }
            var m = n / 2
            while (j >= m) {
                j -= m
                m /= 2
            }
            j += m
        }

        var l = 1
        while (l < n) {
            val step = 2 * l
            val theta = -Math.PI / l
            val wR = cos(theta).toFloat()
            val wI = sin(theta).toFloat()
            for (i in 0 until n step step) {
                var wr = 1.0f
                var wi = 0.0f
                for (k in 0 until l) {
                    val idx1 = i + k
                    val idx2 = idx1 + l
                    val tR = wr * real[idx2] - wi * imag[idx2]
                    val tI = wr * imag[idx2] + wi * real[idx2]
                    real[idx2] = real[idx1] - tR
                    imag[idx2] = imag[idx1] - tI
                    real[idx1] += tR
                    imag[idx1] += tI
                    
                    val wTemp = wr * wR - wi * wI
                    wi = wr * wI + wi * wR
                    wr = wTemp
                }
            }
            l = step
        }
    }

    private fun computeMelFilterBank(fftSize: Int, sampleRate: Int, numMels: Int, fMin: Double, fMax: Double): Array<FloatArray> {
        val melMin = hzToMel(fMin)
        val melMax = hzToMel(fMax)
        
        val melPoints = DoubleArray(numMels + 2)
        for (i in melPoints.indices) {
            melPoints[i] = melMin + i * (melMax - melMin) / (numMels + 1)
        }
        
        val hzPoints = DoubleArray(melPoints.size)
        val binPoints = IntArray(melPoints.size)
        for (i in melPoints.indices) {
            hzPoints[i] = melToHz(melPoints[i])
            binPoints[i] = floor((fftSize + 1) * hzPoints[i] / sampleRate).toInt()
        }
        
        val numFftBins = fftSize / 2 + 1
        val filterBank = Array(numMels) { FloatArray(numFftBins) }
        
        for (m in 1..numMels) {
            for (k in binPoints[m - 1] until binPoints[m]) {
                filterBank[m - 1][k] = ((k - binPoints[m - 1]).toFloat() / (binPoints[m] - binPoints[m - 1]))
            }
            for (k in binPoints[m] until binPoints[m + 1]) {
                filterBank[m - 1][k] = ((binPoints[m + 1] - k).toFloat() / (binPoints[m + 1] - binPoints[m]))
            }
        }
        
        return filterBank
    }

    private fun applyMelFilterBank(magnitudes: FloatArray, filterBank: Array<FloatArray>): FloatArray {
        val melEnergies = FloatArray(NUM_MELS)
        for (m in 0 until NUM_MELS) {
            var sum = 0f
            for (k in magnitudes.indices) {
                sum += filterBank[m][k] * magnitudes[k]
            }
            melEnergies[m] = sum
        }
        return melEnergies
    }

    private fun hzToMel(hz: Double): Double = 2595.0 * log10(1.0 + hz / 700.0)
    private fun melToHz(mel: Double): Double = 700.0 * (10.0.pow(mel / 2595.0) - 1.0)
}
