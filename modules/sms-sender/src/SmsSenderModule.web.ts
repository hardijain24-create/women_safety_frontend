import { registerWebModule, NativeModule } from 'expo';

import { SmsSenderModuleEvents } from './SmsSender.types';

class SmsSenderModule extends NativeModule<SmsSenderModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
  async sendDirectSMS(phoneNumber: string, _message: string): Promise<boolean> {
    console.warn(`[SMS] sendDirectSMS(${phoneNumber}) is not supported on Web.`);
    return false;
  }
  async openSMSIntent(phoneNumber: string, _message: string): Promise<boolean> {
    console.warn(`[SMS] openSMSIntent(${phoneNumber}) is not supported on Web.`);
    return false;
  }
}

export default registerWebModule(SmsSenderModule, 'SmsSenderModule') as unknown as SmsSenderModule;
