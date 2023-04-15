import { useEffect, useState } from 'react';
import { useNetwork, Address } from 'wagmi';

interface contractAddressesInterface {
  [key: number]: string[];
}

import { raffleAbi, raffleTokenAbi, contractAddresses } from '../constants';

export const useRaffle = () => {
  const [raffleAddress, setRaffleAddress] = useState<Address>(`0x` as Address);
  const [raffleTokenAddress, setRaffleTokenAddress] = useState<Address>(
    `0x` as Address,
  );
  const { chain } = useNetwork();
  const addresses: contractAddressesInterface = contractAddresses;

  useEffect(() => {
    if (chain?.id) {
      const [raffleAddress, raffleTokenAddress] = addresses[chain?.id];
      setRaffleAddress(raffleAddress as Address);
      setRaffleTokenAddress(raffleTokenAddress as Address);
    }
  }, [addresses, chain]);

  return { raffleAbi, raffleTokenAbi, raffleAddress, raffleTokenAddress };
};
