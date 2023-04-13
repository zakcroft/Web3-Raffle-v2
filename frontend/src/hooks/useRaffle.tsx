import { useEffect, useState } from "react";
import { useNetwork, Address } from "wagmi";

interface contractAddressesInterface {
  [key: number]: string[];
}

import { abi, contractAddresses } from "../constants";

export const useRaffle = () => {
  // type Address = `0x${string}`;
  const [raffleAddress, setRaffleAddress] = useState<Address>(`0x` as Address);
  const addresses: contractAddressesInterface = contractAddresses;
  const { chain } = useNetwork();

  useEffect(() => {
    if (chain?.id) {
      const raffleAddress = addresses[chain?.id][0] as Address;
      if (raffleAddress) {
        setRaffleAddress(raffleAddress);
      }
    }
  }, [addresses, chain]);

  return { abi, raffleAddress };
};
