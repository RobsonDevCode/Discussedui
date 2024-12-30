import { AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ErrorAlertProps {
  isVisible: boolean;
  message: string;
}

export default function ErrorAlert({ isVisible, message }: ErrorAlertProps) {
  const [isShowing, setIsShowing] = useState<boolean>(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
    }
  }, [isVisible]);

  return isVisible ? (
    <div
      className={`
        fixed top-4 right-4 max-w-md w-full 
        bg-red-50 border-l-4 border-red-500 
        rounded-lg shadow-lg overflow-hidden
        transform transition-all duration-300 ease-in-out
        ${isShowing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
    >
      <div className="p-4 flex items-start space-x-4">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>

        <div className="flex-1 pt-0.5">
          <p className="text-sm font-medium text-red-800">
            {message}
          </p>
        </div>

        <button
          onClick={() => {
            setIsShowing(false);
            
          }}
          className="flex-shrink-0 ml-4 -mr-1.5 -mt-1.5 p-1 
            rounded-full hover:bg-red-100 
            transition-colors duration-200"
        >
          <X className="h-4 w-4 text-red-500" />
        </button>
      </div>

      <div className="h-1 bg-red-500 animate-[progress_3s_ease-in-out]" />
    </div>
  ) : null;
}