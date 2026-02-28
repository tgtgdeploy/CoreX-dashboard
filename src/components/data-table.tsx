import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  className?: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string }>({ data, columns, pageSize = 10, className, onRowClick, emptyMessage }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const { t } = useTranslation();
  const displayEmpty = emptyMessage || t('common.noData');
  const totalPages = Math.ceil(data.length / pageSize);
  const paged = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto -mx-1">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              {columns.map(col => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted-foreground h-8 sm:h-9",
                    col.hideOnMobile && "hidden sm:table-cell",
                    col.className
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8 text-sm">
                  {displayEmpty}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, i) => (
                <TableRow
                  key={row.id || i}
                  className={cn(
                    "border-border/30 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/30"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "py-2.5 sm:py-3 text-xs sm:text-sm",
                        col.hideOnMobile && "hidden sm:table-cell",
                        col.className
                      )}
                    >
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 px-1">
          <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">
            {page * pageSize + 1}-{Math.min((page + 1) * pageSize, data.length)} {t('common.of')} {data.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
