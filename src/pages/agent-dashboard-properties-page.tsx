import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { DashboardModal, dashboardModalFieldClass } from "@/components/dashboard/dashboard-modal"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { useToast } from "@/components/ui/use-toast"
import { SALE_TYPE_FILTER_OPTIONS } from "@/constants/property-filters"
import { getPropertiesPaged, updateProperty } from "@/services/api"
import type { Property, PropertyKind, PropertyUpsertPayload, SaleType } from "@/types/domain"
import { propertyOpenForStaffBooking, propertyPrimaryPriceLine, saleTypeLabel } from "@/utils/property-display"

export function AgentDashboardPropertiesPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Property | null>(null)
  const [form, setForm] = useState({
    title: "",
    property_type: "land" as PropertyKind,
    sale_type: "land_buy" as SaleType,
    land_price: "",
    installment_years: "" as string,
    location_name: "",
    land_area_sqft: "",
    description: "",
    description_secondary: "",
    amenities_text: "",
    build_year: "",
    bedrooms: "",
    bathrooms: "",
    flat_label: "",
    contact_website: "",
    for_rent: false,
    top_view_image: "",
    listing_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [tableSearch, setTableSearch] = useState("")
  const [tableSaleType, setTableSaleType] = useState<"all" | SaleType>("all")
  const [tableActive, setTableActive] = useState<"all" | "yes" | "no">("all")

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      const { items } = await getPropertiesPaged({ pageSize: 100, managedByMe: true, includeInactive: true })
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

  function openEdit(p: Property) {
    setEditing(p)
    setForm({
      title: p.title,
      property_type: p.property_type,
      sale_type: p.sale_type,
      land_price: p.land_price,
      installment_years: p.installment_years != null ? String(p.installment_years) : "",
      location_name: p.location_name,
      land_area_sqft: p.land_area_sqft != null ? String(p.land_area_sqft) : "",
      description: p.description,
      description_secondary: p.description_secondary,
      amenities_text: (p.amenities ?? []).join("\n"),
      build_year: p.build_year != null ? String(p.build_year) : "",
      bedrooms: p.bedrooms != null ? String(p.bedrooms) : "",
      bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
      flat_label: p.flat_label,
      contact_website: p.contact_website,
      for_rent: p.for_rent,
      top_view_image: p.top_view_image,
      listing_active: p.listing_active,
    })
    setModalOpen(true)
  }

  async function save() {
    const token = localStorage.getItem("accessToken")
    if (!token || !editing) return
    if (form.sale_type === "installment") {
      const y = Number(form.installment_years)
      if (!Number.isFinite(y) || y < 1) {
        showToast("Installment listings need a positive term in years.", "error")
        return
      }
    }
    setSaving(true)
    try {
      const amenities = form.amenities_text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
      const payload: PropertyUpsertPayload = {
        title: form.title.trim(),
        property_type: form.property_type,
        sale_type: form.sale_type,
        land_price: form.land_price.trim(),
        installment_years:
          form.sale_type === "installment" ? Math.max(1, Math.floor(Number(form.installment_years))) : null,
        location_name: form.location_name.trim(),
        land_area_sqft: form.land_area_sqft.trim() ? Math.max(0, Math.floor(Number(form.land_area_sqft))) : null,
        description: form.description,
        description_secondary: form.description_secondary,
        amenities,
        build_year: form.build_year.trim() ? Math.max(0, Math.floor(Number(form.build_year))) : null,
        bedrooms: form.bedrooms.trim() ? Math.max(0, Math.floor(Number(form.bedrooms))) : null,
        bathrooms: form.bathrooms.trim() ? Math.max(0, Math.floor(Number(form.bathrooms))) : null,
        flat_label: form.flat_label.trim(),
        contact_website: form.contact_website.trim(),
        for_rent: form.for_rent,
        top_view_image: form.top_view_image.trim(),
        listing_active: form.listing_active,
      }
      await updateProperty(editing.id, payload, token)
      showToast("Listing updated.", "success")
      setModalOpen(false)
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Save failed", "error")
    } finally {
      setSaving(false)
    }
  }

  const title = useMemo(() => "My assigned lands", [])

  const filteredRows = useMemo(() => {
    let list = rows
    if (tableSaleType !== "all") {
      list = list.filter((p) => p.sale_type === tableSaleType)
    }
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
          String(p.id).includes(q),
      )
    }
    return list
  }, [rows, tableSearch, tableSaleType, tableActive])

  const agentTableSelectClass = "h-9 w-full text-xs leading-9"

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-slate-400">Update details and visibility for lands assigned to you.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-500">No lands assigned yet.</p>
      ) : (
        <>
          <div className="dashboard-filters-row">
            <input
              className="dashboard-filter-input min-w-[200px] flex-1"
              placeholder="Search title, location, ID…"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              aria-label="Search assigned lands"
            />
            <div className="dashboard-filter-group min-w-[150px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Sale type</span>
              <div className="dashboard-filter-select-shell">
                <CompactFormSelect
                  ariaLabel="Filter by sale type"
                  className={agentTableSelectClass}
                  value={tableSaleType}
                  onValueChange={(v) => setTableSaleType(v as "all" | SaleType)}
                  options={SALE_TYPE_FILTER_OPTIONS}
                />
              </div>
            </div>
            <div className="dashboard-filter-group min-w-[120px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Active</span>
              <div className="dashboard-filter-select-shell">
                <CompactFormSelect
                  ariaLabel="Filter by active"
                  className={agentTableSelectClass}
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
            <table className="min-w-[640px] w-full border-collapse text-left text-sm text-slate-200">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 align-middle">Title</th>
                  <th className="px-4 py-3 align-middle">Sale</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Price</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Active</th>
                  <th className="px-4 py-3 align-middle text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                    <td className="max-w-[min(280px,40vw)] px-4 py-3 align-middle font-medium text-white">
                      <span className="line-clamp-2" title={p.title}>
                        {p.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-slate-300">{saleTypeLabel(p.sale_type)}</td>
                    <td className="px-4 py-3 align-middle tabular-nums">{propertyPrimaryPriceLine(p)}</td>
                    <td className="px-4 py-3 align-middle text-slate-300">{p.listing_active ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 align-middle text-right">
                      <span className="inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                        {propertyOpenForStaffBooking(p) ? (
                          <Link
                            to={`/properties/${p.id}/book`}
                            className="font-medium text-emerald-400 hover:underline"
                            title="Book this plot for an investor (select or create investor on the next page)"
                          >
                            Book for client
                          </Link>
                        ) : null}
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
            <p className="py-6 text-center text-sm text-slate-500">No lands match your filters.</p>
          ) : null}
        </>
      )}

      <DashboardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit land listing"
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
            <span className="text-xs text-slate-500">Display property type</span>
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
            <span className="text-xs text-slate-500">Sale type</span>
            <select
              className={dashboardModalFieldClass}
              value={form.sale_type}
              onChange={(e) => setForm((f) => ({ ...f, sale_type: e.target.value as SaleType }))}
            >
              <option value="land_buy">Land buy</option>
              <option value="installment">Installment (whole parcel, map plots)</option>
            </select>
            <span className="mt-1 block text-[11px] text-slate-500">
              Tiered land-share listings: use <strong className="font-semibold text-slate-700">My land share</strong> in the
              agent dashboard.
            </span>
          </label>
          <label>
            <span className="text-xs text-slate-500">Land price</span>
            <input
              className={dashboardModalFieldClass}
              value={form.land_price}
              onChange={(e) => setForm((f) => ({ ...f, land_price: e.target.value }))}
            />
          </label>
          {form.sale_type === "installment" ? (
            <label>
              <span className="text-xs text-slate-500">Installment years</span>
              <input
                type="number"
                min={1}
                className={dashboardModalFieldClass}
                value={form.installment_years}
                onChange={(e) => setForm((f) => ({ ...f, installment_years: e.target.value }))}
              />
            </label>
          ) : null}
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
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.for_rent}
              onChange={(e) => setForm((f) => ({ ...f, for_rent: e.target.checked }))}
            />
            <span className="text-sm text-slate-800">For rent (display only)</span>
          </label>
          <label>
            <span className="text-xs text-slate-500">Build year</span>
            <input
              type="number"
              className={dashboardModalFieldClass}
              value={form.build_year}
              onChange={(e) => setForm((f) => ({ ...f, build_year: e.target.value }))}
            />
          </label>
          <label>
            <span className="text-xs text-slate-500">Bedrooms</span>
            <input
              type="number"
              min={0}
              className={dashboardModalFieldClass}
              value={form.bedrooms}
              onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
            />
          </label>
          <label>
            <span className="text-xs text-slate-500">Bathrooms</span>
            <input
              type="number"
              min={0}
              className={dashboardModalFieldClass}
              value={form.bathrooms}
              onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))}
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs text-slate-500">Flat label</span>
            <input
              className={dashboardModalFieldClass}
              value={form.flat_label}
              onChange={(e) => setForm((f) => ({ ...f, flat_label: e.target.value }))}
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs text-slate-500">Contact website</span>
            <input
              className={dashboardModalFieldClass}
              value={form.contact_website}
              onChange={(e) => setForm((f) => ({ ...f, contact_website: e.target.value }))}
            />
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
            <span className="text-xs text-slate-500">Description</span>
            <textarea
              rows={4}
              className={dashboardModalFieldClass}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs text-slate-500">Secondary description</span>
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
