import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { parseUnits } from 'viem';
import { useRaffle } from '@/hooks/useRaffle';

export const usePickWinner = () => {
  const { address } = useAccount();
  const { raffleAbi, raffleAddress } = useRaffle();

  const { config: configPickAWinner, refetch: refetchPrepareConfigPickWinner } =
    usePrepareContractWrite({
      address: raffleAddress,
      abi: raffleAbi,
      functionName: 'pickWinner',
      account: address,
      args: [[20n]],
      enabled: false,
    });

  const { isSuccess: pickAWinnerSuccess, write: pickWinner } =
    useContractWrite(configPickAWinner);

  return { pickAWinnerSuccess, pickWinner, refetchPrepareConfigPickWinner };
};
