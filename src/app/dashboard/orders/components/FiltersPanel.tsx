// src/app/dashboard/orders/components/FiltersPanel.tsx
'use client';
import { Search, Calendar, Tag, Brain } from 'lucide-react';
import Input from '@/app/shared/components/ui/Input';
import type { OrderFilters } from '@/app/types/order';

interface FiltersPanelProps {
  filters: OrderFilters;
  onFilterChange: (filters: OrderFilters) => void;
}

export default function FiltersPanel({  filters, onFilterChange }: FiltersPanelProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Search className="h-4 w-4" />
            Buscar
          </label>
          <Input
            type="text"
            placeholder="Buscar pedidos..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({
              ...filters,
              searchTerm: e.target.value
            })}
          />
        </div>

        {/* Service Type */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Tag className="h-4 w-4" />
            Tipo de Servicio
          </label>
          <select
            className="w-full rounded-md border border-gray-300 p-2"
            value={filters.serviceType}
            onChange={(e) => onFilterChange({
              ...filters,
              serviceType: e.target.value as OrderFilters['serviceType']
            })}
          >
            <option value="all">Todos</option>
            <option value="design">Diseño</option>
            <option value="video">Video</option>
            <option value="animation">Animación</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Calendar className="h-4 w-4" />
            Rango de Fechas
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 p-2"
              onChange={(e) => onFilterChange({
                ...filters,
                dateRange: {
                  ...filters.dateRange,
                  start: e.target.value ? new Date(e.target.value) : null
                }
              })}
            />
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 p-2"
              onChange={(e) => onFilterChange({
                ...filters,
                dateRange: {
                  ...filters.dateRange,
                  end: e.target.value ? new Date(e.target.value) : null
                }
              })}
            />
          </div>
        </div>

        {/* AI Status */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Brain className="h-4 w-4" />
            Estado IA
          </label>
          <select
            className="w-full rounded-md border border-gray-300 p-2"
            value={filters.aiStatus}
            onChange={(e) => onFilterChange({
              ...filters,
              aiStatus: e.target.value as OrderFilters['aiStatus']
            })}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Proceso</option>
            <option value="completed">Completado</option>
          </select>
        </div>
      </div>
    </div>
  );
}