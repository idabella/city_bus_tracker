import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Search, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import React from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

// ✅ CHANGEMENT PRINCIPAL : Suppression de la contrainte { id: string }
export function Table<T extends Record<string, any>>({
  data,
  columns,
  onEdit,
  onDelete,
  searchable = true,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data found',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filteredData = searchable
    ? data.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : data;

  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const aVal = String((a as any)[sortKey]);
        const bVal = String((b as any)[sortKey]);
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      })
    : filteredData;

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const getValue = (item: T, key: string): any => {
    try {
      const value = key.split('.').reduce((obj: any, k) => obj?.[k], item);
      // Handle null, undefined, or non-renderable values
      if (value === null || value === undefined) return '-';
      // If it's an object (but not a React element), stringify it
      if (typeof value === 'object' && !React.isValidElement(value)) {
        return JSON.stringify(value);
      }
      return value;
    } catch (error) {
      console.error(`Error getting value for key ${key}:`, error);
      return '-';
    }
  };

  // ✅ Fonction pour obtenir un identifiant unique
  const getItemKey = (item: T, index: number): string => {
    // Essaie d'utiliser id_city, puis id, puis l'index
    return String(item.id_city || item.id || index);
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortKey === column.key && (
                        <span>
                          {sortOrder === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-700 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <motion.tr
                    key={getItemKey(item, index)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {columns.map((column) => {
                      let content: React.ReactNode = '-';
                      try {
                        if (column.render) {
                          const rendered = column.render(item);
                          // Check if rendered is valid
                          if (rendered !== null && rendered !== undefined) {
                            // Check if it's a valid React element or primitive
                            if (React.isValidElement(rendered) || typeof rendered !== 'object') {
                              content = rendered;
                            } else {
                              // If it's an object that's not a React element, try to stringify
                              content = String(rendered);
                            }
                          }
                        } else {
                          content = getValue(item, String(column.key));
                        }
                      } catch (error) {
                        console.error(`Error rendering column ${String(column.key)} for item:`, error, item);
                        content = '-';
                      }
                      return (
                        <td key={String(column.key)} className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {content}
                        </td>
                      );
                    })}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="text-blue-600 dark:text-blue-400 transition-colors hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="text-red-600 dark:text-red-400 transition-colors hover:text-red-800 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of{' '}
              {sortedData.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status, type = 'default' }: { status: string; type?: string }) {
  const colors: Record<string, Record<string, string>> = {
    default: {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      maintenance: 'bg-orange-100 text-orange-800',
    },
    severity: {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    },
    trip: {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    },
  };

  const colorMap = colors[type] || colors.default;
  const color = colorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}