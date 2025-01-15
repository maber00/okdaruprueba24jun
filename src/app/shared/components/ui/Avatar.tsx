// src/app/shared/components/ui/Avatar.tsx
import Image from 'next/image';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  fallbackStyle?: 'user' | 'initials';
}

export default function Avatar({ 
  src, 
  alt, 
  size = 32, 
  className = '',
  fallbackStyle = 'user' 
}: AvatarProps) {
  const initials = alt
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const Fallback = () => (
    <div 
      className={`rounded-full bg-gray-200 flex items-center justify-center ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {fallbackStyle === 'user' ? (
        <User 
          className="text-gray-500"
          style={{ width: `${size/2}px`, height: `${size/2}px` }}
        />
      ) : (
        <span className="text-gray-500 font-medium" style={{ fontSize: `${size/2.5}px` }}>
          {initials}
        </span>
      )}
    </div>
  );

  if (!src) {
    return <Fallback />;
  }

  return (
    <div 
      className={`relative ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="rounded-full object-cover"
        onError={() => <Fallback />}
        sizes={`${size}px`}
      />
    </div>
  );
}