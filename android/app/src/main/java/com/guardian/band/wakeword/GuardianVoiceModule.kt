package com.guardian.band.wakeword

import android.content.Intent
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class GuardianVoiceModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "GuardianVoice"
        private var instance: GuardianVoiceModule? = null

        fun onWakeWordDetected() {
            Log.d(TAG, "onWakeWordDetected static callback invoked, emitting event to JS")
            instance?.sendEvent("onGuardianTriggered", Arguments.createMap())
        }
    }

    init {
        instance = this
    }

    override fun getName(): String {
        return "GuardianVoiceModule"
    }

    @ReactMethod
    fun startListening(promise: Promise) {
        try {
            val intent = Intent(reactContext, GuardianWakeWordService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start listening service", e)
            promise.reject("START_SERVICE_FAILED", e)
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        try {
            val intent = Intent(reactContext, GuardianWakeWordService::class.java)
            reactContext.stopService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop listening service", e)
            promise.reject("STOP_SERVICE_FAILED", e)
        }
    }

    @ReactMethod
    fun isListening(promise: Promise) {
        promise.resolve(GuardianWakeWordService.isRunning)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for React Native built-in Event Emitter Calls
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for React Native built-in Event Emitter Calls
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        try {
            if (reactContext.hasActiveCatalystInstance()) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, params)
            } else {
                Log.w(TAG, "No active catalyst instance to send event: $eventName")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send event to JS: $eventName", e)
        }
    }
}
