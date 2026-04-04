import { type Dispatch, type ReactNode, type SetStateAction, useId } from "react"

import { PropertyFloorPlanEditor } from "@/components/dashboard/property-floor-plan-editor"
import { PropertyRichTextField } from "@/components/dashboard/property-rich-text-field"
import { PropertyStringListEditor } from "@/components/dashboard/property-string-list-editor"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import type { ToastVariant } from "@/components/ui/use-toast"
import type {
  AgentUser,
  Property,
  PropertyUpsertPayload,
  RepresentativeUser,
  ShareInvestmentOption,
} from "@/types/domain"
import { cn } from "@/lib/utils"
import { landSaleModeAfterChannelChange } from "@/utils/property-channel-land-mode"

/** Single compact row: control only; section headers provide grouping. */
const fieldShell =
  "rounded-md border border-white/10 bg-[#152a45]/95 px-2 py-0.5 shadow-[inset_0_1px_0_rgb(255_255_255/4%)] transition-[border-color,box-shadow] duration-150 focus-within:border-[#f58e43]/70 focus-within:ring-1 focus-within:ring-[#f58e43]/25"

const control =
  "h-6 w-full min-w-0 border-0 bg-transparent p-0 text-[11px] leading-6 text-white outline-none ring-0 placeholder:text-slate-500 focus:ring-0"
const textareaControl =
  "w-full min-w-0 resize-y border-0 bg-transparent py-1 text-[11px] leading-snug text-white outline-none ring-0 placeholder:text-slate-500 focus:ring-0"

function FieldShell({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn(fieldShell, className)}>{children}</div>
}

function OptionsGroup({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn(fieldShell, "py-1.5", className)} role="group" aria-label={label}>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

function PropertyFormSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="border-b border-white/10 pb-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">{title}</h3>
        {hint ? <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{hint}</p> : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  )
}

type ToastFn = (title: string, variant?: ToastVariant) => void

export type PropertyFormEditorVariant = "representative" | "agent" | "admin"

type RepresentativePropertyFormFieldsProps = {
  propertyForm: PropertyUpsertPayload
  setPropertyForm: Dispatch<SetStateAction<PropertyUpsertPayload>>
  editingPropertyId: number | null
  showToast: ToastFn
  agents?: AgentUser[]
  /** Default representative: full form + assign agent. Agent: no assignment fields. Admin: + representative picker. */
  variant?: PropertyFormEditorVariant
  representatives?: RepresentativeUser[]
}

export function RepresentativePropertyFormFields({
  propertyForm,
  setPropertyForm,
  agents = [],
  variant = "representative",
  representatives = [],
}: RepresentativePropertyFormFieldsProps) {
  const uid = useId()
  const f = (suffix: string) => `${uid}-${suffix}`
  const showManagedBy = variant !== "agent" && agents.length > 0
  const showRepresentative = variant === "admin" && representatives.length > 0

  return (
    <div className="space-y-4">
      <PropertyFormSection
        title="Basics"
        hint="Listing identity, type, and how it appears on the homepage lanes."
      >
        <FieldShell>
          <input
            id={f("title")}
            className={control}
            aria-label="Title"
            placeholder="e.g. Ocean View Residences"
            value={propertyForm.title}
            onChange={(event) => setPropertyForm((current) => ({ ...current, title: event.target.value }))}
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("slug")}
            className={control}
            aria-label="Slug"
            placeholder="e.g. ocean-view-residences"
            value={propertyForm.slug}
            onChange={(event) => setPropertyForm((current) => ({ ...current, slug: event.target.value }))}
          />
        </FieldShell>
        <FieldShell>
          <CompactFormSelect
            id={f("property-type")}
            ariaLabel="Property type"
            value={propertyForm.property_type}
            onValueChange={(next) =>
              setPropertyForm((current) => ({
                ...current,
                property_type: next as Property["property_type"],
              }))
            }
            options={[
              { value: "apartment", label: "Type: Apartment" },
              { value: "villa", label: "Type: Villa" },
              { value: "commercial", label: "Type: Commercial" },
              { value: "land", label: "Type: Land" },
            ]}
          />
        </FieldShell>
        <FieldShell>
          <CompactFormSelect
            id={f("status")}
            ariaLabel="Listing status"
            value={propertyForm.status ?? "available"}
            onValueChange={(next) =>
              setPropertyForm((current) => ({
                ...current,
                status: next as Property["status"],
              }))
            }
            options={[
              { value: "available", label: "Status: Available" },
              { value: "booked", label: "Status: Booked" },
              { value: "sold", label: "Status: Sold" },
            ]}
          />
        </FieldShell>
        <FieldShell>
          <CompactFormSelect
            id={f("channel")}
            ariaLabel="Homepage channel"
            value={propertyForm.property_channel ?? "plot_buy"}
            onValueChange={(next) =>
              setPropertyForm((current) => {
                const channel = next as Property["property_channel"]
                const land_sale_mode = landSaleModeAfterChannelChange(channel, {
                  channel: current.property_channel ?? "plot_buy",
                  land_sale_mode: current.land_sale_mode,
                })
                return { ...current, property_channel: channel, land_sale_mode }
              })
            }
            options={[
              { value: "plot_buy", label: "Channel: Plot buy (whole plot)" },
              { value: "installment", label: "Channel: Installment (block or shares)" },
            ]}
          />
        </FieldShell>
        {showRepresentative ? (
          <FieldShell>
            <CompactFormSelect
              id={f("representative-user")}
              ariaLabel="Representative (listing owner)"
              emptyLabel="Representative…"
              value={propertyForm.representative != null ? String(propertyForm.representative) : ""}
              onValueChange={(next) =>
                setPropertyForm((current) => ({
                  ...current,
                  representative: next ? Number(next) : null,
                }))
              }
              options={representatives.map((rep) => ({
                value: String(rep.id),
                label:
                  [rep.first_name, rep.last_name].filter(Boolean).join(" ") ||
                  rep.username ||
                  `Rep #${rep.id}`,
              }))}
            />
          </FieldShell>
        ) : null}
        {showManagedBy ? (
          <FieldShell>
            <CompactFormSelect
              id={f("assigned-agent")}
              ariaLabel="Assigned agent (optional)"
              emptyLabel="Assign to agent (optional)…"
              value={propertyForm.managed_by != null ? String(propertyForm.managed_by) : ""}
              onValueChange={(next) =>
                setPropertyForm((current) => ({
                  ...current,
                  managed_by: next ? Number(next) : null,
                }))
              }
              options={agents.map((agent) => ({
                value: String(agent.id),
                label:
                  [agent.first_name, agent.last_name].filter(Boolean).join(" ") ||
                  agent.username ||
                  `Agent #${agent.id}`,
              }))}
            />
          </FieldShell>
        ) : null}
      </PropertyFormSection>

      <PropertyFormSection
        title="Listing & investment terms"
        hint="Catalog visibility, expected profit % (used at maturity payout with principal when all installments are paid on time), optional investment time window. Plot buy has no duration; fractional tiers use amount + years."
      >
        <OptionsGroup label="Public catalog" className="sm:col-span-2 lg:col-span-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-slate-400">
            <input
              id={f("listing-active")}
              type="checkbox"
              className="size-3 shrink-0 rounded border-white/25 bg-transparent text-emerald-400 focus:ring-1 focus:ring-[#f58e43]/40"
              checked={propertyForm.listing_active !== false}
              onChange={(event) =>
                setPropertyForm((current) => ({ ...current, listing_active: event.target.checked }))
              }
            />
            Active on public listings (off = hidden from browse; you can still manage)
          </label>
        </OptionsGroup>
        <FieldShell>
          <input
            id={f("profit-pct")}
            className={control}
            aria-label="Expected profit percent"
            inputMode="decimal"
            placeholder="e.g. 12.5 (optional)"
            value={propertyForm.expected_profit_percent ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                expected_profit_percent: event.target.value.trim() ? event.target.value : null,
              }))
            }
          />
        </FieldShell>
        <div className="grid gap-4 sm:col-span-2 lg:col-span-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={f("inv-start")} className="block text-[11px] font-semibold text-slate-200">
              When new investments can start
            </label>
            <p className="text-[10px] leading-snug text-slate-500">
              Optional. If set, investors cannot submit a checkout request before this date and time. Leave empty for
              no opening restriction.
            </p>
            <FieldShell>
              <input
                id={f("inv-start")}
                className={control}
                type="datetime-local"
                value={
                  propertyForm.investment_window_start
                    ? propertyForm.investment_window_start.slice(0, 16)
                    : ""
                }
                onChange={(event) =>
                  setPropertyForm((current) => ({
                    ...current,
                    investment_window_start: event.target.value ? `${event.target.value}:00` : null,
                  }))
                }
              />
            </FieldShell>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={f("inv-end")} className="block text-[11px] font-semibold text-slate-200">
              When new investments must stop
            </label>
            <p className="text-[10px] leading-snug text-slate-500">
              Optional. Last moment investors may start checkout; after this, new requests are blocked. Leave empty for
              no closing deadline.
            </p>
            <FieldShell>
              <input
                id={f("inv-end")}
                className={control}
                type="datetime-local"
                value={
                  propertyForm.investment_window_end
                    ? propertyForm.investment_window_end.slice(0, 16)
                    : ""
                }
                onChange={(event) =>
                  setPropertyForm((current) => ({
                    ...current,
                    investment_window_end: event.target.value ? `${event.target.value}:00` : null,
                  }))
                }
              />
            </FieldShell>
          </div>
        </div>
        {(propertyForm.land_sale_mode === "fractional_share" ||
          propertyForm.property_channel === "installment") && (
          <div className="space-y-2 sm:col-span-2 lg:col-span-3">
            <p className="text-[10px] text-slate-500">
              Share / installment tiers: each row is a commitment amount in <strong>BDT</strong> and duration in years.
            </p>
            {(propertyForm.share_investment_options ?? []).map((row, index) => (
              <div key={`tier-${index}`} className="flex flex-wrap items-center gap-2">
                <FieldShell className="min-w-[120px] flex-1">
                  <input
                    className={control}
                    aria-label={`Tier ${index + 1} amount`}
                    inputMode="decimal"
                    placeholder="Amount"
                    value={row.amount}
                    onChange={(event) => {
                      const next = [...(propertyForm.share_investment_options ?? [])]
                      next[index] = { ...next[index], amount: event.target.value }
                      setPropertyForm((c) => ({ ...c, share_investment_options: next }))
                    }}
                  />
                </FieldShell>
                <FieldShell className="w-24">
                  <input
                    className={control}
                    aria-label={`Tier ${index + 1} years`}
                    type="number"
                    min={1}
                    placeholder="Yrs"
                    value={row.duration_years || ""}
                    onChange={(event) => {
                      const next = [...(propertyForm.share_investment_options ?? [])]
                      next[index] = {
                        ...next[index],
                        duration_years: Number(event.target.value) || 0,
                      }
                      setPropertyForm((c) => ({ ...c, share_investment_options: next }))
                    }}
                  />
                </FieldShell>
                <button
                  type="button"
                  className="rounded border border-rose-500/30 px-2 py-0.5 text-[10px] text-rose-300 hover:bg-rose-500/10"
                  onClick={() => {
                    const next = (propertyForm.share_investment_options ?? []).filter((_, i) => i !== index)
                    setPropertyForm((c) => ({ ...c, share_investment_options: next }))
                  }}
                >
                  Delete row
                </button>
              </div>
            ))}
            <button
              type="button"
              className="rounded border border-white/15 px-2 py-1 text-[10px] text-slate-300 hover:bg-white/5"
              onClick={() => {
                const next: ShareInvestmentOption[] = [
                  ...(propertyForm.share_investment_options ?? []),
                  { amount: "", duration_years: 1 },
                ]
                setPropertyForm((c) => ({ ...c, share_investment_options: next }))
              }}
            >
              Add tier
            </button>
          </div>
        )}
      </PropertyFormSection>

      <PropertyFormSection title="Location" hint="Display name and map coordinates for the listing.">
        <FieldShell>
          <input
            id={f("location")}
            className={control}
            aria-label="Location name"
            placeholder="e.g. Gulshan, Dhaka"
            value={propertyForm.location_name}
            onChange={(event) =>
              setPropertyForm((current) => ({ ...current, location_name: event.target.value }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("lat")}
            className={control}
            aria-label="Latitude"
            inputMode="decimal"
            placeholder="e.g. 23.8103"
            value={propertyForm.latitude ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                latitude: event.target.value.trim() ? event.target.value : null,
              }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("lng")}
            className={control}
            aria-label="Longitude"
            inputMode="decimal"
            placeholder="e.g. 90.4125"
            value={propertyForm.longitude ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                longitude: event.target.value.trim() ? event.target.value : null,
              }))
            }
          />
        </FieldShell>
      </PropertyFormSection>

      <PropertyFormSection
        title="Pricing & inventory"
        hint="Plot buy sells the whole plot in one purchase. Installment sells by block or by fractional shares."
      >
        {(propertyForm.property_channel ?? "plot_buy") === "plot_buy" ? (
          <FieldShell>
            <p className="text-[11px] leading-6 text-slate-300">Sale mode: whole plot (fixed by plot buy)</p>
          </FieldShell>
        ) : (
          <FieldShell>
            <CompactFormSelect
              id={f("land-mode")}
              ariaLabel="Installment unit type"
              emptyLabel="Select block or shares…"
              value={propertyForm.land_sale_mode ?? "per_block"}
              onValueChange={(v) =>
                setPropertyForm((current) => ({
                  ...current,
                  land_sale_mode: (v as Property["land_sale_mode"]) || "per_block",
                }))
              }
              options={[
                { value: "per_block", label: "By block" },
                { value: "fractional_share", label: "Fractional shares" },
              ]}
            />
          </FieldShell>
        )}
        <FieldShell>
          <input
            id={f("price-block")}
            className={control}
            aria-label="Price per block"
            inputMode="decimal"
            placeholder="e.g. 100.00"
            value={propertyForm.price_per_block}
            onChange={(event) =>
              setPropertyForm((current) => ({ ...current, price_per_block: event.target.value }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("total-blocks")}
            className={control}
            aria-label="Total blocks"
            type="number"
            min={0}
            placeholder="e.g. 100"
            value={propertyForm.total_blocks === 0 ? "" : propertyForm.total_blocks}
            onChange={(event) => {
              const raw = event.target.value
              setPropertyForm((current) => ({
                ...current,
                total_blocks: raw === "" ? 0 : Number(raw),
              }))
            }}
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("avail-blocks")}
            className={control}
            aria-label="Available blocks"
            type="number"
            min={0}
            placeholder="e.g. 100"
            value={propertyForm.available_blocks === 0 ? "" : propertyForm.available_blocks}
            onChange={(event) => {
              const raw = event.target.value
              setPropertyForm((current) => ({
                ...current,
                available_blocks: raw === "" ? 0 : Number(raw),
              }))
            }}
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("whole-land")}
            className={control}
            aria-label="Whole land price"
            inputMode="decimal"
            placeholder="Optional — total whole-land price"
            value={propertyForm.whole_land_price ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                whole_land_price: event.target.value.trim() ? event.target.value : null,
              }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("share-price")}
            className={control}
            aria-label="Share price"
            inputMode="decimal"
            placeholder="e.g. 50.00 per share"
            value={propertyForm.share_price ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                share_price: event.target.value.trim() ? event.target.value : null,
              }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("total-shares")}
            className={control}
            aria-label="Total shares"
            type="number"
            min={0}
            placeholder="e.g. 1000"
            value={propertyForm.total_shares ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                total_shares: event.target.value ? Number(event.target.value) : null,
              }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("avail-shares")}
            className={control}
            aria-label="Available shares"
            type="number"
            min={0}
            placeholder="e.g. 800"
            value={propertyForm.available_shares ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                available_shares: event.target.value ? Number(event.target.value) : null,
              }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("min-shares")}
            className={control}
            aria-label="Min shares per order"
            type="number"
            min={0}
            placeholder="e.g. 1"
            value={propertyForm.min_shares_per_order ?? ""}
            onChange={(event) => {
              const raw = event.target.value
              setPropertyForm((current) => ({
                ...current,
                min_shares_per_order: raw === "" ? undefined : Number(raw),
              }))
            }}
          />
        </FieldShell>
      </PropertyFormSection>

      <PropertyFormSection title="Property details" hint="Physical attributes and an optional contact link.">
        <FieldShell>
          <input
            id={f("build-year")}
            className={control}
            aria-label="Build year"
            type="number"
            min={0}
            placeholder="e.g. 2022"
            value={propertyForm.build_year ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                build_year: event.target.value ? Number(event.target.value) : null,
              }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("beds")}
            className={control}
            aria-label="Bedrooms"
            type="number"
            min={0}
            placeholder="e.g. 3"
            value={propertyForm.bedrooms ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                bedrooms: event.target.value ? Number(event.target.value) : null,
              }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("baths")}
            className={control}
            aria-label="Bathrooms"
            type="number"
            min={0}
            placeholder="e.g. 2"
            value={propertyForm.bathrooms ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                bathrooms: event.target.value ? Number(event.target.value) : null,
              }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("flat")}
            className={control}
            aria-label="Flat or unit"
            placeholder="e.g. 12B, Penthouse"
            value={propertyForm.flat_label ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({ ...current, flat_label: event.target.value }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("sqft")}
            className={control}
            aria-label="Size in square feet"
            type="number"
            min={0}
            placeholder="e.g. 1200"
            value={propertyForm.size_sqft ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                size_sqft: event.target.value ? Number(event.target.value) : null,
              }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("contact-url")}
            className={control}
            aria-label="Contact website URL"
            inputMode="url"
            placeholder="https://…"
            value={propertyForm.contact_website ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({ ...current, contact_website: event.target.value }))
            }
          />
        </FieldShell>
      </PropertyFormSection>

      <PropertyFormSection
        title="Descriptions"
        hint="Rich text for the public listing (headings, lists, links). Use the toolbar while text is selected."
      >
        <PropertyRichTextField
          id={f("desc-primary")}
          label="Primary description"
          hint="Main story for the property page."
          value={propertyForm.description}
          onChange={(html) => setPropertyForm((c) => ({ ...c, description: html }))}
          placeholder="Write the main listing copy…"
        />
        <PropertyRichTextField
          id={f("desc-secondary")}
          label="Secondary description"
          hint="Optional extra section below the main text."
          value={propertyForm.description_secondary ?? ""}
          onChange={(html) => setPropertyForm((c) => ({ ...c, description_secondary: html }))}
          placeholder="Optional details…"
          minHeightClass="min-h-[100px]"
        />
      </PropertyFormSection>

      <PropertyFormSection
        title="Media & floor plans"
        hint="Hero image, video, gallery URLs (add/remove rows), and floor plans (add/remove each plan)."
      >
        <FieldShell>
          <input
            id={f("top-img")}
            className={control}
            aria-label="Top view image URL"
            inputMode="url"
            placeholder="https://… hero image"
            value={propertyForm.top_view_image ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({ ...current, top_view_image: event.target.value }))
            }
          />
        </FieldShell>
        <FieldShell className="sm:col-span-2">
          <input
            id={f("video")}
            className={control}
            aria-label="Video URL"
            inputMode="url"
            placeholder="https://… tour or promo video"
            value={propertyForm.video_url ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({ ...current, video_url: event.target.value }))
            }
          />
        </FieldShell>
        <PropertyStringListEditor
          label="Gallery images"
          hint="Each row is one image URL for the carousel. Add or delete rows as needed."
          values={propertyForm.gallery_images ?? []}
          onChange={(gallery_images) => setPropertyForm((c) => ({ ...c, gallery_images }))}
          placeholder="https://…"
          addButtonLabel="Add image URL"
        />
        <PropertyFloorPlanEditor
          items={propertyForm.floor_plans ?? []}
          onChange={(floor_plans) => setPropertyForm((c) => ({ ...c, floor_plans }))}
        />
      </PropertyFormSection>

      <PropertyFormSection
        title="Amenities"
        hint="Each row is one amenity. Shown under Features on the public page."
      >
        <PropertyStringListEditor
          label="Amenity list"
          values={propertyForm.amenities ?? []}
          onChange={(amenities) => setPropertyForm((c) => ({ ...c, amenities }))}
          placeholder="e.g. Pool, Parking, Gym…"
          addButtonLabel="Add amenity"
        />
      </PropertyFormSection>

      <PropertyFormSection title="Tags" hint="Each row is one tag for the listing chips.">
        <PropertyStringListEditor
          label="Tags"
          values={propertyForm.tags ?? []}
          onChange={(tags) => setPropertyForm((c) => ({ ...c, tags }))}
          placeholder="e.g. Waterfront"
          addButtonLabel="Add tag"
        />
      </PropertyFormSection>

      <PropertyFormSection
        title="Reviews (optional)"
        hint="Social proof fields for the listing card; sample review is optional."
      >
        <FieldShell>
          <input
            id={f("rating")}
            className={control}
            aria-label="Rating average"
            inputMode="decimal"
            placeholder="e.g. 4.5"
            value={propertyForm.rating_average ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                rating_average: event.target.value.trim() ? event.target.value : null,
              }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("review-count")}
            className={control}
            aria-label="Review count"
            type="number"
            min={0}
            placeholder="e.g. 24"
            value={propertyForm.review_count ?? ""}
            onChange={(event) => {
              const raw = event.target.value
              setPropertyForm((current) => ({
                ...current,
                review_count: raw === "" ? undefined : Number(raw),
              }))
            }}
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("review-author")}
            className={control}
            aria-label="Sample review author"
            placeholder="e.g. Jane D."
            value={propertyForm.review_sample_author ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({ ...current, review_sample_author: event.target.value }))
            }
          />
        </FieldShell>
        <FieldShell>
          <input
            id={f("review-date")}
            className={control}
            aria-label="Sample review date"
            placeholder="YYYY-MM-DD"
            value={propertyForm.review_sample_date ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({
                ...current,
                review_sample_date: event.target.value.trim() ? event.target.value : null,
              }))
            }
          />
        </FieldShell>
        <FieldShell className="sm:col-span-2 lg:col-span-3">
          <textarea
            id={f("review-text")}
            className={cn(textareaControl, "min-h-12")}
            aria-label="Sample review text"
            placeholder="Short quote for the listing card…"
            value={propertyForm.review_sample_text ?? ""}
            onChange={(event) =>
              setPropertyForm((current) => ({ ...current, review_sample_text: event.target.value }))
            }
          />
        </FieldShell>
      </PropertyFormSection>
    </div>
  )
}
