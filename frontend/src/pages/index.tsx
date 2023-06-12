import { useEffect, useState } from 'react';
import { getAccount, readContracts } from '@wagmi/core';
import { parseUnits, formatUnits, parseEther } from 'viem';
// import { useEvmNativeBalance } from '@moralisweb3/next';
import { Inter } from 'next/font/google';
import { raffleAbi } from '@/abis';
import { raffleTokenAbi } from '@/abis';
import { contractAddresses } from '@/abis';
import { getNetwork } from '@wagmi/core';
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
  useWaitForTransaction,
  useContractReads,
  // useContract,
  // Address,
} from 'wagmi';

import { useRaffle } from '@/hooks/useRaffle';

import { Left, Main, Right } from '@/common/Layouts';
import { getAccountBalance } from '@/utils';
import { useBuyTokens } from '@/hooks/useBuyTokens';
import { useApproveTokens } from '@/hooks/useApproveTokens';
import { useEnterRaffle } from '@/hooks/useEnterRaffle';
import { usePickWinner } from '@/hooks/usePickWinner';
import { useUserTokenBalance } from '@/hooks/useUserTokenBalance';
import { useUserTokenBalances } from '@/hooks/useAllUserBalances';
import { GetServerSideProps } from 'next';
// import { GetServerSideProps } from 'next';
// import { getTokenAllowanceOperation } from '@moralisweb3/common-evm-utils';0n

const inter = Inter({ subsets: ['latin'] });

interface IAppProps {
  balanceOf: string;
  allowance: string;
  playerBalance: string;
}

export default function App({
  balanceOf,
  allowance,
  playerBalance,
}: IAppProps) {
  const [raffleAddressBalance, setRaffleAddressBalance] = useState<bigint>(0n);
  const [raffleTokenUserAddressBalance, setRaffleTokenUserAddressBalance] =
    useState<bigint>(0n);
  const [fetchedAccountBalance, setFetchedAccountBalance] =
    useState<bigint>(0n);

  const { raffleAbi, raffleAddress, raffleTokenAbi, raffleTokenAddress } =
    useRaffle();

  const { address } = useAccount();

  const userAccountBalance = useBalance({
    address,
  });

  // const { data = [] } = useUserTokenBalances();
  // const [balanceOf, allowance, playerBalance] = data;
  // console.log(playerBalance);

  const raffleBalance = useBalance({
    address: raffleAddress,
    enabled: false,
  });

  const raffleUserTokenBalance = useUserTokenBalance();

  const { buyRaffleTokensSuccess, buyRaffleTokens } = useBuyTokens();
  const { txApproveTokensSuccess, approveTokens, approveTokensData } =
    useApproveTokens();
  const { enterRaffleSuccess, enterRaffle } = useEnterRaffle();
  // const { pickAWinnerSuccess, pickWinner, refetchPrepareConfigPickWinner } =
  //   usePickWinner();

  console.log('raffleTokenUserAddressBalance', raffleTokenUserAddressBalance);
  console.log(
    'raffleTokenUserAddressBalance',
    raffleTokenUserAddressBalance > 0n,
  );

  useEffect(() => {
    (async () => {
      if (raffleTokenAddress || buyRaffleTokensSuccess) {
        const balance = await raffleUserTokenBalance.refetch();
        const val = getAccountBalance(balance);
        setRaffleTokenUserAddressBalance(val);
      }
      if (raffleAddress || buyRaffleTokensSuccess) {
        const balance = await raffleBalance.refetch();
        const val = getAccountBalance(balance);
        setRaffleAddressBalance(val);
      }
      if (address || buyRaffleTokensSuccess) {
        const balance = await userAccountBalance.refetch();
        const val = getAccountBalance(balance);
        setFetchedAccountBalance(val);
      }
    })();
  }, [
    address,
    buyRaffleTokensSuccess,
    raffleAddress,
    raffleBalance,
    raffleTokenAddress,
    raffleUserTokenBalance,
    userAccountBalance,
  ]);

  useEffect(() => {
    if (txApproveTokensSuccess) {
      (async () => {
        if (enterRaffle) {
          await enterRaffle();
        }
      })();
    }
  }, [enterRaffle, txApproveTokensSuccess]);

  return (
    <>
      <header
        className={'grid grid-cols-3 pt-8 px-12 pb-2 border-b border-gray-500'}
      >
        <div className={'flex flex-col items-center col-start-2'}>
          <h3 className={'text-2xl font-black'}>DECENTRALIZED RAFFLE</h3>
          <h3 className={'text-sm text-gray-500 italic'}>
            Address : {raffleAddress}
          </h3>
          <h1
            className={
              'inline-block text-3xl font-black text-white lg:leading-[5.625rem] '
            }
          >
            Jackpot: {formatUnits(raffleAddressBalance, 18)} ETH
          </h1>
        </div>
        <div className={'justify-self-end flex flex-col'}>
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

      <Main>
        <Left
          title={'Reserve'}
          description={'Buy tokens to top up your reserve.'}
        >
          <Button
            disabled={!buyRaffleTokens}
            onClick={async () => {
              await buyRaffleTokens?.();
            }}
          >
            Buy Raffle Token <span className={'italic'}>(0.1 eth)</span>
          </Button>
          <p>
            You have{' '}
            <span className={'text-2xl text-red-500'}>
              {formatUnits(raffleTokenUserAddressBalance, 0)}
            </span>{' '}
            tokens in your reserve.
          </p>
          <p>These are not entered into the draw yet.</p>
          <p>Enter tokens in the play area.</p>
          <p className={'inline-block text-xl font-black text-white  mt-20 '}>
            Your Winning history{' '}
          </p>
          <ul className={'text-sm  text-gray-500 italic'}>
            <li>New Date.</li>
            <li>New Date.</li>
          </ul>
        </Left>
        <div className={'flex flex-col basis-7/12 items-center p-20'}>
          Welcome to the Decentralized Raffle play area.
          <p> Countdown to draw.</p>
          <Button
            classOverrides={'self-start'}
            disabled={!approveTokens || raffleTokenUserAddressBalance === 0n}
            onClick={async () => {
              await approveTokens?.();
            }}
          >
            Enter <span className={'italic'}>1</span> token into the Raffle
          </Button>
        </div>
        <p>
          You have entered
          <span className={'text-2xl text-red-500'}>
            {formatUnits(
                BigInt(playerBalance),
              0,
            )}
          </span>{' '}
          tokens into the raffle.
        </p>

        {/*<Button*/}
        {/*  classOverrides={'w-2/3 h-fit self-center'}*/}
        {/*  disabled={!pickWinner}*/}
        {/*  onClick={() => pickWinner?.()}*/}
        {/*>*/}
        {/*  Pick a winner*/}
        {/*</Button>*/}
        <Right title={'Stats'}>
          <p
            className={
              'inline-block text-xl font-black text-white pt-8 border-b border-dashed border-gray-500'
            }
          >
            Winner history{' '}
          </p>
          <ul className={'text-sm text-gray-500 italic'}>
            <li>0x1234567890</li>
            <li>0x1234567890</li>
            <li>0x1234567890</li>
          </ul>
        </Right>
      </Main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const chain = 31337;
  // TODO: get the chainId from getNetwork
  //const { chain = 31337, chains } = getNetwork()

  console.log(context);
  const { address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' } =
    await getAccount();
  const [raffleAddress, raffleTokenAddress] = contractAddresses[chain];

  const raffleContract = {
    address: raffleAddress,
    abi: raffleAbi,
    chainId: chain,
  };
  const raffleTokenContract = {
    address: raffleTokenAddress,
    abi: raffleTokenAbi,
    chainId: chain,
  };

  const [balanceOf, allowance, playerBalance] = await readContracts({
    contracts: [
      {
        ...raffleTokenContract,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        ...raffleTokenContract,
        functionName: 'allowance',
        args: [address, raffleAddress],
      },
      {
        ...raffleContract,
        functionName: 'getPlayerBalance',
        args: [address],
      },
    ],
  });

  return {
    props: {
      balanceOf: balanceOf?.result?.toString(),
      allowance: allowance?.result?.toString(),
      playerBalance: playerBalance?.result?.toString(),
    },
  };
};
