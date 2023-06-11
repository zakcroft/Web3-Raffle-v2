import {
  useAccount,
  useBalance,
  useBlockNumber,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { useRaffle } from '@/hooks/useRaffle';

export const useApproveTokens = () => {
  const { address } = useAccount();
  const { raffleAddress, raffleTokenAbi, raffleTokenAddress } = useRaffle();

  const { config: configApprove } = usePrepareContractWrite({
    address: raffleTokenAddress,
    abi: raffleTokenAbi,
    functionName: 'approve',
    account: address,
    args: [raffleAddress, 1n],
  });

  const {
    isSuccess: approveTokensSuccess,
    write: approveTokens,
    data: approveTokensData,
  } = useContractWrite(configApprove);

  const { data: d, isSuccess: txApproveTokensSuccess } = useWaitForTransaction({
    hash: approveTokensData?.hash,
    confirmations: 1,
    enabled: approveTokensSuccess,
  });

  return { txApproveTokensSuccess, approveTokens, approveTokensData };
};
