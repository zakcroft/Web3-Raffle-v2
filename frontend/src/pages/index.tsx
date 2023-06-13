import { useEffect, useState } from 'react';
import { getAccount, readContracts } from '@wagmi/core';
import { formatUnits } from 'viem';
import { Inter } from 'next/font/google';
import { raffleAbi } from '@/abis';
import { raffleTokenAbi } from '@/abis';
import { contractAddresses } from '@/abis';

import { Button } from '@/common/Button';
import { useAccount, useBalance } from 'wagmi';
import { useRaffle } from '@/hooks/useRaffle';
import { Left, Main, Right } from '@/common/Layouts';
import { getAccountBalance } from '@/utils';
import { useBuyTokens } from '@/hooks/useBuyTokens';
import { useApproveTokens } from '@/hooks/useApproveTokens';
import { useEnterRaffle } from '@/hooks/useEnterRaffle';
import { useUserTokenBalance } from '@/hooks/useUserTokenBalance';
import { GetServerSideProps } from 'next';
import Header from '@/components/Header';
import SideBar from '@/components/SideBar';
import Stats from '@/components/Stats';
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
  const [userWalletBalance, setUserWalletBalance] = useState<bigint>(0n);

  const { raffleAbi, raffleAddress, raffleTokenAbi, raffleTokenAddress } =
    useRaffle();

  const { address } = useAccount();

  const userWalletAccountBalance = useBalance({
    address,
  });

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
        const balance = await userWalletAccountBalance.refetch();
        const val = getAccountBalance(balance);
        setUserWalletBalance(val);
      }
    })();
  }, [
    address,
    buyRaffleTokensSuccess,
    raffleAddress,
    raffleBalance,
    raffleTokenAddress,
    raffleUserTokenBalance,
    userWalletAccountBalance,
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
      <Header
        raffleAddressBalance={raffleAddressBalance}
        userWalletBalance={userWalletBalance}
      />
      <Main>
        <SideBar
          setRaffleTokenUserAddressBalance={setRaffleTokenUserAddressBalance}
          raffleTokenUserAddressBalance={raffleTokenUserAddressBalance}
        />
        <div className={'flex flex-col basis-7/12 items-center px-20 pt-10'}>
          <p>Welcome to the Decentralized Raffle play area.</p>
          {raffleTokenUserAddressBalance === 0n && (
            <p className={'mt-10 text-red-500'}>
              You need to buy tokens to enter.
            </p>
          )}
          <Button
            classOverrides={'mt-10'}
            disabled={!approveTokens || raffleTokenUserAddressBalance === 0n}
            onClick={async () => {
              await approveTokens?.();
            }}
          >
            Approve and Enter <span className={'italic'}>1</span> token into the
            Raffle
          </Button>
          <p className={'mt-10'}>
            You have entered{' '}
            <span className={'text-3xl text-red-500'}>
              {formatUnits(BigInt(playerBalance), 0)}
            </span>{' '}
            tokens into the raffle.
          </p>
        </div>

        {/*<Button*/}
        {/*  classOverrides={'w-2/3 h-fit self-center'}*/}
        {/*  disabled={!pickWinner}*/}
        {/*  onClick={() => pickWinner?.()}*/}
        {/*>*/}
        {/*  Pick a winner*/}
        {/*</Button>*/}
        <Stats />
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
