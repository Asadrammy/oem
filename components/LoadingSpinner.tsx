"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-2",
      fullScreen && "min-h-screen",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-blue-600",
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Loading states for different scenarios
export const PageLoading = () => (
  <LoadingSpinner 
    size="lg" 
    text="Loading page..." 
    fullScreen 
  />
);

export const DataLoading = ({ text = "Loading data..." }: { text?: string }) => (
  <LoadingSpinner 
    size="md" 
    text={text} 
  />
);

export const ButtonLoading = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex items-center gap-2">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>{text}</span>
  </div>
);

export default LoadingSpinner;
