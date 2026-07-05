import { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import './styles/global.scss';
import './styles/tokens.scss';
import './styles/ai-six.scss';

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.info('[GiftPilot] 礼有方 AI 礼物经营助手启动 · MVP v0.6');
    }
  });

  return children as JSX.Element;
}

export default App;
