import React, { ReactNode } from 'react';

interface RowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Row: React.FC<RowProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`flex items-center w-full ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Row;
