import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { parseUnits } from 'viem';
import { useRaffle } from '@/hooks/useRaffle';

export const useApproveTokens = () => {
  const { address } = useAccount();
  const { raffleAddress, raffleTokenAbi, raffleTokenAddress } = useRaffle();
  console.log(raffleTokenAddress);
  console.log(raffleAddress);
  console.log(address);
  const { config: configApprove } = usePrepareContractWrite({
    address: raffleTokenAddress,
    abi: raffleTokenAbi,
    functionName: 'increaseAllowance',
    account: address,
    args: [raffleAddress, 1n],
    gas: 1000000n,
    enabled: false,
  });

  const { isSuccess: approveTokensSuccess, write: approveTokens } =
    useContractWrite(configApprove);

  return { approveTokensSuccess, approveTokens };
};
