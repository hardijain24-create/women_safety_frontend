import { requireNativeView } from 'expo';
import * as React from 'react';

import { SmsSenderViewProps } from './SmsSender.types';

const NativeView: React.ComponentType<SmsSenderViewProps> =
  requireNativeView('SmsSender');

export default function SmsSenderView(props: SmsSenderViewProps) {
  return <NativeView {...props} />;
}
