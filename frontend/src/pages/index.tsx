import { useEffect, useState } from 'react';
import { parseUnits, formatUnits, parseEther } from 'viem';
// import { useEvmNativeBalance } from '@moralisweb3/next';
import { Inter } from 'next/font/google';

import { Button } from '@/common/Button';

import { ConnectKitButton } from 'connectkit';
// import { fetchBalance, getAccount } from '@wagmi/core';
import {
  useAccount,
  useBalance,
  // useNetwork,
  // useContractReads,
  usePrepareContractWrite,
  useContractWrite,
  Address,
  // useContract,
  // Address,
} from 'wagmi';

import { useRaffle } from '@/hooks/useRaffle';

import { Left, Main } from '@/common/Layouts';
import { getAccountBalance } from '@/utils';
// import { GetServerSideProps } from 'next';
// import { getTokenAllowanceOperation } from '@moralisweb3/common-evm-utils';0n

const inter = Inter({ subsets: ['latin'] });

export default function App() {
  const [raffleTokenAddressBalance, setRaffleTokenAddressBalance] =
    useState<bigint>(0n);
  const [fetchedAccountBalance, setFetchedAccountBalance] =
    useState<bigint>(0n);

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
    enabled: false,
  });

  useEffect(() => {
    (async () => {
      if (raffleTokenAddress) {
        await raffleTokenBalance.refetch().then(({ data }) => {
          const val = getAccountBalance(accountBalance);
          setRaffleTokenAddressBalance(val);
        });
      }
    })();
  }, [accountBalance, raffleTokenAddress, raffleTokenBalance]);

  const tokenCost = parseUnits('0.1', 18);

  const { config } = usePrepareContractWrite({
    address: raffleAddress,
    abi: raffleAbi,
    functionName: 'buyRaffleTokens',
    account: address,
    value: tokenCost,
  });

  const { isSuccess, write } = useContractWrite(config);

  // console.log('fetchedAccountBalance ===', fetchedAccountBalance);
  // console.log('address ===', address);
  //console.log('accountBalance ===', accountBalance);
  // console.log(typeof tokenCost);
  // console.log(tokenCost);
  //  console.log('raffleBalance', raffleBalance);
  //console.log('raffleTokenBalance', raffleTokenBalance.refetch);

  useEffect(() => {
    if (isSuccess) {
      console.log(isSuccess);
      raffleTokenBalance.refetch().then((data) => {
        console.log('refetch raffleTokenBalance', data);
      });
      accountBalance.refetch().then((data) => {
        console.log('refetch accountBalance', data);
      });
    }
  }, [accountBalance, isSuccess, raffleTokenBalance]);

  useEffect(() => {
    if (accountBalance.data?.value) {
      const val = getAccountBalance(accountBalance);
      setFetchedAccountBalance(val);
    }
  }, [accountBalance]);

  console.log(raffleTokenAddressBalance.toString())

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
            {Number(formatUnits(fetchedAccountBalance, 18)).toFixed(2)}
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
          <p>STASH: {formatUnits(raffleTokenAddressBalance, 18)}</p>
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
