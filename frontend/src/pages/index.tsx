import { useEffect, useState } from 'react';

import { useEvmNativeBalance } from '@moralisweb3/next';
import {
  ConnectKitButton,
  ConnectKitProvider,
  getDefaultClient,
} from 'connectkit';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import Image from 'next/image';
import { useNetwork } from 'wagmi';

import styles from '@/styles/Home.module.css';

import { abi, contractAddresses } from '../constants';

const inter = Inter({ subsets: ['latin'] });

interface contractAddressesInterface {
  [key: string]: string[];
}

export default function App() {
  const [raffleAddress, setRaffleAddress] = useState('');
  const addresses: contractAddressesInterface = contractAddresses;
  const { chain } = useNetwork();

  console.log('chain===', chain);

  // const chainId: string = parseInt(chainIdHex!).toString()

  //const { data: nativeBalance } = useEvmNativeBalance({ raffleAddress });
  console.log(addresses);

  useEffect(() => {
    if (chain?.id) {
      const raffleAddress = addresses[chain?.id][0];
      if (raffleAddress) {
        setRaffleAddress(raffleAddress);
      }
    }
  }, [addresses, chain]);
  return (
    <>
      <main className={styles.main}>
        <div className={styles.description}>
          <div>
            <h3>Raffle: {raffleAddress}</h3>
            {/*<h3>Native Balance: {nativeBalance?.balance.ether} ETH</h3>*/}
          </div>
          <ConnectKitButton />
          <p className={'text-red p-20'}>
            TEST
            <code className={styles.code}>src/pages/index.tsx</code>
          </p>
          <div>
            <a
              href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              By{' '}
              <Image
                src="/vercel.svg"
                alt="Vercel Logo"
                className={styles.vercelLogo}
                width={100}
                height={24}
                priority
              />
            </a>
          </div>
        </div>

        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
          <div className={styles.thirteen}>
            <Image
              src="/thirteen.svg"
              alt="13"
              width={40}
              height={31}
              priority
            />
          </div>
        </div>

        <div className={styles.grid}>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Docs <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Find in-depth information about Next.js features and&nbsp;API.
            </p>
          </a>

          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Learn <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Learn about Next.js in an interactive course with&nbsp;quizzes!
            </p>
          </a>

          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Templates <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Discover and deploy boilerplate example Next.js&nbsp;projects.
            </p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Deploy <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Instantly deploy your Next.js site to a shareable URL
              with&nbsp;Vercel.
            </p>
          </a>
        </div>
      </main>
    </>
  );
}
