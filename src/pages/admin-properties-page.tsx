import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { getProperties } from "@/services/api"
import type { Property } from "@/types/domain"

const PAGE_SIZE = 12

export function AdminPropertiesPage() {
  const [rows, setRows] = useState<Property[]>([])
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const { showToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    getProperties({ pageSize: 200, token })
      .then(setRows)
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load properties."
        showToast(message, "error")
      })
  }, [showToast])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return rows
    }
    return rows.filter((p) =>
      [p.title, p.slug, p.location_name, p.status, p.property_type].join(" ").toLowerCase().includes(q)
    )
  }, [rows, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <h2 className="text-xl font-semibold text-white">Properties</h2>
      <p className="mt-1 text-sm text-slate-400">All listings on the platform (read-only here).</p>
      <div className="mt-4">
        <input
          className="template-input w-full sm:w-96"
          placeholder="Search title, slug, location, type..."
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
              <th className="px-3 py-2">Image</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Sale mode</th>
              <th className="px-3 py-2">Rep ID</th>
              <th className="px-3 py-2">Public</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((p) => (
              <tr key={p.id} className="border-b border-white/10">
                <td className="px-3 py-3">
                  {p.top_view_image ? (
                    <img src={p.top_view_image} alt="" className="h-10 w-14 rounded object-cover" />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-3">{p.title}</td>
                <td className="px-3 py-3 capitalize">{p.property_type}</td>
                <td className="px-3 py-3">{p.location_name}</td>
                <td className="px-3 py-3 capitalize">{p.status}</td>
                <td className="px-3 py-3 text-xs capitalize text-slate-300">{p.land_sale_mode.replace(/_/g, " ")}</td>
                <td className="px-3 py-3 text-xs">{p.representative ?? "—"}</td>
                <td className="px-3 py-3">
                  <Link
                    to={`/properties/${p.id}`}
                    className="text-emerald-400 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
        <span>
          Showing {pageRows.length} of {filtered.length} properties
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((n) => Math.max(1, n - 1))}
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
            onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
            className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
