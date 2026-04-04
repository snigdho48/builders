type DashboardTablePaginationProps = {
  page: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (nextPage: number) => void
  className?: string
}

export function DashboardTablePagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  className,
}: DashboardTablePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotalPages)
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, totalItems)

  return (
    <div className={`flex items-center justify-between gap-3 text-xs text-slate-400 ${className ?? ""}`.trim()}>
      <span>
        Showing {start}-{end} of {totalItems}
      </span>
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          className="rounded border border-white/20 px-2 py-1 disabled:opacity-40"
          disabled={safePage <= 1}
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
        >
          Previous
        </button>
        <span>
          Page {safePage} / {safeTotalPages}
        </span>
        <button
          type="button"
          className="rounded border border-white/20 px-2 py-1 disabled:opacity-40"
          disabled={safePage >= safeTotalPages}
          onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
        >
          Next
        </button>
      </div>
    </div>
  )
}
