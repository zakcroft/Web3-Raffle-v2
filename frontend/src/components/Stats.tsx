import { Right } from '@/common/Layouts';

const Stats = () => {
  return (
    <Right title={'Stats'}>
      <p
        className={
          'inline-block text-xl font-black text-white pt-8 border-b border-dashed border-gray-500'
        }
      >
        Winner history{' '}
      </p>
      <ul className={'text-sm text-gray-500 italic'}>
        <li className={'italic'}>TODO</li>
        <li className={'italic'}>TODO</li>
        <li className={'italic'}>TODO</li>
      </ul>
    </Right>
  );
};

export default Stats;
