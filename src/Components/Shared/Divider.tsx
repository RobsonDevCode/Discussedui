import React, { ReactNode } from 'react';

interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  children?: ReactNode;
}

const Divider: React.FC<DividerProps> = ({ 
  className = '', 
  orientation = 'horizontal', 
  children 
}) => {
  const isVertical = orientation === 'vertical';
  
  return (
    <div className={`flex items-center ${isVertical ? 'flex-col h-full' : 'w-full'} ${className}`}>
      <div 
        className={`flex-grow ${
          isVertical ? 'w-px h-full bg-gray-200' : 'h-px w-full bg-gray-200'
        }`}
      />
      {children && (
        <>
          <span className={`text-gray-500 text-sm px-3 ${isVertical ? 'py-3' : ''}`}>
            {children}
          </span>
          <div 
            className={`flex-grow ${
              isVertical ? 'w-px h-full bg-gray-200' : 'h-px w-full bg-gray-200'
            }`}
          />
        </>
      )}
    </div>
  );
};

export default Divider;