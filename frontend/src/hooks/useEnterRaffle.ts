import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { parseUnits } from 'viem';
import { useRaffle } from '@/hooks/useRaffle';
import { useUserTokenBalances } from '@/hooks/useAllUserBalances';

export const useEnterRaffle = () => {
  const { address } = useAccount();
  const { raffleAbi, raffleAddress } = useRaffle();
  const { allowance } = useUserTokenBalances();

  const { config: configEnterRaffle, refetch:refetchEnterRaffle  } = usePrepareContractWrite({
    address: raffleAddress,
    abi: raffleAbi,
    functionName: 'enterRaffle',
    account: address,
    args: [allowance],
    enabled: false,
  });

  const { isSuccess: enterRaffleSuccess, write: enterRaffle } =
    useContractWrite(configEnterRaffle);

  return { enterRaffleSuccess, enterRaffle, refetchEnterRaffle };
};
