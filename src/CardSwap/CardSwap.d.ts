import type { CSSProperties, ForwardRefExoticComponent, HTMLAttributes, ReactNode, RefAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  customClass?: string;
  style?: CSSProperties;
}

export const Card: ForwardRefExoticComponent<CardProps & RefAttributes<HTMLDivElement>>;

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  skewAmount?: number;
  easing?: "linear" | "elastic";
  children: ReactNode;
}

declare const CardSwap: (props: CardSwapProps) => JSX.Element;
export default CardSwap;
