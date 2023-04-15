import { ReactNode } from 'react';

export const Main = ({ children }: { children: ReactNode }) => {
  return <div className={'flex grow flex-col lg:flex-row'}>{children}</div>;
};

export const Left = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <div className={'flex flex-col basis-3/12 pt-2 pb-8 px-8 gap-2'}>
      <h1
        className={
          'inline-block text-3xl lg:text-6xl font-black text-white lg:leading-[5.625rem] '
        }
      >
        {title}
      </h1>
      {/*<p*/}
      {/*  className={*/}
      {/*    "inline-block text-normal lg:text-xl font-normal text-white lg:mt-4 lg:leading-[2rem]"*/}
      {/*  }*/}
      {/*>*/}
      {children}
      {/*</p>*/}
    </div>
  );
};

export const Right = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className={
        'flex flex-col basis-5/12 border-l divide-y divide-gray-700 border-gray-700 lg:max-h-[621px]'
      }
    >
      {children}
    </div>
  );
};
