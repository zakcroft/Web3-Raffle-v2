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

  const { data, isError, isLoading } = useContractReads({
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

  return { data, isError, isLoading };
};
