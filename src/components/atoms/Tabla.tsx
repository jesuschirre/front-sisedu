import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  isLoading: boolean;
  emptyMessage?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Tabla<T>({
  columns,
  data,
  rowKey,
  isLoading,
  emptyMessage = "No se encontraron resultados",
  currentPage,
  totalPages,
  onPageChange,
}: TableProps<T>) {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0_0_#111111]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left font-mono text-sm">
            <thead className="border-b-4 border-black bg-[#D4FF00] text-xs uppercase tracking-wider text-black">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={`px-5 py-4 font-black ${column.align === "right" ? "text-right" : "text-left"}`}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b-2 border-black/20">
                    {columns.map((column) => (
                      <td key={column.key} className="px-5 py-5">
                        <div className="h-4 w-3/4 animate-pulse bg-[#d9d9d9]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((row) => (
                  <tr key={rowKey(row)} className="border-b-2 border-black/20 transition-colors hover:bg-[#e8f1ff]">
                    {columns.map((column) => (
                      <td key={column.key} className={`px-5 py-5 ${column.align === "right" ? "text-right" : "text-left"}`}>
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-16 text-center font-bold text-black/60">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col gap-3 font-mono text-sm font-bold text-black sm:flex-row sm:items-center sm:justify-between">
          <p>
            Página <span className="bg-[#ffd43b] px-2 py-1">{currentPage}</span> de {totalPages}
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="border-4 border-black bg-white px-4 py-2 font-black shadow-[4px_4px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#111111] disabled:cursor-not-allowed disabled:opacity-40">
              Anterior
            </button>
            <button type="button" onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="border-4 border-black bg-[#ff6b6b] px-4 py-2 font-black shadow-[4px_4px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#111111] disabled:cursor-not-allowed disabled:opacity-40">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
