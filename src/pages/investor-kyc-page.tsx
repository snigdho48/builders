import { useCallback, useEffect, useMemo, useState } from "react"

import { useToast } from "@/components/ui/use-toast"
import {
  createKycSubmission,
  getMe,
  listKycSubmissions,
  listKycTemplates,
  updateKycSubmissionResponses,
} from "@/services/api"
import type { KycFieldDefinition, KycTemplate, UserKycSubmission } from "@/types/domain"

function latestForTemplate(subs: UserKycSubmission[], templateId: number): UserKycSubmission | undefined {
  return subs.filter((s) => s.template === templateId).sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0]
}

function KycFieldInput({
  def,
  value,
  onChange,
}: {
  def: KycFieldDefinition
  value: unknown
  onChange: (v: unknown) => void
}) {
  const id = `kyc-${def.field_key}`
  if (def.input_type === "checkbox") {
    return (
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
        <input
          type="checkbox"
          id={id}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-white/20 bg-slate-900"
        />
        {def.label}
        {def.required ? <span className="text-rose-400">*</span> : null}
      </label>
    )
  }
  if (def.input_type === "textarea") {
    return (
      <label className="block text-sm">
        <span className="mb-1 block text-slate-300">
          {def.label}
          {def.required ? <span className="text-rose-400"> *</span> : null}
        </span>
        <textarea
          id={id}
          value={value != null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-[#f58e43]/50"
        />
      </label>
    )
  }
  if (def.input_type === "select") {
    return (
      <label className="block text-sm">
        <span className="mb-1 block text-slate-300">
          {def.label}
          {def.required ? <span className="text-rose-400"> *</span> : null}
        </span>
        <select
          id={id}
          value={value != null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-[#f58e43]/50"
        >
          <option value="">Select…</option>
          {def.choices.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label || c.value}
            </option>
          ))}
        </select>
      </label>
    )
  }
  const inputType =
    def.input_type === "email"
      ? "email"
      : def.input_type === "tel"
        ? "tel"
        : def.input_type === "number"
          ? "number"
          : def.input_type === "date"
            ? "date"
            : "text"
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-300">
        {def.label}
        {def.required ? <span className="text-rose-400"> *</span> : null}
      </span>
      <input
        id={id}
        type={inputType}
        value={value != null ? String(value) : ""}
        onChange={(e) => onChange(inputType === "number" ? e.target.value : e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none focus:border-[#f58e43]/50"
      />
    </label>
  )
}

function TemplateCard({
  tmpl,
  submission,
  onUpdated,
}: {
  tmpl: KycTemplate
  submission: UserKycSubmission | undefined
  onUpdated: () => void
}) {
  const { showToast } = useToast()
  const [busy, setBusy] = useState(false)
  const sortedFields = useMemo(
    () =>
      [...tmpl.fields]
        .filter((f) => f.enabled !== false)
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    [tmpl.fields]
  )
  const [responses, setResponses] = useState<Record<string, unknown>>(() => {
    const base: Record<string, unknown> = {}
    for (const f of sortedFields) {
      if (f.input_type === "checkbox") {
        base[f.field_key] = Boolean(submission?.responses?.[f.field_key])
      } else {
        base[f.field_key] = submission?.responses?.[f.field_key] != null ? String(submission.responses[f.field_key]) : ""
      }
    }
    return base
  })

  useEffect(() => {
    const base: Record<string, unknown> = {}
    for (const f of sortedFields) {
      if (f.input_type === "checkbox") {
        base[f.field_key] = Boolean(submission?.responses?.[f.field_key])
      } else {
        base[f.field_key] = submission?.responses?.[f.field_key] != null ? String(submission.responses[f.field_key]) : ""
      }
    }
    setResponses(base)
  }, [submission?.id, sortedFields, submission?.responses])

  const status = submission?.status
  const canEdit = !submission || status === "pending_review" || status === "rejected"

  async function submit() {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setBusy(true)
    try {
      if (submission && status === "pending_review") {
        await updateKycSubmissionResponses(submission.id, responses, token)
        showToast("Verification details updated.", "success")
      } else {
        await createKycSubmission({ template: tmpl.id, responses }, token)
        showToast("Submitted for review. You can checkout after staff approval.", "success")
      }
      onUpdated()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save.", "error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white">{tmpl.name}</h2>
          {tmpl.description ? <p className="mt-1 text-sm text-slate-400">{tmpl.description}</p> : null}
        </div>
        {status === "approved" ? (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
            Approved
          </span>
        ) : status === "pending_review" ? (
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100">
            Pending review
          </span>
        ) : status === "rejected" ? (
          <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-100">
            Rejected
          </span>
        ) : (
          <span className="rounded-full bg-slate-500/20 px-3 py-1 text-xs text-slate-300">Not submitted</span>
        )}
      </div>
      {status === "rejected" && submission?.review_note ? (
        <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {submission.review_note}
        </p>
      ) : null}
      {status === "approved" ? (
        <p className="mt-4 text-sm text-slate-400">You are cleared for checkout on the cart.</p>
      ) : canEdit ? (
        <div className="mt-4 space-y-4">
          {sortedFields.map((f) => (
            <KycFieldInput
              key={f.id}
              def={f}
              value={responses[f.field_key]}
              onChange={(v) => setResponses((r) => ({ ...r, [f.field_key]: v }))}
            />
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="rounded-lg bg-[#f58e43] px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-[#ffa14d] disabled:opacity-50"
          >
            {busy ? "Saving…" : submission && status === "pending_review" ? "Save changes" : "Submit for review"}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function InvestorKycPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [meReady, setMeReady] = useState(true)
  const [missing, setMissing] = useState<{ id: number; name: string; slug: string }[]>([])
  const [templates, setTemplates] = useState<KycTemplate[]>([])
  const [submissions, setSubmissions] = useState<UserKycSubmission[]>([])

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [me, tlist, slist] = await Promise.all([getMe(token), listKycTemplates(token), listKycSubmissions(token)])
      setMeReady(me.kyc_checkout_ready)
      setMissing(me.kyc_missing_templates ?? [])
      setTemplates(tlist.filter((t) => t.is_active && t.required_for_checkout))
      setSubmissions(slist)
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load verification.", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  const requiredCards = useMemo(() => {
    return templates.map((tmpl) => ({
      tmpl,
      submission: latestForTemplate(submissions, tmpl.id),
    }))
  }, [templates, submissions])

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Identity verification (KYC)</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Staff-defined checks you must complete and have approved before you can submit investment checkout requests
          from your cart.
        </p>
      </header>

      {!meReady && missing.length > 0 ? (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Checkout is blocked until the following {missing.length === 1 ? "form is" : "forms are"} approved:{" "}
          <strong>{missing.map((m) => m.name).join(", ")}</strong>.
        </div>
      ) : meReady ? (
        <div className="mb-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Your verification meets checkout requirements.
        </div>
      ) : null}

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : templates.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-slate-400">
          No verification forms are required right now. If checkout still fails, contact support.
        </p>
      ) : (
        <div className="flex max-w-2xl flex-col gap-6">
          {requiredCards.map(({ tmpl, submission }) => (
            <TemplateCard key={tmpl.id} tmpl={tmpl} submission={submission} onUpdated={() => void load()} />
          ))}
        </div>
      )}
    </section>
  )
}
