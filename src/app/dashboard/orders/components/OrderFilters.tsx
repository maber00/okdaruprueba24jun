// src/app/dashboard/orders/components/OrderFilters.tsx

'use client';
import FiltersPanel from './FiltersPanel';
import type { OrderFilters } from '@/app/types/order';

interface OrderFiltersProps {
  filters: OrderFilters;
  onFilterChange: (filters: OrderFilters) => void;
}

export default function OrderFilters({ filters, onFilterChange }: OrderFiltersProps) {
  return (
    <FiltersPanel
      filters={filters}
      onFilterChange={onFilterChange}
    />
  );
}