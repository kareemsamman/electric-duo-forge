import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
}

export const AnimatedCard = ({ children, className = "" }: AnimatedCardProps) => {
  // Removed hover animations - cards are not clickable
  return (
    <div className={className}>
      {children}
    </div>
  );
};
