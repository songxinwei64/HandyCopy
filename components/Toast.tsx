import React from 'react';

interface ToastProps {
  message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <div className="bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-stone-800">
      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shrink-0">
        <i className="fas fa-check text-[10px]" />
      </div>
      <span className="text-sm font-semibold">{message}</span>
    </div>
  );
};

export default Toast;
