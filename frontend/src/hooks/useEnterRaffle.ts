import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { parseUnits } from 'viem';
import { useRaffle } from '@/hooks/useRaffle';

export const useEnterRaffle = () => {
  const { address } = useAccount();
  const { raffleAbi, raffleAddress } = useRaffle();

  const { config: configEnterRaffle } = usePrepareContractWrite({
    address: raffleAddress,
    abi: raffleAbi,
    functionName: 'enterRaffle',
    account: address,
    args: [1n],
    enabled: false,
  });

  const { isSuccess: enterRaffleSuccess, write: enterRaffle } =
    useContractWrite(configEnterRaffle);

  return { enterRaffleSuccess, enterRaffle };
};
