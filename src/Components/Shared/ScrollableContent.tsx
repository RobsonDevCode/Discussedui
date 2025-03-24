import React from 'react';

interface ScrollableContentProps {
  children: React.ReactNode;
  className?: string;
  enableScrollOnCondition?: boolean;
}

const ScrollableContent: React.FC<ScrollableContentProps> = ({ 
  children, 
  className = "", 
  enableScrollOnCondition = true 
}) => {
  return (
    <div 
      className={`${className}`}
      style={{
        overflowY: enableScrollOnCondition ? 'auto' : 'visible',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(75, 85, 99, 0.3) transparent',
        msOverflowStyle: 'none' // IE and Edge
      }}
    >
      {children}
    </div>
  );
};

export default ScrollableContent;