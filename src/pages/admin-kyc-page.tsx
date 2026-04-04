import { useCallback, useEffect, useMemo, useState } from "react"
import { faCheck, faPenToSquare, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons"

import { DashboardModal } from "@/components/dashboard/dashboard-modal"
import { DashboardTablePagination } from "@/components/ui/dashboard-table-pagination"
import { stickyActionsTdAdminClass, stickyActionsThAdminClass } from "@/components/ui/sticky-table-actions"
import { TableActionIconButton } from "@/components/ui/table-action-button"
import { useToast } from "@/components/ui/use-toast"
import {
  createKycTemplate,
  deleteKycSubmission,
  deleteKycTemplate,
  listKycSubmissions,
  listKycTemplates,
  patchKycTemplate,
  reviewKycSubmission,
  type KycFieldDefinitionWrite,
} from "@/services/api"
import type { KycFieldDefinition, KycTemplate, UserKycSubmission } from "@/types/domain"

const INPUT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "text", label: "Text (e.g. NID, name)" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "textarea", label: "Long text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "file", label: "File (URL text)" },
  { value: "checkbox", label: "Checkbox" },
]

const VALIDATION_OPTIONS: { value: string; label: string }[] = [
  { value: "none", label: "None" },
  { value: "email", label: "Email format" },
  { value: "phone", label: "Phone format" },
  { value: "regex", label: "Regular expression" },
  { value: "min_length", label: "Minimum length" },
  { value: "max_length", label: "Maximum length" },
  { value: "min_value", label: "Minimum value (numbers)" },
  { value: "max_value", label: "Maximum value (numbers)" },
]

function newClientId(): string {
  return `f-${Math.random().toString(36).slice(2, 11)}`
}

type FieldDraft = {
  clientId: string
  field_key: string
  label: string
  input_type: string
  validation_type: string
  validation_pattern: string
  validation_min: string
  validation_max: string
  required: boolean
  enabled: boolean
  choicesText: string
}

function emptyFieldRow(): FieldDraft {
  return {
    clientId: newClientId(),
    field_key: "",
    label: "",
    input_type: "text",
    validation_type: "none",
    validation_pattern: "",
    validation_min: "",
    validation_max: "",
    required: true,
    enabled: true,
    choicesText: "",
  }
}

function fieldToDraft(f: KycFieldDefinition): FieldDraft {
  const cfg = f.validation_config ?? {}
  let validation_pattern = ""
  let validation_min = ""
  let validation_max = ""
  const vt = f.validation_type || "none"
  if (vt === "regex") validation_pattern = String(cfg.pattern ?? "")
  if (vt === "min_length") validation_min = cfg.min != null ? String(cfg.min) : ""
  if (vt === "max_length") validation_max = cfg.max != null ? String(cfg.max) : ""
  if (vt === "min_value") validation_min = cfg.min != null ? String(cfg.min) : ""
  if (vt === "max_value") validation_max = cfg.max != null ? String(cfg.max) : ""
  const choicesText = (f.choices ?? []).map((c) => `${c.value}|${c.label || c.value}`).join("\n")
  return {
    clientId: newClientId(),
    field_key: f.field_key,
    label: f.label,
    input_type: f.input_type,
    validation_type: vt,
    validation_pattern,
    validation_min,
    validation_max,
    required: f.required,
    enabled: f.enabled !== false,
    choicesText,
  }
}

function parseChoices(text: string): { value: string; label: string }[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const pipe = line.indexOf("|")
      if (pipe === -1) return { value: line, label: line }
      const value = line.slice(0, pipe).trim()
      const label = line.slice(pipe + 1).trim() || value
      return { value, label }
    })
}

function buildValidationConfig(row: FieldDraft): Record<string, unknown> {
  const vt = row.validation_type
  if (vt === "regex" && row.validation_pattern.trim()) {
    return { pattern: row.validation_pattern.trim() }
  }
  if (vt === "min_length" && row.validation_min.trim() !== "") {
    const min = Number(row.validation_min)
    return Number.isFinite(min) ? { min } : {}
  }
  if (vt === "max_length" && row.validation_max.trim() !== "") {
    const max = Number(row.validation_max)
    return Number.isFinite(max) ? { max } : {}
  }
  if (vt === "min_value" && row.validation_min.trim() !== "") {
    const min = Number(row.validation_min)
    return Number.isFinite(min) ? { min } : {}
  }
  if (vt === "max_value" && row.validation_max.trim() !== "") {
    const max = Number(row.validation_max)
    return Number.isFinite(max) ? { max } : {}
  }
  return {}
}

function rowToPayload(row: FieldDraft, sort_order: number): KycFieldDefinitionWrite {
  return {
    field_key: row.field_key.trim(),
    label: row.label.trim(),
    input_type: row.input_type,
    validation_type: row.validation_type,
    validation_config: buildValidationConfig(row),
    required: row.required,
    enabled: row.enabled,
    sort_order,
    choices: row.input_type === "select" ? parseChoices(row.choicesText) : [],
  }
}

const SLUG_KEY = /^[a-z0-9][a-z0-9_-]*$/i

function templateDraftFromTemplate(t: KycTemplate): {
  name: string
  slug: string
  description: string
  is_active: boolean
  required_for_checkout: boolean
  fieldRows: FieldDraft[]
} {
  const rows = [...t.fields].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id).map(fieldToDraft)
  return {
    name: t.name,
    slug: t.slug,
    description: t.description ?? "",
    is_active: t.is_active,
    required_for_checkout: t.required_for_checkout,
    fieldRows: rows.length > 0 ? rows : [emptyFieldRow()],
  }
}

function newTemplateDraft() {
  return {
    name: "",
    slug: "",
    description: "",
    is_active: true,
    required_for_checkout: false,
    fieldRows: [emptyFieldRow()],
  }
}

export function AdminKycPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<KycTemplate[]>([])
  const [submissions, setSubmissions] = useState<UserKycSubmission[]>([])
  const [busyId, setBusyId] = useState<number | null>(null)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editorBusy, setEditorBusy] = useState(false)
  const [draft, setDraft] = useState(() => newTemplateDraft())
  const [templatePage, setTemplatePage] = useState(1)
  const [submissionPage, setSubmissionPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      const [t, s] = await Promise.all([listKycTemplates(token), listKycSubmissions(token)])
      setTemplates(t)
      setSubmissions(s)
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load KYC.", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  async function toggleTemplate(t: KycTemplate, field: "is_active" | "required_for_checkout", value: boolean) {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setBusyId(-t.id)
    try {
      const updated = await patchKycTemplate(t.id, { [field]: value }, token)
      setTemplates((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      showToast("Template updated.", "success")
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Update failed.", "error")
    } finally {
      setBusyId(null)
    }
  }

  function openNew() {
    setEditingId(null)
    setDraft(newTemplateDraft())
    setEditorOpen(true)
  }

  function openEdit(t: KycTemplate) {
    setEditingId(t.id)
    setDraft(templateDraftFromTemplate(t))
    setEditorOpen(true)
  }

  function closeEditor() {
    setEditorOpen(false)
    setEditingId(null)
  }

  const editorTitle = editingId == null ? "New KYC template" : "Edit KYC template"

  async function saveTemplate() {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    const name = draft.name.trim()
    const slug = draft.slug.trim()
    if (!name) {
      showToast("Name is required.", "error")
      return
    }
    if (!slug || !SLUG_KEY.test(slug)) {
      showToast("Slug must start with a letter or number and use only letters, numbers, underscores, or hyphens.", "error")
      return
    }
    const filledRows = draft.fieldRows.filter((r) => r.field_key.trim() && r.label.trim())
    const keys = filledRows.map((r) => r.field_key.trim())
    if (new Set(keys).size !== keys.length) {
      showToast("Each field must have a unique key.", "error")
      return
    }
    for (const r of filledRows) {
      if (!SLUG_KEY.test(r.field_key.trim())) {
        showToast(`Invalid field key: ${r.field_key}`, "error")
        return
      }
      if (r.input_type === "select" && parseChoices(r.choicesText).length === 0) {
        showToast(`Dropdown "${r.label}" needs at least one choice (value|label per line).`, "error")
        return
      }
    }
    const fields = filledRows.map((r, i) => rowToPayload(r, i))
    const body = {
      name,
      slug,
      description: draft.description.trim(),
      is_active: draft.is_active,
      required_for_checkout: draft.required_for_checkout,
      fields,
    }
    setEditorBusy(true)
    try {
      if (editingId == null) {
        const created = await createKycTemplate(body, token)
        setTemplates((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
        showToast("Template created.", "success")
      } else {
        const updated = await patchKycTemplate(editingId, body, token)
        setTemplates((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
        showToast("Template saved.", "success")
      }
      closeEditor()
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Save failed.", "error")
    } finally {
      setEditorBusy(false)
    }
  }

  async function review(sub: UserKycSubmission, status: "approved" | "rejected") {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    let review_note: string | undefined
    if (status === "rejected") {
      const note = window.prompt("Rejection note (optional):") ?? ""
      review_note = note.trim() || undefined
    }
    setBusyId(sub.id)
    try {
      await reviewKycSubmission(sub.id, { status, review_note }, token)
      showToast(status === "approved" ? "Approved." : "Rejected.", "success")
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Review failed.", "error")
    } finally {
      setBusyId(null)
    }
  }

  async function removeTemplate(t: KycTemplate) {
    if (!window.confirm(`Delete template "${t.name}" and its submissions? This cannot be undone.`)) {
      return
    }
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setBusyId(-t.id)
    try {
      await deleteKycTemplate(t.id, token)
      showToast("Template deleted.", "success")
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Delete failed.", "error")
    } finally {
      setBusyId(null)
    }
  }

  async function removeSubmission(s: UserKycSubmission) {
    if (!window.confirm(`Delete this ${s.status.replace(/_/g, " ")} submission for ${s.user_username ?? `#${s.user}`}?`)) {
      return
    }
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setBusyId(s.id)
    try {
      await deleteKycSubmission(s.id, token)
      showToast("Submission deleted.", "success")
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Delete failed.", "error")
    } finally {
      setBusyId(null)
    }
  }

  const fieldEditor = useMemo(
    () => (
      <div className="max-h-[min(70vh,520px)] space-y-4 overflow-y-auto pr-1">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-400">Name</span>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-400">Slug (URL id)</span>
            <input
              value={draft.slug}
              onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 font-mono text-sm text-white"
              disabled={editingId != null}
              title={editingId != null ? "Slug cannot be changed after creation" : undefined}
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">Description</span>
          <textarea
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
          />
        </label>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-200">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))}
              className="rounded border-white/20"
            />
            Template active
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-slate-200">
            <input
              type="checkbox"
              checked={draft.required_for_checkout}
              disabled={!draft.is_active}
              onChange={(e) => setDraft((d) => ({ ...d, required_for_checkout: e.target.checked }))}
              className="rounded border-white/20"
            />
            Required for checkout
          </label>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-white">Investor form fields</h3>
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, fieldRows: [...d.fieldRows, emptyFieldRow()] }))}
              className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-white/10"
            >
              Add field
            </button>
          </div>
          <p className="mb-3 text-xs text-slate-500">
            Input type is what investors see. Validation adds rules. Required / optional and Enabled control visibility and
            validation.
          </p>
          <div className="space-y-3">
            {draft.fieldRows.map((row, idx) => (
              <div
                key={row.clientId}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs sm:text-sm"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-slate-500">#{idx + 1}</span>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() =>
                      setDraft((d) => {
                        const next = [...d.fieldRows]
                        ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
                        return { ...d, fieldRows: next }
                      })
                    }
                    className="rounded border border-white/10 px-1.5 py-0.5 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    disabled={idx >= draft.fieldRows.length - 1}
                    onClick={() =>
                      setDraft((d) => {
                        const next = [...d.fieldRows]
                        ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
                        return { ...d, fieldRows: next }
                      })
                    }
                    className="rounded border border-white/10 px-1.5 py-0.5 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        fieldRows: d.fieldRows.length > 1 ? d.fieldRows.filter((_, i) => i !== idx) : d.fieldRows,
                      }))
                    }
                    className="ml-auto rounded border border-rose-500/40 px-1.5 py-0.5 text-rose-300 hover:bg-rose-500/10"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-0.5 block text-slate-500">Label (shown to investor)</span>
                    <input
                      value={row.label}
                      onChange={(e) => {
                        const label = e.target.value
                        setDraft((d) => ({
                          ...d,
                          fieldRows: d.fieldRows.map((r, i) =>
                            i === idx ? { ...r, label, field_key: r.field_key || slugify(label) } : r
                          ),
                        }))
                      }}
                      placeholder="e.g. National ID"
                      className="w-full rounded border border-white/10 bg-slate-900/80 px-2 py-1.5 text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-slate-500">Field key (machine name)</span>
                    <input
                      value={row.field_key}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          fieldRows: d.fieldRows.map((r, i) => (i === idx ? { ...r, field_key: e.target.value } : r)),
                        }))
                      }
                      placeholder="national_id"
                      className="w-full rounded border border-white/10 bg-slate-900/80 px-2 py-1.5 font-mono text-white"
                    />
                  </label>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-0.5 block text-slate-500">Input type</span>
                    <select
                      value={row.input_type}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          fieldRows: d.fieldRows.map((r, i) => (i === idx ? { ...r, input_type: e.target.value } : r)),
                        }))
                      }
                      className="w-full rounded border border-white/10 bg-slate-900/80 px-2 py-1.5 text-white"
                    >
                      {INPUT_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-slate-500">Validation</span>
                    <select
                      value={row.validation_type}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          fieldRows: d.fieldRows.map((r, i) =>
                            i === idx ? { ...r, validation_type: e.target.value } : r
                          ),
                        }))
                      }
                      className="w-full rounded border border-white/10 bg-slate-900/80 px-2 py-1.5 text-white"
                    >
                      {VALIDATION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {row.validation_type === "regex" ? (
                  <label className="mt-2 block">
                    <span className="mb-0.5 block text-slate-500">Regex pattern</span>
                    <input
                      value={row.validation_pattern}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          fieldRows: d.fieldRows.map((r, i) =>
                            i === idx ? { ...r, validation_pattern: e.target.value } : r
                          ),
                        }))
                      }
                      className="w-full rounded border border-white/10 bg-slate-900/80 px-2 py-1.5 font-mono text-sm text-white"
                    />
                  </label>
                ) : null}
                {row.validation_type === "min_length" ? (
                  <label className="mt-2 block">
                    <span className="mb-0.5 block text-slate-500">Min length</span>
                    <input
                      type="number"
                      value={row.validation_min}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          fieldRows: d.fieldRows.map((r, i) =>
                            i === idx ? { ...r, validation_min: e.target.value } : r
                          ),
                        }))
                      }
                      className="w-full max-w-[200px] rounded border border-white/10 bg-slate-900/80 px-2 py-1.5 text-white"
                    />
                  </label>
                ) : null}
                {row.validation_type === "max_length" ? (
                  <label className="mt-2 block">
                    <span className="mb-0.5 block text-slate-500">Max length</span>
                    <input
                      type="number"
                      value={row.validation_max}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          fieldRows: d.fieldRows.map((r, i) =>
                            i === idx ? { ...r, validation_max: e.target.value } : r
                          ),
                        }))
                      }
                      className="w-full max-w-[200px] rounded border border-white/10 bg-slate-900/80 px-2 py-1.5 text-white"
                    />
                  </label>
                ) : null}
                {row.validation_type === "min_value" ? (
                  <label className="mt-2 block">
                    <span className="mb-0.5 block text-slate-500">Minimum</span>
                    <input
                      type="number"
                      value={row.validation_min}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          fieldRows: d.fieldRows.map((r, i) =>
                            i === idx ? { ...r, validation_min: e.target.value } : r
                          ),
                        }))
                      }
                      className="w-full max-w-[200px] rounded border border-white/10 bg-slate-900/80 px-2 py-1.5 text-white"
                    />
                  </label>
                ) : null}
                {row.validation_type === "max_value" ? (
                  <label className="mt-2 block">
                    <span className="mb-0.5 block text-slate-500">Maximum</span>
                    <input
                      type="number"
                      value={row.validation_max}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          fieldRows: d.fieldRows.map((r, i) =>
                            i === idx ? { ...r, validation_max: e.target.value } : r
                          ),
                        }))
                      }
                      className="w-full max-w-[200px] rounded border border-white/10 bg-slate-900/80 px-2 py-1.5 text-white"
                    />
                  </label>
                ) : null}
                {row.input_type === "select" ? (
                  <label className="mt-2 block">
                    <span className="mb-0.5 block text-slate-500">Choices (one per line: value|label)</span>
                    <textarea
                      value={row.choicesText}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          fieldRows: d.fieldRows.map((r, i) =>
                            i === idx ? { ...r, choicesText: e.target.value } : r
                          ),
                        }))
                      }
                      rows={3}
                      placeholder={"bd|Bangladesh\nus|United States"}
                      className="w-full rounded border border-white/10 bg-slate-900/80 px-2 py-1.5 font-mono text-xs text-white"
                    />
                  </label>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={row.required}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          fieldRows: d.fieldRows.map((r, i) =>
                            i === idx ? { ...r, required: e.target.checked } : r
                          ),
                        }))
                      }
                      className="rounded border-white/20"
                    />
                    Required
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          fieldRows: d.fieldRows.map((r, i) =>
                            i === idx ? { ...r, enabled: e.target.checked } : r
                          ),
                        }))
                      }
                      className="rounded border-white/20"
                    />
                    Enabled (show on form)
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    [draft, editingId]
  )

  const templateById = useMemo(() => {
    return new Map(templates.map((t) => [t.id, t]))
  }, [templates])

  const dynamicResponseColumns = useMemo(() => {
    const seen = new Set<string>()
    const cols: { key: string; label: string }[] = []

    // Build columns from active template definitions used by current submissions.
    for (const s of submissions) {
      const tmpl = templateById.get(s.template)
      const defs = tmpl?.fields ?? []
      for (const fd of defs) {
        if (seen.has(fd.field_key)) continue
        seen.add(fd.field_key)
        cols.push({ key: fd.field_key, label: fd.label || fd.field_key })
      }
    }

    // Also include unknown response keys (if legacy submissions have fields not in current template definition).
    for (const s of submissions) {
      for (const key of Object.keys(s.responses ?? {})) {
        if (seen.has(key)) continue
        seen.add(key)
        cols.push({ key, label: key.replace(/_/g, " ") })
      }
    }

    return cols
  }, [submissions, templateById])
  const templateTotalPages = Math.max(1, Math.ceil(templates.length / pageSize))
  const templateCurrentPage = Math.min(templatePage, templateTotalPages)
  const pagedTemplates = useMemo(() => {
    const start = (templateCurrentPage - 1) * pageSize
    return templates.slice(start, start + pageSize)
  }, [templates, templateCurrentPage, pageSize])
  const submissionTotalPages = Math.max(1, Math.ceil(submissions.length / pageSize))
  const submissionCurrentPage = Math.min(submissionPage, submissionTotalPages)
  const pagedSubmissions = useMemo(() => {
    const start = (submissionCurrentPage - 1) * pageSize
    return submissions.slice(start, start + pageSize)
  }, [submissions, submissionCurrentPage, pageSize])

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">KYC templates & reviews</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Build verification forms: choose input types (email, phone, text for NID, etc.), set optional vs required, and
            enable or hide fields. Turn on <strong className="text-slate-200">Required for checkout</strong> so investors
            must be approved before cart checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openNew()}
          className="rounded-lg bg-[#f58e43] px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-[#ffa14d]"
        >
          New template
        </button>
      </header>

      <DashboardModal
        open={editorOpen}
        title={editorTitle}
        onClose={() => !editorBusy && closeEditor()}
        wide
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={editorBusy}
              onClick={() => closeEditor()}
              className="dashboard-modal-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={editorBusy}
              onClick={() => void saveTemplate()}
              className="rounded-lg bg-[#f58e43] px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-[#ffa14d] disabled:opacity-50"
            >
              {editorBusy ? "Saving…" : "Save template"}
            </button>
          </div>
        }
      >
        {fieldEditor}
      </DashboardModal>

      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Templates</h2>
        <label className="text-xs text-slate-400">
          Page size
          <select
            className="ml-2 rounded border border-white/20 bg-slate-900/90 px-2 py-1 text-xs text-white"
            value={String(pageSize)}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setTemplatePage(1)
              setSubmissionPage(1)
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
      </div>
      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : templates.length === 0 ? (
        <p className="mb-8 text-slate-500">
          No templates yet. Use <strong className="text-slate-300">New template</strong> to create one.
        </p>
      ) : (
        <div className="mb-10 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Fields</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Required for checkout</th>
                <th className={stickyActionsThAdminClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedTemplates.map((t) => (
                <tr key={t.id} className="border-b border-white/5">
                  <td className="px-3 py-2 font-medium text-white">{t.name}</td>
                  <td className="px-3 py-2 text-slate-400">{t.slug}</td>
                  <td className="px-3 py-2 text-slate-400">{t.fields?.length ?? 0}</td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={t.is_active}
                      disabled={busyId === -t.id}
                      onChange={(e) => void toggleTemplate(t, "is_active", e.target.checked)}
                      className="rounded border-white/20"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={t.required_for_checkout}
                      disabled={busyId === -t.id || !t.is_active}
                      onChange={(e) => void toggleTemplate(t, "required_for_checkout", e.target.checked)}
                      className="rounded border-white/20"
                    />
                  </td>
                  <td className={stickyActionsTdAdminClass}>
                    <div className="inline-flex items-center justify-end gap-2">
                      <TableActionIconButton icon={faPenToSquare} label="Edit form" tone="neutral" onClick={() => openEdit(t)} />
                      <TableActionIconButton
                        icon={faTrash}
                        label="Delete template"
                        tone="danger"
                        disabled={busyId === -t.id}
                        onClick={() => void removeTemplate(t)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && templates.length > 0 ? (
        <DashboardTablePagination
          className="mb-6 mt-3"
          page={templateCurrentPage}
          totalPages={templateTotalPages}
          pageSize={pageSize}
          totalItems={templates.length}
          onPageChange={setTemplatePage}
        />
      ) : null}

      <h2 className="mb-3 text-lg font-semibold text-white">KYC approval</h2>
      {!loading && submissions.length === 0 ? (
        <p className="text-slate-500">No submissions yet.</p>
      ) : !loading ? (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="border-b border-white/10 bg-white/4 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">Investor</th>
                <th className="px-3 py-2">Template</th>
                <th className="px-3 py-2">Status</th>
                {dynamicResponseColumns.map((col) => (
                  <th key={col.key} className="px-3 py-2">
                    {col.label}
                  </th>
                ))}
                <th className={stickyActionsThAdminClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedSubmissions.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{s.user_username ?? `#${s.user}`}</div>
                    {s.user_email ? <div className="text-xs text-slate-500">{s.user_email}</div> : null}
                  </td>
                  <td className="px-3 py-2">{s.template_name ?? `#${s.template}`}</td>
                  <td className="px-3 py-2 capitalize">{s.status.replace(/_/g, " ")}</td>
                  {dynamicResponseColumns.map((col) => {
                    const raw = s.responses?.[col.key]
                    const text = raw == null || raw === "" ? null : typeof raw === "boolean" ? (raw ? "Yes" : "No") : String(raw)
                    return (
                      <td key={col.key} className="max-w-[200px] truncate px-3 py-2 text-sm text-slate-200" title={text ?? "—"}>
                        {text ?? <span className="text-slate-500">—</span>}
                      </td>
                    )
                  })}
                  <td className={stickyActionsTdAdminClass}>
                    {s.status === "pending_review" ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        <TableActionIconButton
                          icon={faCheck}
                          label="Approve submission"
                          tone="success"
                          disabled={busyId === s.id}
                          onClick={() => void review(s, "approved")}
                        />
                        <TableActionIconButton
                          icon={faXmark}
                          label="Reject submission"
                          tone="danger"
                          disabled={busyId === s.id}
                          onClick={() => void review(s, "rejected")}
                        />
                        <TableActionIconButton
                          icon={faTrash}
                          label="Delete submission"
                          tone="danger"
                          disabled={busyId === s.id}
                          onClick={() => void removeSubmission(s)}
                        />
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <TableActionIconButton
                          icon={faTrash}
                          label="Delete submission"
                          tone="danger"
                          disabled={busyId === s.id}
                          onClick={() => void removeSubmission(s)}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {!loading && submissions.length > 0 ? (
        <DashboardTablePagination
          className="mt-3"
          page={submissionCurrentPage}
          totalPages={submissionTotalPages}
          pageSize={pageSize}
          totalItems={submissions.length}
          onPageChange={setSubmissionPage}
        />
      ) : null}
    </section>
  )
}

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80)
}
