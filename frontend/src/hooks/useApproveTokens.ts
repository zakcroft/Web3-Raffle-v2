import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { parseUnits } from 'viem';
import { useRaffle } from '@/hooks/useRaffle';

export const useApproveTokens = () => {
  const { address } = useAccount();
  const { raffleTokenAbi, raffleTokenAddress } = useRaffle();

  const { config: configApprove } = usePrepareContractWrite({
    address: raffleTokenAddress,
    abi: raffleTokenAbi,
    functionName: 'increaseAllowance',
    account: address,
    args: ['0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', 1n],
    gas: 1000000n,
  });

  const { isSuccess: approveTokensSuccess, write: approveTokens } =
    useContractWrite(configApprove);

  return { approveTokensSuccess, approveTokens };
};
