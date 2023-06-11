import { useEffect, useState } from 'react';
import { useNetwork, Address } from 'wagmi';

interface contractAddressesInterface {
  readonly [key: number]: ReadonlyArray<Address>;
}

import { raffleAbi, raffleTokenAbi, contractAddresses } from '@/abis';

export const useRaffle = () => {
  const addresses: contractAddressesInterface = contractAddresses;
  const [deafultRaffleAddress, defaultRaffleTokenAddress] = addresses[31337];
  const [raffleAddress, setRaffleAddress] =
    useState<Address>(deafultRaffleAddress);
  const [raffleTokenAddress, setRaffleTokenAddress] = useState<Address>(
    defaultRaffleTokenAddress,
  );
  const { chain } = useNetwork();

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
