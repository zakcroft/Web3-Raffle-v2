import { useAccount, useBalance, useContractReads } from 'wagmi';

import { useRaffle } from '@/hooks/useRaffle';
import { useEffect, useState } from 'react';

export const useUserTokenBalances = () => {
  const { address = '0x' } = useAccount();
  const { raffleAddress, raffleAbi, raffleTokenAbi, raffleTokenAddress } =
    useRaffle();

  const [dataRes, setDate] = useState([] as any);

  const raffleContract = {
    address: raffleAddress,
    abi: raffleAbi,
  };
  const raffleTokenContract = {
    address: raffleTokenAddress,
    abi: raffleTokenAbi,
  };

  const {
    data = [],
    isError,
    isLoading,
    isSuccess,
    refetch,
  } = useContractReads({
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

  useEffect(() => {
    if (isSuccess && data.length) {
      setDate(data);
    }
  }, [data, isSuccess]);

  const [balanceOfRes, allowanceRes, playerBalanceRes] = dataRes;

  const balanceOf = balanceOfRes?.result || 0n;
  const allowance = allowanceRes?.result || 0n;
  const playerBalance = playerBalanceRes?.result || 0n;

  return {
    balanceOf,
    allowance,
    playerBalance,
    isError,
    isLoading,
    userTokenBalancesRefetch: refetch,
  };
};
