import { useBalance } from 'wagmi';

export function getAccountBalance(
  accountBalance: Partial<Omit<ReturnType<typeof useBalance>, 'data'>> &
    Pick<ReturnType<typeof useBalance>, 'data'>,
) {
  return accountBalance?.data?.value || 0n;
}
