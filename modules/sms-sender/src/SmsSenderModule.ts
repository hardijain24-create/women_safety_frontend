import { NativeModule, requireNativeModule } from 'expo';

declare class SmsSenderModule extends NativeModule {
  sendDirectSMS(phoneNumber: string, message: string): Promise<boolean>;
  openSMSIntent(phoneNumber: string, message: string): Promise<boolean>;
}

export default requireNativeModule<SmsSenderModule>('SmsSender');
