// src/app/components/ui/Avatar.tsx
import Image from 'next/image';
import { User } from 'lucide-react';

interface AvatarProps {
 src?: string | null;
 alt: string;
 size?: number;
 fallbackStyle?: 'user' | 'initials';
}

export default function Avatar({ 
 src, 
 alt, 
 size = 32, 
 fallbackStyle = 'user' 
}: AvatarProps) {
 // Obtenemos las iniciales del nombre para el fallback
 const initials = alt
   .split(' ')
   .map(word => word[0])
   .join('')
   .toUpperCase()
   .slice(0, 2);

 // Componente fallback
 const Fallback = () => (
   <div 
     className="rounded-full bg-gray-200 flex items-center justify-center"
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
     className="relative" 
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