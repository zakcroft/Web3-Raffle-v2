import { formatUnits } from 'viem';
import { ConnectKitButton } from 'connectkit';
import { useRaffle } from '@/hooks/useRaffle';
import { NextPage } from 'next';

const Header: NextPage<{
  raffleAddressBalance: bigint;
  userWalletBalance: bigint;
}> = ({ raffleAddressBalance, userWalletBalance }) => {
  const { raffleAddress } = useRaffle();
  return (
    <header
      className={'grid grid-cols-3 pt-8 px-12 pb-2 border-b border-gray-500'}
    >
      <div className={'flex flex-col items-center col-start-2'}>
        <h3 className={'text-2xl font-black'}>DECENTRALIZED RAFFLE</h3>
        <h3 className={'text-sm text-gray-500 italic'}>
          Address : {raffleAddress}
        </h3>
        <h1
          className={
            'inline-block text-3xl font-black text-white lg:leading-[5.625rem] '
          }
        >
          Jackpot: {formatUnits(raffleAddressBalance, 18)} ETH
        </h1>
        <p> Countdown to draw.</p>
      </div>
      <div className={'justify-self-end flex flex-col'}>
        <ConnectKitButton />
        <h1
          className={
            'inline-block text-normal font-black text-gray-300 italic mt-3'
          }
        >
          Wallet balance:{' '}
          {Number(formatUnits(userWalletBalance, 18)).toFixed(2)}
        </h1>
      </div>
    </header>
  );
};

export default Header;
