import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';

import { Button } from '@/common/Button';
import { useAccount, useBalance } from 'wagmi';
import { useRaffle } from '@/hooks/useRaffle';
import { Main } from '@/common/Layouts';
import { getAccountBalance } from '@/utils';
import { useBuyTokens } from '@/hooks/useBuyTokens';
import { useApproveTokens } from '@/hooks/useApproveTokens';
import { useEnterRaffle } from '@/hooks/useEnterRaffle';
import { useUserTokenBalance } from '@/hooks/useUserTokenBalance';

import Header from '@/components/Header';
import SideBar from '@/components/SideBar';
import Stats from '@/components/Stats';
import { useUserTokenBalances } from '@/hooks/useAllUserBalances';

export default function App() {
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
  const { allowance, playerBalance, userTokenBalancesRefetch } =
    useUserTokenBalances();

  const { buyRaffleTokensSuccess, buyRaffleTokens } = useBuyTokens();
  const { txApproveTokensSuccess, approveTokens, approveTokensData } =
    useApproveTokens();
  const { enterRaffleSuccess, enterRaffle, refetchEnterRaffle } = useEnterRaffle();
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
      if (txApproveTokensSuccess || buyRaffleTokensSuccess) {
        await userTokenBalancesRefetch();
      }
    })();
  }, [
    address,
    buyRaffleTokensSuccess,
    raffleAddress,
    raffleBalance,
    raffleTokenAddress,
    raffleUserTokenBalance,
    txApproveTokensSuccess,
    userTokenBalancesRefetch,
    userWalletAccountBalance,
  ]);

  useEffect(() => {
    if (txApproveTokensSuccess) {
      (async () => {
        if (!enterRaffle) {
          await refetchEnterRaffle();
        }
        if (enterRaffle) {
          await enterRaffle();
        }
      })();
    }
  }, [enterRaffle, refetchEnterRaffle, txApproveTokensSuccess]);

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
          <p className={'mt-10'}>
            You have{' '}
            <span className={'text-3xl text-red-500'}>
              {formatUnits(allowance, 0)}
            </span>{' '}
            tokens approved.
          </p>
          <p className={'italic text-gray-500'}>
            When you approve tokens for the raffle to spend the amount you
            approve overwrites the prev amount.
          </p>
          <Button
            classOverrides={'mt-10'}
            disabled={!approveTokens || raffleTokenUserAddressBalance === 0n}
            onClick={async () => {
              await approveTokens?.();
            }}
          >
            Approve and Enter tokens into the Raffle
          </Button>
          <p className={'mt-10'}>
            You have entered{' '}
            <span className={'text-3xl text-red-500'}>
              {formatUnits(playerBalance, 0)}
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
