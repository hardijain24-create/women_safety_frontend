import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { SOSController } from '../services/shake/SOSController';
import { SOSState, ShakeConfig } from '../services/shake/types';
import { SOSConfirmationModal } from '../components/molecules/SOSConfirmationModal';
import { AuthContext } from './AuthContext';

interface ShakeSOSContextType {
  state: SOSState;
  remainingSeconds: number;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  cancelSOS: () => void;
  triggerManualSOS: () => void;
  updateConfig: (config: Partial<ShakeConfig>) => void;
  controller: SOSController;
}

const ShakeSOSContext = createContext<ShakeSOSContextType | null>(null);

export const ShakeSOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const controllerRef = useRef<SOSController>(new SOSController());
  const [state, setState] = useState<SOSState>('IDLE');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const controller = controllerRef.current;
    controller.setUser(user);

    const unsubscribe = controller.onStateChange((newState, remaining) => {
      setState(newState);
      setRemainingSeconds(remaining || 0);
    });

    if (isEnabled) {
      controller.start().catch(err => {
        console.warn('Failed to start Shake detector:', err);
      });
    }

    return () => {
      unsubscribe();
      controller.stop();
    };
  }, [user, isEnabled]);

  const cancelSOS = () => {
    controllerRef.current.cancelSOS();
  };

  const triggerManualSOS = () => {
    controllerRef.current.forceTrigger();
  };

  const updateConfig = (config: Partial<ShakeConfig>) => {
    controllerRef.current.getDetector().updateConfig(config);
  };

  const isModalVisible = state === 'COUNTDOWN' || state === 'SHAKE_DETECTED';

  return (
    <ShakeSOSContext.Provider
      value={{
        state,
        remainingSeconds,
        isEnabled,
        setIsEnabled,
        cancelSOS,
        triggerManualSOS,
        updateConfig,
        controller: controllerRef.current,
      }}
    >
      {children}
      <SOSConfirmationModal
        visible={isModalVisible}
        remainingSeconds={remainingSeconds}
        state={state}
        onCancel={cancelSOS}
      />
    </ShakeSOSContext.Provider>
  );
};

export const useShakeSOS = () => {
  const context = useContext(ShakeSOSContext);
  if (!context) {
    throw new Error('useShakeSOS must be used within a ShakeSOSProvider');
  }
  return context;
};
