import { Provider } from 'react-redux';

import type { AppProps } from 'next/app';
import Head from 'next/head';

// const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
// const wagmiClient = createClient({
//     autoConnect: true,
//     connectors: w3mConnectors({ version: 1, chains, projectId }),
//     provider,
// });
import { ConnectKitProvider, getDefaultClient } from 'connectkit';
import { WagmiConfig, createClient } from 'wagmi';
import { hardhat, localhost, mainnet, polygon, sepolia } from 'wagmi/chains';

import wrapper from '../store';

import '@/styles/globals.css';

const chains = [mainnet, polygon, sepolia, hardhat];

const infuraId = process.env.NEXT_PUBLIC_SEPOLIA_URL_INFURA;

const client = createClient(
  getDefaultClient({
    appName: 'Raffle',
    infuraId,
    chains,
  }),
);

export default function App({ Component, ...rest }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps } = props;

  return (
    <>
      <WagmiConfig client={client}>
        <ConnectKitProvider options={{ initialChainId: 0 }}>
          <Provider store={store}>
            <Head>
              <title>Decentralized Raffle</title>
              <meta name="description" content="Decentralized Raffle" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <Component {...pageProps} />
          </Provider>
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
