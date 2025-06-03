import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'medium', 
  color = 'blue-600', 
  fullScreen = false,
  text
}) => {
  // Size mappings
  const sizeMap = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const spinnerSize = sizeMap[size];
  
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={`border-4 border-gray-200 border-t-${color} rounded-full ${spinnerSize} animate-spin`}></div>
      {text && <p className="mt-3 text-gray-600">{text}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};

export default Loader;