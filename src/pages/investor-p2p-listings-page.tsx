import { useCallback, useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons"

import { DashboardModal } from "@/components/dashboard/dashboard-modal"
import { useLanguage } from "@/i18n/language-context"
import { useToast } from "@/components/ui/use-toast"
import {
  createP2pListing,
  listMyP2pListings,
  patchP2pListing,
  withdrawP2pListing,
} from "@/services/api"
import type { P2PListing, P2PListingWritePayload } from "@/types/domain"

const emptyForm: P2PListingWritePayload = {
  title: "",
  description: "",
  location_name: "",
  asking_price_hint: "",
  land_area_sqft: null,
  latitude: "",
  longitude: "",
  contact_email: "",
  contact_phone: "",
  features: [],
  hero_image: "",
  gallery_images: [],
}

export function InvestorP2pListingsPage() {
  const { language } = useLanguage()
  const { showToast } = useToast()
  const [rows, setRows] = useState<P2PListing[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<P2PListingWritePayload>(emptyForm)
  const [galleryText, setGalleryText] = useState("")
  const [featuresText, setFeaturesText] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      const list = await listMyP2pListings(token)
      setRows(list)
    } catch (e) {
      showToast(e instanceof Error ? e.message : language === "bn" ? "লোড করতে সমস্যা হয়েছে" : "Failed to load", "error")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setGalleryText("")
    setFeaturesText("")
    setModalOpen(true)
  }

  function openEdit(row: P2PListing) {
    setEditingId(row.id)
    setForm({
      title: row.title,
      description: row.description,
      location_name: row.location_name,
      asking_price_hint: row.asking_price_hint ?? "",
      land_area_sqft: row.land_area_sqft,
      latitude: row.latitude ?? "",
      longitude: row.longitude ?? "",
      contact_email: row.contact_email ?? "",
      contact_phone: row.contact_phone ?? "",
      features: row.features ?? [],
      hero_image: row.hero_image,
      gallery_images: row.gallery_images,
      status: row.status,
    })
    setGalleryText((row.gallery_images ?? []).join("\n"))
    setFeaturesText((row.features ?? []).join("\n"))
    setModalOpen(true)
  }

  async function save() {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    if (!form.title.trim() || !form.description.trim() || !form.location_name.trim()) {
      showToast(language === "bn" ? "শিরোনাম, বিবরণ এবং লোকেশন বাধ্যতামূলক।" : "Title, description, and location are required.", "error")
      return
    }
    const galleries = galleryText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
    const features = featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
    const body: P2PListingWritePayload = {
      ...form,
      gallery_images: galleries,
      features,
      asking_price_hint: form.asking_price_hint?.toString().trim() || null,
      land_area_sqft: form.land_area_sqft != null && form.land_area_sqft > 0 ? form.land_area_sqft : null,
      latitude: form.latitude?.toString().trim() || null,
      longitude: form.longitude?.toString().trim() || null,
      contact_email: form.contact_email?.toString().trim() || "",
      contact_phone: form.contact_phone?.toString().trim() || "",
    }
    setSaving(true)
    try {
      if (editingId != null) {
        await patchP2pListing(editingId, body, token)
        showToast(language === "bn" ? "লিস্টিং আপডেট হয়েছে।" : "Listing updated.", "success")
      } else {
        await createP2pListing(body, token)
        showToast(language === "bn" ? "লিস্টিং তৈরি হয়েছে।" : "Listing created.", "success")
      }
      setModalOpen(false)
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : language === "bn" ? "সংরক্ষণ ব্যর্থ হয়েছে" : "Save failed", "error")
    } finally {
      setSaving(false)
    }
  }

  async function withdraw(id: number) {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    if (!window.confirm(language === "bn" ? "এই লিস্টিংটি কি P2P মার্কেট থেকে প্রত্যাহার করবেন?" : "Withdraw this listing from the P2P market?")) return
    try {
      await withdrawP2pListing(id, token)
      showToast(language === "bn" ? "লিস্টিং প্রত্যাহার করা হয়েছে।" : "Listing withdrawn.", "success")
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : language === "bn" ? "ব্যর্থ হয়েছে" : "Failed", "error")
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">My P2P listings</h2>
          <p className="mt-1 text-sm text-slate-400">
            {language === "bn"
              ? "আপনার জমি পিয়ার-টু-পিয়ার মার্কেটপ্লেসে রিসেল করার জন্য তালিকাভুক্ত করুন।"
              : "Offer your land for resale on the peer-to-peer marketplace."}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
        >
          {language === "bn" ? "লিস্টিং যোগ করুন" : "Add listing"}
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <p className="text-slate-500">{language === "bn" ? "লোড হচ্ছে…" : "Loading…"}</p>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {language === "bn" ? "এখনও কোনো লিস্টিং নেই। P2P পেজে দেখাতে নতুন লিস্টিং যোগ করুন।" : "No listings yet. Add one to appear on the P2P page."}
          </p>
        ) : (
          <table className="min-w-[900px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2">{language === "bn" ? "শিরোনাম" : "Title"}</th>
                <th className="px-3 py-2">{language === "bn" ? "লোকেশন" : "Location"}</th>
                <th className="px-3 py-2">{language === "bn" ? "যোগাযোগ" : "Contact"}</th>
                <th className="px-3 py-2">{language === "bn" ? "মানচিত্র" : "Map"}</th>
                <th className="px-3 py-2">{language === "bn" ? "ফিচার" : "Features"}</th>
                <th className="px-3 py-2">{language === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                <th className="px-3 py-2">{language === "bn" ? "বিড" : "Bids"}</th>
                <th className="px-3 py-2 text-right">{language === "bn" ? "অ্যাকশন" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="px-3 py-2 text-slate-200">{r.title}</td>
                  <td className="px-3 py-2 text-slate-400">{r.location_name}</td>
                  <td className="px-3 py-2 text-xs text-slate-400">
                    <div className="space-y-0.5">
                      <p>{r.contact_phone || "—"}</p>
                      <p className="max-w-[180px] truncate">{r.contact_email || "—"}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-400">
                    {r.latitude && r.longitude ? (
                      <span className="inline-flex items-center rounded-full bg-[#0b1f44]/20 px-2 py-0.5 text-[11px] text-slate-200">
                        {r.latitude}, {r.longitude}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-400">{r.features?.length ?? 0}</td>
                  <td className="px-3 py-2 capitalize text-slate-300">{r.status}</td>
                  <td className="px-3 py-2 text-slate-400">{r.bid_count ?? 0}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#f58e43] hover:bg-white/10"
                      onClick={() => openEdit(r)}
                      aria-label="Edit listing"
                      title={language === "bn" ? "লিস্টিং সম্পাদনা" : "Edit listing"}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    {r.status === "active" ? (
                      <button
                        type="button"
                        className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-400 hover:bg-white/10"
                        onClick={() => void withdraw(r.id)}
                        aria-label="Withdraw listing"
                        title={language === "bn" ? "লিস্টিং প্রত্যাহার" : "Withdraw listing"}
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DashboardModal
        open={modalOpen}
        title={editingId != null ? (language === "bn" ? "P2P লিস্টিং সম্পাদনা" : "Edit P2P listing") : language === "bn" ? "নতুন P2P লিস্টিং" : "New P2P listing"}
        onClose={() => {
          if (!saving) setModalOpen(false)
        }}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="dashboard-modal-btn-secondary" disabled={saving} onClick={() => setModalOpen(false)}>
              {language === "bn" ? "বাতিল" : "Cancel"}
            </button>
            <button type="button" className="dashboard-modal-btn-primary" disabled={saving} onClick={() => void save()}>
              {saving ? (language === "bn" ? "সংরক্ষণ হচ্ছে…" : "Saving…") : language === "bn" ? "সংরক্ষণ" : "Save"}
            </button>
          </div>
        }
      >
        <div className="grid max-h-[70vh] gap-3 overflow-y-auto sm:grid-cols-2">
          <input
            className="template-input sm:col-span-2"
            placeholder={language === "bn" ? "শিরোনাম *" : "Title *"}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input
            className="template-input sm:col-span-2"
            placeholder={language === "bn" ? "লোকেশন *" : "Location *"}
            value={form.location_name}
            onChange={(e) => setForm((f) => ({ ...f, location_name: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder={language === "bn" ? "নির্দেশক মূল্য (ঐচ্ছিক)" : "Guide price (optional)"}
            value={form.asking_price_hint?.toString() ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, asking_price_hint: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder={language === "bn" ? "জমির আয়তন (স্কয়ার ফিট, ঐচ্ছিক)" : "Land area (sq ft, optional)"}
            type="number"
            value={form.land_area_sqft ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                land_area_sqft: e.target.value ? Number(e.target.value) : null,
              }))
            }
          />
          <input
            className="template-input"
            placeholder={language === "bn" ? "অক্ষাংশ (ঐচ্ছিক)" : "Latitude (optional)"}
            value={form.latitude?.toString() ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder={language === "bn" ? "দ্রাঘিমাংশ (ঐচ্ছিক)" : "Longitude (optional)"}
            value={form.longitude?.toString() ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder={language === "bn" ? "বিক্রেতার ইমেইল (ঐচ্ছিক)" : "Seller contact email (optional)"}
            value={form.contact_email ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder={language === "bn" ? "বিক্রেতার ফোন (ঐচ্ছিক)" : "Seller contact phone (optional)"}
            value={form.contact_phone ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
          />
          <input
            className="template-input sm:col-span-2"
            placeholder={language === "bn" ? "হিরো ছবির URL" : "Hero image URL"}
            value={form.hero_image ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, hero_image: e.target.value }))}
          />
          <textarea
            className="template-input min-h-[100px] sm:col-span-2"
            placeholder={language === "bn" ? "বিবরণ *" : "Description *"}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <label className="text-xs text-slate-400 sm:col-span-2">
            {language === "bn" ? "গ্যালারি ছবির URL (প্রতি লাইনে একটি)" : "Gallery image URLs (one per line)"}
          </label>
          <textarea
            className="template-input min-h-[80px] sm:col-span-2"
            placeholder={language === "bn" ? "https://…" : "https://…"}
            value={galleryText}
            onChange={(e) => setGalleryText(e.target.value)}
          />
          <label className="text-xs text-slate-400 sm:col-span-2">
            {language === "bn" ? "মূল ফিচারসমূহ (প্রতি লাইনে একটি)" : "Key features (one per line)"}
          </label>
          <textarea
            className="template-input min-h-[80px] sm:col-span-2"
            placeholder={
              language === "bn"
                ? "রোড এক্সেস&#10;বাউন্ডারি ওয়াল&#10;পানির সংযোগ আছে"
                : "Road access&#10;Boundary wall&#10;Water line available"
            }
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
          />
          {editingId != null ? (
            <div className="sm:col-span-2">
              <span className="text-xs text-slate-500">{language === "bn" ? "স্ট্যাটাস" : "Status"}</span>
              <select
                className="template-input mt-1 w-full"
                value={form.status ?? "active"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as P2PListing["status"],
                  }))
                }
              >
                <option value="active">{language === "bn" ? "সক্রিয়" : "Active"}</option>
                <option value="sold">{language === "bn" ? "বিক্রি হয়েছে" : "Sold"}</option>
                <option value="withdrawn">{language === "bn" ? "প্রত্যাহৃত" : "Withdrawn"}</option>
              </select>
            </div>
          ) : null}
        </div>
      </DashboardModal>
    </section>
  )
}
