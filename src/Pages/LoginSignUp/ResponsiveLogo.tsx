import { useState, useEffect } from 'react';

const ResponsiveLogo = () => {
    const [isVisible, setIsVisible] = useState(false);
  
    useEffect(() => {
      const checkScreenSize = () => {
        // Show logo between 200px and 1100px
        setIsVisible(window.innerWidth >= 200 && window.innerWidth <= 1100);
      };
  
      // Check initial screen size
      checkScreenSize();
  
      // Add event listener for window resize
      window.addEventListener('resize', checkScreenSize);
  
      // Cleanup listener on component unmount
      return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    if (!isVisible) return null;
    return (
     <div className="fixed top-0 left-0 w-full flex justify-center z-50  py-4"> 
        <img src="https://img.logoipsum.com/288.svg" className="w-32" alt="Logo" />
     </div>
    );
}  

export default ResponsiveLogo;