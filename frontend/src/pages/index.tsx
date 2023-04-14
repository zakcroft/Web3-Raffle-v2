import { useEffect, useState } from "react";

import { useEvmNativeBalance } from "@moralisweb3/next";
import { Inter } from "next/font/google";

import { Button } from "../common/Button";

import { ConnectKitButton } from "connectkit";

import {
  useAccount,
  useBalance,
  useNetwork,
  useContractReads,
  usePrepareContractWrite,
  useContractWrite,
  useContract,
} from "wagmi";

import styles from "@/styles/Home.module.css";
import { useRaffle } from "@/hooks/useRaffle";
import { ethers } from "ethers";
import { Left, Main } from "@/common/Layouts";

const inter = Inter({ subsets: ["latin"] });

export default function App() {
  //const [raffleTokenAddressBalance, setUpdateCounter] = useState(0);

  const { raffleAbi, raffleAddress, raffleTokenAbi, raffleTokenAddress } =
    useRaffle();
  const { address } = useAccount();

  const accountBalance = useBalance({
    address,
  });

  const raffleBalance = useBalance({
    address: raffleAddress,
  });

  const { data: raffleTokenAddressBalanceData, refetch } = useBalance({
    address: address,
    token: raffleTokenAddress,
  });

  const tokenCost = ethers.utils.parseUnits("0.1", "ether");

  const { config } = usePrepareContractWrite({
    address: raffleAddress,
    abi: raffleAbi,
    functionName: "buyRaffleTokens",
    overrides: {
      from: address,
      value: tokenCost,
    },
  });

  const { data: writeData, isSuccess, write } = useContractWrite(config);

  useEffect(() => {
    if (isSuccess) {
      console.log(writeData);
      refetch().then((data) => {
        console.log("refetch", data);
      });
    }
  }, [isSuccess, refetch, writeData]);

  // console.log(raffleBalance.data);
  // console.log(accountBalance.data);
  // console.log(config);
  // console.log(write);
  // const chainId: string = parseInt(chainIdHex!).toString()
  // const { data: nativeBalance } = useEvmNativeBalance({ raffleAddress });
  // const raffleTokenContract = useContract({
  //   address: raffleTokenAddress,
  //   abi: raffleTokenAbi,
  // });

  //raffleTokenContract.balanceOf(account);

  console.log(raffleTokenAddressBalanceData?.value.toString());

  return (
    <>
      <Main>
        <header className={"flex justify-between p-8"}>
          <h3>Raffle: {raffleAddress}</h3>
          <h3>DECENTRALIZED RAFFLE</h3>
          <ConnectKitButton />
        </header>
        <Left title={"info"}>
          STASH: {raffleTokenAddressBalanceData?.value.toString()}
          {/*<h3>Native Balance: {nativeBalance?.balance.ether} ETH</h3>*/}
          <Button disabled={!write} onClick={() => write?.()}>
            Buy Raffle Tokens
          </Button>
        </Left>
      </Main>
    </>
  );
}
