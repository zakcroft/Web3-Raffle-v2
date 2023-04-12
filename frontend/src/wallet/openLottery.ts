import { useCallback, useState } from 'react';

import { useWeb3React } from '@web3-react/core';

import { useContracts } from './contracts';

export function useOpenLottery() {
  const { account } = useWeb3React();

  const [openLotteryTx, setTx] = useState<object>({});
  const [err, setErr] = useState('');
  const { Lottery } = useContracts();

  const openLottery = useCallback(async () => {
    try {
      const tx = await Lottery.openLottery({
        from: account,
      });
      setTx(tx);
    } catch (ex: any) {
      setErr(ex.message);
    }
  }, [Lottery, account]);

  return { openLottery, openLotteryTx, err };
}
