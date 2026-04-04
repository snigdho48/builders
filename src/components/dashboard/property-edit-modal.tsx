import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"

import { DashboardModal } from "@/components/dashboard/dashboard-modal"
import {
  RepresentativePropertyFormFields,
  type PropertyFormEditorVariant,
} from "@/components/dashboard/representative-property-form-fields"
import { useToast } from "@/components/ui/use-toast"
import { createProperty, fetchPropertyFresh, getAgents, getRepresentatives, updateProperty } from "@/services/api"
import type { AgentUser, PropertyUpsertPayload, RepresentativeUser } from "@/types/domain"
import { propertyToUpsertPayload } from "@/utils/property-to-upsert-payload"

type PropertyEditModalProps = {
  open: boolean
  propertyId: number | null
  variant: PropertyFormEditorVariant
  onClose: () => void
  /** Called after a successful save (e.g. refresh parent list). */
  onSaved?: () => void
}

export function PropertyEditModal({ open, propertyId, variant, onClose, onSaved }: PropertyEditModalProps) {
  const { showToast } = useToast()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const [title, setTitle] = useState("Edit listing")
  const [propertyForm, setPropertyForm] = useState<PropertyUpsertPayload | null>(null)
  const [agents, setAgents] = useState<AgentUser[]>([])
  const [representatives, setRepresentatives] = useState<RepresentativeUser[]>([])
  const [saving, setSaving] = useState(false)

  const reset = useCallback(() => {
    setPropertyForm(null)
    setAgents([])
    setRepresentatives([])
    setTitle("Edit listing")
    setSaving(false)
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  const emptyPropertyForm: PropertyUpsertPayload = {
    title: "",
    slug: "",
    description: "",
    description_secondary: "",
    property_type: "apartment",
    property_channel: "plot_buy",
    land_sale_mode: "whole_land",
    total_blocks: 0,
    available_blocks: 0,
    price_per_block: "",
    whole_land_price: null,
    share_price: null,
    total_shares: null,
    available_shares: null,
    min_shares_per_order: undefined,
    location_name: "",
    latitude: null,
    longitude: null,
    video_url: "",
    top_view_image: "",
    gallery_images: [],
    amenities: [],
    tags: [],
    floor_plans: [],
    build_year: null,
    bedrooms: null,
    bathrooms: null,
    flat_label: "",
    size_sqft: null,
    for_rent: false,
    for_sale: true,
    contact_website: "",
    rating_average: null,
    review_count: undefined,
    review_sample_author: "",
    review_sample_date: null,
    review_sample_text: "",
    status: "available",
    listing_active: true,
    expected_profit_percent: null,
    investment_window_start: null,
    investment_window_end: null,
    share_investment_options: [],
    managed_by: null,
    representative: null,
  }

  useEffect(() => {
    if (!open) {
      return
    }
    const token = localStorage.getItem("accessToken")
    if (!token) {
      showToast("Sign in required.", "error")
      return
    }

    let cancelled = false
    setPropertyForm(propertyId ? null : emptyPropertyForm)

    ;(async () => {
      if (propertyId) {
        const p = await fetchPropertyFresh(String(propertyId), token)
        if (cancelled) return
        if (!p) {
          showToast("Could not load listing.", "error")
          reset()
          onCloseRef.current()
          return
        }
        setTitle(p.title || "Edit listing")
        setPropertyForm(propertyToUpsertPayload(p))
      } else {
        setTitle("Add listing")
      }

      try {
        if (variant === "admin") {
          const [a, r] = await Promise.all([getAgents(token), getRepresentatives(token)])
          if (!cancelled) {
            setAgents(a)
            setRepresentatives(r)
          }
        } else if (variant === "representative") {
          const a = await getAgents(token)
          if (!cancelled) setAgents(a)
        }
      } catch {
        if (!cancelled) showToast("Could not load assignee lists.", "error")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, propertyId, variant, showToast, reset])

  const setFormSafe: Dispatch<SetStateAction<PropertyUpsertPayload>> = useCallback((update) => {
    setPropertyForm((prev) => {
      if (prev == null) return prev
      return typeof update === "function" ? update(prev) : update
    })
  }, [])

  async function save() {
    if (!propertyForm) return
    const token = localStorage.getItem("accessToken")
    if (!token) {
      showToast("Sign in required.", "error")
      return
    }
    setSaving(true)
    try {
      if (propertyId) {
        await updateProperty(propertyId, propertyForm, token)
        showToast("Listing updated.", "success")
      } else {
        await createProperty(propertyForm, token)
        showToast("Listing created.", "success")
      }
      onSaved?.()
      handleClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Save failed."
      showToast(message, "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardModal
      open={open}
      wide
      title={title}
      onClose={handleClose}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button type="button" onClick={handleClose} className="dashboard-modal-btn-secondary" disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            className="dashboard-modal-btn-primary"
            disabled={saving || !propertyForm}
          >
            {saving ? "Saving…" : propertyId ? "Save changes" : "Create listing"}
          </button>
        </div>
      }
    >
      {propertyForm ? (
        <RepresentativePropertyFormFields
          propertyForm={propertyForm}
          setPropertyForm={setFormSafe}
          editingPropertyId={propertyId}
          showToast={showToast}
          agents={agents}
          representatives={representatives}
          variant={variant}
        />
      ) : (
        <p className="text-sm text-slate-400">Loading listing…</p>
      )}
    </DashboardModal>
  )
}
