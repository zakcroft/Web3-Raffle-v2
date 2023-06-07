import { Provider } from 'react-redux';

import type { AppProps } from 'next/app';
import Head from 'next/head';

import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from '@wagmi/core/providers/infura';

import { mainnet, sepolia, polygon, hardhat, localhost } from 'wagmi/chains';

import wrapper from '../store';

import '@/styles/globals.css';

const { chains, publicClient } = configureChains(
  [mainnet, polygon, sepolia, hardhat],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_SEPOLIA_URL_INFURA }),
    publicProvider(),
  ],
);

const config = createConfig(
  getDefaultConfig({
    appName: 'Raffle',
    chains,
    publicClient,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  }),
);

export default function App({ Component, ...rest }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps } = props;

  return (
    <>
      <WagmiConfig config={config}>
        <ConnectKitProvider options={{ initialChainId: 0 }}>
          <Provider store={store}>
            <Head>
              <title>Decentralized Raffle</title>
            </Head>
            <Component {...pageProps} />
          </Provider>
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
