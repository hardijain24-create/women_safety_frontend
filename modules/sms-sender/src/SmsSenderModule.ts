import { NativeModule, requireOptionalNativeModule } from 'expo-modules-core';

declare class SmsSenderModule extends NativeModule {
  sendDirectSMS(phoneNumber: string, message: string): Promise<boolean>;
  openSMSIntent(phoneNumber: string, message: string): Promise<boolean>;
}

export default requireOptionalNativeModule<SmsSenderModule>('SmsSender');
