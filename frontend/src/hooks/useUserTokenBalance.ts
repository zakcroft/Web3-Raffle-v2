import { useAccount, useBalance } from 'wagmi';

import { useRaffle } from '@/hooks/useRaffle';
import { useMemo } from 'react';

export const useUserTokenBalance = () => {
  const { address } = useAccount();
  const { raffleTokenAddress } = useRaffle();

  const res = useBalance({
    address: address,
    token: raffleTokenAddress,
    enabled: false,
  });

  return useMemo(() => {
    return res;
  }, [res]);
};
