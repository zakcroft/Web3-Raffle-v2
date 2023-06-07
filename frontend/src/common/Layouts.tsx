import { ReactNode } from 'react';

export const Main = ({ children }: { children: ReactNode }) => {
  return (
    <main className={'flex grow flex-col lg:flex-row h-full'}>{children}</main>
  );
};

export const Left = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={
        'flex flex-col basis-3/12 pt-2 pb-8 px-8 gap-6 border-r border-gray-500'
      }
    >
      <h1
        className={
          'inline-block text-3xl  font-black text-white lg:leading-[5.625rem] border-b border-solid border-gray-500 italic'
        }
      >
        {title}
      </h1>
      {children}
    </div>
  );
};

export const Right = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={
        'flex flex-col basis-2/12 pt-2 pb-8 px-8 gap-2 border-l border-gray-500'
      }
    >
      <h1
        className={
          'inline-block text-3xl italic font-black text-white lg:leading-[5.625rem] border-b border-solid border-gray-500'
        }
      >
        {title}
      </h1>
      {children}
    </div>
  );
};
