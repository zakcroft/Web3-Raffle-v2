import { useBalance } from 'wagmi';

export function getAccountBalance(
  accountBalance: ReturnType<typeof useBalance>,
) {
  return accountBalance?.data?.value || 0n;
}
