import React from 'react';
import { AlertTriangle, CheckCircle, XOctagon, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const typeClasses = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };
  
  const iconColor = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };
  
  const Icon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className={iconColor[type]} size={20} />;
      case 'error':
        return <XOctagon className={iconColor[type]} size={20} />;
      case 'warning':
        return <AlertTriangle className={iconColor[type]} size={20} />;
      case 'info':
        return <Info className={iconColor[type]} size={20} />;
      default:
        return null;
    }
  };
  
  return (
    <div className={`rounded-md border px-4 py-3 mb-4 flex items-center justify-between ${typeClasses[type]}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          <Icon />
        </div>
        <div>{message}</div>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-auto focus:outline-none"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;