import { ComponentPropsWithoutRef } from 'react';

export interface IButton extends ComponentPropsWithoutRef<'button'> {
  classType?: keyof IClassType;
  colour?: keyof IColours;
  classOverrides?: string;
  isLoading?: boolean;
}

export interface IClassType {
  button: IButtonStates & IColours;
  link: IButtonStates & IColours;
}

export interface IButtonStates {
  base: string;
  active: string;
  disabled?: string;
}

export interface IColours {
  white: IButtonStates;
  silver: IButtonStates;
}
