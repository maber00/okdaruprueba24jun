// src/app/dashboard/components/SearchInput.tsx
'use client';
import { ChangeEvent } from 'react';
import Input from '@/app/shared/components/ui/Input';

interface SearchInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative">
      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Buscar proyectos, clientes..."
        className="w-full pl-10"
        suppressHydrationWarning
      />
    </div>
  );
}