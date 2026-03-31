import { useEffect, useMemo, useState } from "react"

import { useToast } from "@/components/ui/use-toast"
import { getRetailInvestors } from "@/services/api"
import type { RetailInvestor } from "@/types/domain"

const PAGE_SIZE = 12

export function AdminInvestorsPage() {
  const [rows, setRows] = useState<RetailInvestor[]>([])
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const { showToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    getRetailInvestors(token)
      .then(setRows)
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load investors."
        showToast(message, "error")
      })
  }, [showToast])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return rows
    }
    return rows.filter((r) =>
      [r.username, r.email, r.first_name, r.last_name, r.phone, r.referral_code].join(" ").toLowerCase().includes(q)
    )
  }, [rows, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <h2 className="text-xl font-semibold text-white">Investors</h2>
      <p className="mt-1 text-sm text-slate-400">All accounts with the investor role.</p>
      <div className="mt-4">
        <input
          className="template-input w-full sm:w-96"
          placeholder="Search username, email, phone, referral code..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-300">
              <th className="px-3 py-2">Username</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Referral</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id} className="border-b border-white/10">
                <td className="px-3 py-3">{r.username}</td>
                <td className="px-3 py-3">
                  {[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-3 py-3">{r.email}</td>
                <td className="px-3 py-3">{r.phone || "—"}</td>
                <td className="px-3 py-3 font-mono text-xs">{r.referral_code}</td>
                <td className="px-3 py-3 text-xs text-slate-400">{r.date_joined?.slice(0, 10) ?? "—"}</td>
                <td className="px-3 py-3">{r.is_active ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
        <span>
          Showing {pageRows.length} of {filtered.length} investors
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
