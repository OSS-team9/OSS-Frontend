import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`p-2 rounded-2xl bg-white shadow-lg ${className}`}>
      {children}
    </div>
  );
}
