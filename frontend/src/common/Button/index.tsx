import { useEffect, useState } from "react";

import { twMerge } from "tailwind-merge";

import type { IButton, IColours } from "./types";

const classTypes: {
  [key: string]: {
    base: string;
    active: string;
    disabled?: string;
    colour: IColours;
  };
} = {
  button: {
    base: `min-w-[120px] font-medium rounded-lg text-sm px-5 py-2.5 text-center`,
    active: "focus:ring-2 focus:outline-none",
    disabled: "cursor-not-allowed",
    colour: {
      white: {
        base: `focus:ring-2 focus:outline-none`,
        active: `text-black focus:ring-primary-300 bg-white hover:text-blue-700 hover:bg-white focus:bg-white focus:ring-blue-500`,
        disabled: ``,
      },
      silver: {
        base: "focus:ring-2 focus:outline-none",
        active:
          "text-black bg-gray-300 hover:bg-gray-400 focus:ring-silver-300 hover:text-silver-700 focus:bg-silver-300 focus:ring-silver-500",
        disabled: "text-gray-500 bg-gray-200 cursor-not-allowed",
      },
    },
  },
  link: {
    base: `text-sm `,
    active: "",
    disabled: "cursor-not-allowed",
    colour: {
      white: {
        base: ``,
        active: `text-primary-500 hover:underline text-white`,
        disabled: `text-gray-400 text-gray-500 `,
      },
      silver: {
        base: ``,
        active: ``,
        disabled: ``,
      },
    },
  },
};

export const Button = ({
  type = "button",
  className = "",
  classOverrides = "",
  classType = "button",
  colour = "silver",
  children,
  disabled,
  isLoading,
  ...rest
}: IButton) => {
  const [showRequestDelayFeedback, setShowRequestDelayFeedback] =
    useState<boolean>(false);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowRequestDelayFeedback(true);
      }, 1000);
    } else if (!isLoading) {
      setShowRequestDelayFeedback(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const classes = classTypes[classType];
  const classBases = classes["base"];

  const defaultClasses =
    disabled || isLoading ? classes["disabled"] : classes["active"];

  const classColour = classes["colour"][colour];
  const classColourBases = classColour["base"];
  const defaultColourClasses =
    disabled || isLoading ? classColour["disabled"] : classColour["active"];

  return (
    <button
      disabled={disabled || isLoading}
      type={type}
      className={
        className ||
        twMerge(
          classBases,
          defaultClasses,
          classColourBases,
          defaultColourClasses,
          classOverrides
        )
      }
      {...rest}
    >
      {children} {showRequestDelayFeedback ? "..." : ""}
    </button>
  );
};
