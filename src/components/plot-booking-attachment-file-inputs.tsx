import { useToast } from "@/components/ui/use-toast"
import type { PlotBookingAttachmentFiles, PlotBookingAttachmentSlot } from "@/content/plot-booking-application-form"
import { PLOT_BOOKING_ATTACHMENT_SLOTS } from "@/content/plot-booking-application-form"

const MAX_BYTES = 10 * 1024 * 1024

export const BOOKING_ATTACHMENT_LABELS: Record<PlotBookingAttachmentSlot, { title: string; hint: string }> = {
  passport_photo_1: {
    title: "পাসপোর্ট সাইজ ছবি / Passport-size photo upload",
    hint: "JPG, PNG, WebP, or PDF · max 10 MB · required",
  },
  nid_or_id: {
    title: "জাতীয় পরিচয়পত্র বা নির্বাচিত পরিচয়পত্রের কপি / Photo identity document",
    hint: "Upload one file matching your Photo Identity selection above · max 10 MB · required",
  },
  booking_money_receipt: {
    title: "বুকিং মানি রসিদ বা প্রমাণ / Booking money receipt or proof",
    hint: "JPG, PNG, WebP, or PDF · max 10 MB · required",
  },
}

/** Shared styling for booking-related file inputs (primary + joint applicants). */
export const BOOKING_ATTACHMENT_FILE_INPUT_CLASS =
  "block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#0b1f44]/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[#0b1f44] hover:border-[#f58e43]/60"

const inp = BOOKING_ATTACHMENT_FILE_INPUT_CLASS

type FieldProps = {
  slot: PlotBookingAttachmentSlot
  file: File | null
  onChange: (file: File | null) => void
  /** When false, missing file shows optional styling (default: required). */
  required?: boolean
}

/** Single booking attachment row — reused in Attachment section and elsewhere. */
export function PlotBookingAttachmentField({ slot, file, onChange, required = true }: FieldProps) {
  const { showToast } = useToast()
  const meta = BOOKING_ATTACHMENT_LABELS[slot]

  function handlePick(list: FileList | null) {
    const f = list?.[0] ?? null
    if (!f) {
      onChange(null)
      return
    }
    if (f.size > MAX_BYTES) {
      showToast(`File too large (max ${MAX_BYTES / (1024 * 1024)} MB).`, "error")
      return
    }
    onChange(f)
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-800">{meta.title}</span>
      <span className="text-[11px] text-slate-500">{meta.hint}</span>
      <input type="file" className={inp} accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.pdf,application/pdf" onChange={(e) => handlePick(e.target.files)} />
      {file ? (
        <span className="text-[11px] font-medium text-emerald-700">
          Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)
        </span>
      ) : (
        <span className={`text-[11px] ${required ? "text-amber-700" : "text-slate-500"}`}>{required ? "Required" : "Optional"}</span>
      )}
    </label>
  )
}

type Props = {
  files: PlotBookingAttachmentFiles
  onChange: (slot: PlotBookingAttachmentSlot, file: File | null) => void
  /** Defaults to all three slots. */
  slots?: PlotBookingAttachmentSlot[]
  /** Show section title + intro (standalone block). Hidden when embedded in Attachment. */
  showSectionHeader?: boolean
}

export function PlotBookingAttachmentFileInputs({ files, onChange, slots, showSectionHeader = true }: Props) {
  const keys = slots ?? PLOT_BOOKING_ATTACHMENT_SLOTS

  return (
    <div className={showSectionHeader ? "mt-4 space-y-4" : "space-y-4"}>
      {showSectionHeader ? (
        <>
          <h3 className="text-sm font-bold text-[#0b1f44]">ফাইল আপলোড / Upload files</h3>
          <p className="text-xs text-slate-600">
            নীতিমালা অনুযায়ী নিম্নের তিনটি ফাইল আপলোড করুন। অনলাইনে জমা দেওয়ার পর প্রয়োজনে অফিসে মূল কাগজ দেখাতে হতে পারে।
          </p>
        </>
      ) : null}
      {keys.map((slot) => (
        <PlotBookingAttachmentField key={slot} slot={slot} file={files[slot]} onChange={(f) => onChange(slot, f)} />
      ))}
    </div>
  )
}
