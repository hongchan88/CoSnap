import { useState } from 'react';
import { Camera } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fallback?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24'
};

export default function Avatar({
  src,
  alt = 'Profile picture',
  size = 'md',
  className = '',
  fallback = true
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setImageError(false);
    setIsLoading(false);
  };

  const showFallback = !src || imageError;

  return (
    <div
      className={`
        relative rounded-full overflow-hidden flex-shrink-0
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showFallback && fallback ? (
        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
          <Camera className="w-1/2 h-1/2 text-gray-500" />
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="w-full h-full bg-gray-200 rounded-full animate-pulse" />
          )}
          <img
            src={src || undefined}
            alt={alt}
            className={`
              w-full h-full object-cover
              ${isLoading ? 'opacity-0' : 'opacity-100'}
              transition-opacity duration-200
            `}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </>
      )}
    </div>
  );
}