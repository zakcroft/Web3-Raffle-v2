import {useAccount, useContractWrite, usePrepareContractWrite} from "wagmi";
import {parseUnits} from "viem";
import {useRaffle} from "@/hooks/useRaffle";

export const useBuyTokens = () => {

    const tokenCost = parseUnits('0.1', 18);
    const { address } = useAccount();
    const { raffleAbi, raffleAddress, raffleTokenAbi, raffleTokenAddress } =
        useRaffle();

    const { config: configBuyRaffleTokens } = usePrepareContractWrite({
        address: raffleAddress,
        abi: raffleAbi,
        functionName: 'buyRaffleTokens',
        account: address,
        value: tokenCost,
    });

    return useContractWrite(configBuyRaffleTokens);
}