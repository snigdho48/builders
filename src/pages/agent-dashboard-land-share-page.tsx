import { useCallback, useEffect, useMemo, useState } from "react"

import { DashboardModal, dashboardModalFieldClass, dashboardModalFieldClassTight } from "@/components/dashboard/dashboard-modal"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { useToast } from "@/components/ui/use-toast"
import { createLandShareListing, getLandShareListingsPaged, updateLandShareListing } from "@/services/api"
import type { LandShareListing, LandShareListingUpsertPayload, PropertyKind } from "@/types/domain"
import { propertyPrimaryPriceLine } from "@/utils/property-display"

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
}

export function AgentDashboardLandSharePage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<LandShareListing[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<LandShareListing | null>(null)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    property_type: "land" as PropertyKind,
    land_price: "",
    location_name: "",
    land_area_sqft: "",
    description: "",
    description_secondary: "",
    amenities_text: "",
    top_view_image: "",
    assigned_agent: "" as string,
    listing_active: true,
    status: "available" as LandShareListing["status"],
    payment_rows: [] as Array<{ amount: string }>,
  })
  const [saving, setSaving] = useState(false)
  const [tableSearch, setTableSearch] = useState("")
  const [tableActive, setTableActive] = useState<"all" | "yes" | "no">("all")
  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      const { items } = await getLandShareListingsPaged({
        pageSize: 200,
        includeInactive: true,
        managedByMe: true,
      })
      setRows(items)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setEditing(null)
    setForm({
      title: "",
      slug: "",
      property_type: "land",
      land_price: "",
      location_name: "",
      land_area_sqft: "",
      description: "",
      description_secondary: "",
      amenities_text: "",
      top_view_image: "",
      assigned_agent: "",
      listing_active: true,
      status: "available",
      payment_rows: [{ amount: "20000" }, { amount: "50000" }],
    })
    setModalOpen(true)
  }

  function openEdit(p: LandShareListing) {
    setEditing(p)
    setForm({
      title: p.title,
      slug: p.slug,
      property_type: p.property_type,
      land_price: p.land_price,
      location_name: p.location_name,
      land_area_sqft: p.land_area_sqft != null ? String(p.land_area_sqft) : "",
      description: p.description,
      description_secondary: p.description_secondary,
      amenities_text: (p.amenities ?? []).join("\n"),
      top_view_image: p.top_view_image,
      assigned_agent: p.assigned_agent != null ? String(p.assigned_agent) : "",
      listing_active: p.listing_active,
      status: p.status,
      payment_rows:
        (p.payment_options ?? []).length > 0
          ? p.payment_options.map((t) => ({
              amount: t.amount,
            }))
          : [{ amount: "20000" }, { amount: "50000" }],
    })
    setModalOpen(true)
  }

  async function save() {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    if (!form.title.trim() || !form.location_name.trim() || !form.land_price.trim()) {
      showToast("Title, location, and reference price are required.", "error")
      return
    }
    const payment_options = form.payment_rows
      .map((r) => {
        const amount = r.amount.trim()
        if (!amount) return null
        const o: { amount: string; billing_period: "monthly" } = {
          amount,
          billing_period: "monthly",
        }
        return o
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
    setSaving(true)
    try {
      const slug = form.slug.trim() || slugify(form.title)
      const amenities = form.amenities_text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
      const payload: LandShareListingUpsertPayload = {
        title: form.title.trim(),
        slug,
        property_type: form.property_type,
        land_price: form.land_price.trim(),
        payment_options,
        location_name: form.location_name.trim(),
        land_area_sqft: form.land_area_sqft.trim() ? Math.max(0, Math.floor(Number(form.land_area_sqft))) : null,
        description: form.description,
        description_secondary: form.description_secondary,
        amenities,
        top_view_image: form.top_view_image.trim(),
        listing_active: form.listing_active,
        status: form.status,
      }
      if (editing) {
        await updateLandShareListing(editing.id, payload, token)
        showToast("Land share listing updated.", "success")
      } else {
        await createLandShareListing(payload, token)
        showToast("Land share listing created.", "success")
      }
      setModalOpen(false)
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Save failed", "error")
    } finally {
      setSaving(false)
    }
  }

  const filteredRows = useMemo(() => {
    let list = rows
    if (tableActive === "yes") {
      list = list.filter((p) => p.listing_active)
    } else if (tableActive === "no") {
      list = list.filter((p) => !p.listing_active)
    }
    const q = tableSearch.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location_name.toLowerCase().includes(q) ||
          (p.assigned_agent_name?.toLowerCase().includes(q) ?? false) ||
          String(p.id).includes(q),
      )
    }
    return list
  }, [rows, tableSearch, tableActive])

  const tableSelectClass = "h-9 w-full text-xs leading-9"

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-white">My land share listings</h2>
          <p className="text-sm text-slate-400">Update payment tiers and copy for listings assigned to you.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-[#f58e43] px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Add land share
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <>
          <div className="dashboard-filters-row">
            <input
              className="dashboard-filter-input min-w-[200px] flex-1"
              placeholder="Search title, location, agent, ID…"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              aria-label="Search land share listings"
            />
            <div className="dashboard-filter-group min-w-[120px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Active</span>
              <div className="dashboard-filter-select-shell">
                <CompactFormSelect
                  ariaLabel="Filter by listing active"
                  className={tableSelectClass}
                  value={tableActive}
                  onValueChange={(v) => setTableActive(v as "all" | "yes" | "no")}
                  options={[
                    { value: "all", label: "All" },
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-[720px] w-full border-collapse text-left text-sm text-slate-200">
              <thead className="border-b border-white/10 bg-white/4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 align-middle">Title</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Tiers</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Price</th>
                  <th className="px-4 py-3 align-middle">Agent</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Active</th>
                  <th className="px-4 py-3 align-middle text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 transition-colors hover:bg-white/2">
                    <td className="max-w-[min(280px,40vw)] px-4 py-3 align-middle font-medium text-white">
                      <span className="line-clamp-2" title={p.title}>
                        {p.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle tabular-nums text-slate-300">{p.payment_options?.length ?? 0}</td>
                    <td className="px-4 py-3 align-middle tabular-nums text-slate-200">{propertyPrimaryPriceLine(p)}</td>
                    <td className="px-4 py-3 align-middle text-slate-400">{p.assigned_agent_name ?? "—"}</td>
                    <td className="px-4 py-3 align-middle text-slate-300">{p.listing_active ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 align-middle text-right">
                      <span className="inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                        <button type="button" className="font-medium text-[#f58e43] hover:underline" onClick={() => openEdit(p)}>
                          Edit
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              {rows.length === 0 ? "No land share listings yet." : "No listings match your filters."}
            </p>
          ) : null}
        </>
      )}

      <DashboardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit land share listing" : "New land share listing"}
        wide
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="dashboard-modal-btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="dashboard-modal-btn-primary disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs text-slate-500">Title</span>
            <input
              className={dashboardModalFieldClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <label>
            <span className="text-xs text-slate-500">Slug (optional)</span>
            <input
              className={dashboardModalFieldClass}
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="auto from title"
            />
          </label>
          <label>
            <span className="text-xs text-slate-500">Display type</span>
            <select
              className={dashboardModalFieldClass}
              value={form.property_type}
              onChange={(e) => setForm((f) => ({ ...f, property_type: e.target.value as PropertyKind }))}
            >
              <option value="land">Land</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="commercial">Commercial</option>
            </select>
          </label>
          <label>
            <span className="text-xs text-slate-500">Reference price (BDT)</span>
            <input
              className={dashboardModalFieldClass}
              value={form.land_price}
              onChange={(e) => setForm((f) => ({ ...f, land_price: e.target.value }))}
            />
          </label>
          <label>
            <span className="text-xs text-slate-500">Status</span>
            <select
              className={dashboardModalFieldClass}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as LandShareListing["status"] }))}
            >
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="sold">Sold</option>
            </select>
          </label>
          <div className="sm:col-span-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-600">Available share amounts (monthly)</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      payment_rows: [...f.payment_rows, { amount: "" }],
                    }))
                  }
                >
                  Add amount
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      payment_rows: [...f.payment_rows, { amount: "20000" }, { amount: "50000" }],
                    }))
                  }
                >
                  Add 20k + 50k
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {form.payment_rows.map((row, i) => (
                <div key={`tier-${i}`} className="flex flex-wrap items-end gap-2">
                  <label className="min-w-[100px] flex-1">
                    <span className="text-[10px] text-slate-500">Amount per month (BDT)</span>
                    <input
                      className={dashboardModalFieldClassTight}
                      value={row.amount}
                      onChange={(e) =>
                        setForm((f) => {
                          const next = [...f.payment_rows]
                          next[i] = { ...next[i], amount: e.target.value }
                          return { ...f, payment_rows: next }
                        })
                      }
                    />
                  </label>
                  <span className="mb-0.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600">
                    Monthly
                  </span>
                  <button
                    type="button"
                    className="mb-0.5 rounded-md border border-rose-200 px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        payment_rows: f.payment_rows.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <label className="sm:col-span-2">
            <span className="text-xs text-slate-500">Location</span>
            <input
              className={dashboardModalFieldClass}
              value={form.location_name}
              onChange={(e) => setForm((f) => ({ ...f, location_name: e.target.value }))}
            />
          </label>
          <label>
            <span className="text-xs text-slate-500">Land area (sqft)</span>
            <input
              type="number"
              className={dashboardModalFieldClass}
              value={form.land_area_sqft}
              onChange={(e) => setForm((f) => ({ ...f, land_area_sqft: e.target.value }))}
            />
          </label>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
            <span className="text-xs text-slate-500">Assigned agent</span>
            <p className="mt-1 text-sm text-slate-800">{editing?.assigned_agent_name ?? "—"}</p>
          </div>
          <label className="sm:col-span-2">
            <span className="text-xs text-slate-500">Image URL</span>
            <input
              className={dashboardModalFieldClass}
              value={form.top_view_image}
              onChange={(e) => setForm((f) => ({ ...f, top_view_image: e.target.value }))}
            />
          </label>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.listing_active}
              onChange={(e) => setForm((f) => ({ ...f, listing_active: e.target.checked }))}
            />
            <span className="text-sm text-slate-800">Public listing active</span>
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs text-slate-500">Amenities (one per line)</span>
            <textarea
              rows={3}
              className={dashboardModalFieldClass}
              value={form.amenities_text}
              onChange={(e) => setForm((f) => ({ ...f, amenities_text: e.target.value }))}
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs text-slate-500">Description (HTML ok)</span>
            <textarea
              rows={4}
              className={dashboardModalFieldClass}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs text-slate-500">Secondary description (HTML ok)</span>
            <textarea
              rows={3}
              className={dashboardModalFieldClass}
              value={form.description_secondary}
              onChange={(e) => setForm((f) => ({ ...f, description_secondary: e.target.value }))}
            />
          </label>
        </div>
      </DashboardModal>
    </section>
  )
}
