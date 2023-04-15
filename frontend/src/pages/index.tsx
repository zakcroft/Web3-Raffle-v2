import { useEffect, useState } from 'react';

import { useEvmNativeBalance } from '@moralisweb3/next';
import { Inter } from 'next/font/google';

import { Button } from '@/common/Button';

import { ConnectKitButton } from 'connectkit';
import { fetchBalance, getAccount } from '@wagmi/core';
import {
  useAccount,
  useBalance,
  useNetwork,
  useContractReads,
  usePrepareContractWrite,
  useContractWrite,
  useContract,
  Address,
} from 'wagmi';

import { useRaffle } from '@/hooks/useRaffle';
import { ethers } from 'ethers';
import { Left, Main } from '@/common/Layouts';
import { GetServerSideProps } from 'next';

const inter = Inter({ subsets: ['latin'] });

export default function App() {
  //const [raffleTokenAddressBalance, setUpdateCounter] = useState(0);
  const [fetchedAccountBalance, setFetchedAccountBalance] = useState('0');

  const { raffleAbi, raffleAddress, raffleTokenAbi, raffleTokenAddress } =
    useRaffle();

  const { address } = useAccount();

  const accountBalance = useBalance({
    address,
  });

  const raffleBalance = useBalance({
    address: raffleAddress,
  });

  const raffleTokenBalance = useBalance({
    address: address,
    token: raffleTokenAddress,
  });

  const tokenCost = ethers.utils.parseUnits('0.1', 'ether');

  const { config } = usePrepareContractWrite({
    address: raffleAddress,
    abi: raffleAbi,
    functionName: 'buyRaffleTokens',
    overrides: {
      from: address,
      value: tokenCost,
    },
  });

  const { isSuccess, write } = useContractWrite(config);

  useEffect(() => {
    if (isSuccess) {
      raffleTokenBalance.refetch().then((data) => {
        console.log('refetch', data);
      });
    }
  }, [isSuccess, raffleTokenBalance]);

  useEffect(() => {
    if (accountBalance.data?.value) {
      setFetchedAccountBalance(accountBalance.data.value.toString());
    }
  }, [accountBalance]);

  return (
    <>
      <header className={'grid grid-cols-3 pt-8 px-12 pb-2'}>
        <div className={'flex flex-col items-center col-start-2'}>
          <h3 className={'text-2xl font-black'}>DECENTRALIZED RAFFLE</h3>
          <h3 className={'text-sm text-gray-500 italic'}>
            Address : {raffleAddress}
          </h3>
        </div>
        <div className={'justify-self-end'}>
          <ConnectKitButton />
          <h1
            className={
              'inline-block text-normal font-black text-gray-300 italic mt-3'
            }
          >
            Wallet balance:{' '}
            {Number(
              ethers.utils.formatUnits(fetchedAccountBalance, 'ether'),
            ).toFixed(2)}
          </h1>
        </div>
      </header>

      {/*<h1*/}
      {/*  className={*/}
      {/*    'inline-block text-3xl font-black text-white lg:leading-[5.625rem] '*/}
      {/*  }*/}
      {/*>*/}
      {/*  Winnings: {raffleTokenBalance.data?.value.toString()}*/}
      {/*</h1>*/}
      <Main>
        <Left title={'Stash'}>
          <Button
            classOverrides={'w-2/3'}
            disabled={!write}
            onClick={() => write?.()}
          >
            Buy Raffle Tokens
          </Button>
          <p>STASH: {raffleTokenBalance.data?.value.toString()}</p>
          {/*<h3>Native Balance: {nativeBalance?.balance.ether} ETH</h3>*/}
        </Left>
      </Main>
    </>
  );
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const account = await getAccount();
//   const balance = await fetchBalance({
//     address: account?.address as Address,
//   });
//
//   return {
//     props: {
//       initialAccountBalance: balance.value.toString(),
//     },
//   };
// };
