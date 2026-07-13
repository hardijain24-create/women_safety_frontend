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
}

export default registerWebModule(SmsSenderModule, 'SmsSenderModule');
