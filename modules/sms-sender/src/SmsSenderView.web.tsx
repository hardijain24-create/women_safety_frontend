import * as React from 'react';

import { SmsSenderViewProps } from './SmsSender.types';

export default function SmsSenderView(props: SmsSenderViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
