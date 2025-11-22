import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border-white border-6 overflow-hidden shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
