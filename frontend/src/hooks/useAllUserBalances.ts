import { useAccount, useBalance, useContractReads } from 'wagmi';

import { useRaffle } from '@/hooks/useRaffle';

export const useUserTokenBalances = () => {
  const { address = '0x' } = useAccount();
  const { raffleAddress, raffleAbi, raffleTokenAbi, raffleTokenAddress } =
    useRaffle();

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

  console.log(data);

  const [balanceOfRes, allowanceRes, playerBalanceRes] = data;

  const balanceOf = balanceOfRes?.result || 0n;
  const allowance = allowanceRes?.result || 0n;
  const playerBalance = playerBalanceRes?.result || 0n;

  return { balanceOf, allowance, playerBalance, isError, isLoading };
};
