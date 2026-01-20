"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    PaginationState,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { cn } from "@/lib/utils";

interface ServerPaginationProps {
    /** Current page (1-indexed) */
    pageIndex: number;
    /** Items per page */
    pageSize: number;
    /** Total number of items */
    rowCount: number;
    /** Total number of pages */
    pageCount: number;
    /** Callback when page changes */
    onPageChange: (page: number) => void;
    /** Callback when page size changes */
    onPageSizeChange: (pageSize: number) => void;
}

interface DataTableAdvancedProps<TData, TValue> {
    /** Column definitions */
    columns: ColumnDef<TData, TValue>[];
    /** Table data */
    data: TData[];
    /** Search key for filtering (column accessor) */
    searchKey?: string;
    /** Search placeholder text */
    searchPlaceholder?: string;
    /** Enable pagination (default: true) */
    enablePagination?: boolean;
    /** Server-side pagination props - when provided, uses server-side pagination */
    serverPagination?: ServerPaginationProps;
    /** Show row numbers column */
    showRowNumbers?: boolean;
    /** Custom class for table header row */
    headerClassName?: string;
    /** Custom class for table container */
    className?: string;
    /** Default page size for client-side pagination */
    defaultPageSize?: number;
    /** Empty state message */
    emptyMessage?: string;
}

/**
 * DataTableAdvanced - An enhanced data table with flexible pagination support
 * 
 * Features:
 * - Client-side or server-side pagination
 * - Optional search/filter
 * - Optional row numbers
 * - Consistent header styling
 * - Sorting support
 */
export function DataTableAdvanced<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Cari...",
    enablePagination = true,
    serverPagination,
    showRowNumbers = false,
    headerClassName = "bg-muted/50",
    className,
    defaultPageSize = 10,
    emptyMessage = "Tidak ada data.",
}: DataTableAdvancedProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: defaultPageSize,
    });

    const isServerPagination = !!serverPagination;

    // Add row number column if enabled
    const columnsWithRowNumber = React.useMemo(() => {
        if (!showRowNumbers) return columns;

        const rowNumberColumn: ColumnDef<TData, TValue> = {
            id: "_rowNumber",
            header: "#",
            cell: ({ row }) => {
                const baseIndex = isServerPagination
                    ? (serverPagination!.pageIndex - 1) * serverPagination!.pageSize
                    : pagination.pageIndex * pagination.pageSize;
                return <span className="text-muted-foreground font-mono text-sm">{baseIndex + row.index + 1}</span>;
            },
            size: 50,
        };

        return [rowNumberColumn, ...columns];
    }, [columns, showRowNumbers, isServerPagination, serverPagination, pagination]);

    const table = useReactTable({
        data,
        columns: columnsWithRowNumber,
        getCoreRowModel: getCoreRowModel(),
        // Only use client-side pagination if no server pagination
        ...(enablePagination && !isServerPagination && {
            getPaginationRowModel: getPaginationRowModel(),
        }),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            pagination,
        },
        // For server-side, we need manual pagination
        ...(isServerPagination && {
            manualPagination: true,
            pageCount: serverPagination.pageCount,
        }),
    });

    // Calculate client-side pagination info
    const clientPaginationInfo = React.useMemo(() => {
        if (isServerPagination) return null;
        const rowCount = table.getFilteredRowModel().rows.length;
        const pageCount = Math.ceil(rowCount / pagination.pageSize);
        return {
            pageIndex: pagination.pageIndex + 1, // Convert to 1-indexed
            pageSize: pagination.pageSize,
            rowCount,
            pageCount,
        };
    }, [isServerPagination, table, pagination]);

    return (
        <div className={cn("w-full", className)}>
            {/* Search */}
            {searchKey && (
                <div className="flex items-center p-4 border-b">
                    <Input
                        placeholder={searchPlaceholder}
                        value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(searchKey)?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                </div>
            )}

            {/* Table */}
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className={headerClassName}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columnsWithRowNumber.length}
                                className="h-24 text-center text-muted-foreground"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {enablePagination && (
                <div className="border-t p-4">
                    {isServerPagination ? (
                        <DataTablePagination
                            pageIndex={serverPagination.pageIndex}
                            pageSize={serverPagination.pageSize}
                            rowCount={serverPagination.rowCount}
                            pageCount={serverPagination.pageCount}
                            onPageChange={serverPagination.onPageChange}
                            onPageSizeChange={serverPagination.onPageSizeChange}
                        />
                    ) : clientPaginationInfo && clientPaginationInfo.pageCount > 1 && (
                        <DataTablePagination
                            pageIndex={clientPaginationInfo.pageIndex}
                            pageSize={clientPaginationInfo.pageSize}
                            rowCount={clientPaginationInfo.rowCount}
                            pageCount={clientPaginationInfo.pageCount}
                            onPageChange={(page) => table.setPageIndex(page - 1)}
                            onPageSizeChange={(size) => table.setPageSize(size)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
