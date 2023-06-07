import { useEffect, useState } from 'react';
import { useNetwork, Address } from 'wagmi';

interface contractAddressesInterface {
  readonly [key: number]: ReadonlyArray<string>;
}

import { raffleAbi, raffleTokenAbi, contractAddresses } from '@/abis';

export const useRaffle = () => {
  const [raffleAddress, setRaffleAddress] = useState<Address>();
  const [raffleTokenAddress, setRaffleTokenAddress] = useState<Address>();
  const { chain } = useNetwork();
  const addresses: contractAddressesInterface = contractAddresses;

  useEffect(() => {
    if (chain?.id) {
      const [raffleAddress, raffleTokenAddress] = addresses[chain?.id];
      setRaffleAddress(raffleAddress as Address);
      setRaffleTokenAddress(raffleTokenAddress as Address);
    }
  }, [addresses, chain]);

  return {
    raffleAbi,
    raffleTokenAbi,
    raffleAddress,
    raffleTokenAddress,
  } as const;
};
