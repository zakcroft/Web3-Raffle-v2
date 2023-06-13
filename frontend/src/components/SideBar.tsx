import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Left } from '@/common/Layouts';
import { Button } from '@/common/Button';
import { formatUnits } from 'viem';
import { useBuyTokens } from '@/hooks/useBuyTokens';
import { getAccountBalance } from '@/utils';
import { useRaffle } from '@/hooks/useRaffle';
import { useUserTokenBalance } from '@/hooks/useUserTokenBalance';

const SideBar = ({
  setRaffleTokenUserAddressBalance,
  raffleTokenUserAddressBalance,
}: {
  setRaffleTokenUserAddressBalance: Dispatch<SetStateAction<bigint>>;
  raffleTokenUserAddressBalance: bigint;
}) => {
  const { buyRaffleTokensSuccess, buyRaffleTokens } = useBuyTokens();

  const { raffleTokenAddress } = useRaffle();
  const raffleUserTokenBalance = useUserTokenBalance();

  useEffect(() => {
    (async () => {
      if (raffleTokenAddress || buyRaffleTokensSuccess) {
        const balance = await raffleUserTokenBalance.refetch();
        const val = getAccountBalance(balance);
        setRaffleTokenUserAddressBalance(val);
      }
    })();
  });
  return (
    <Left title={'Reserve'} description={'Buy tokens to top up your reserve.'}>
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
  );
};

export default SideBar;
