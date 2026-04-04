import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { DashboardTablePagination } from "@/components/ui/dashboard-table-pagination"
import { TableLoader } from "@/components/ui/table-loader"
import { createPaymentRequest, listInvestments, listPaymentRequests, listPayments } from "@/services/api"
import { formatBdtAmount } from "@/utils/currency"
import type { Investment, PaymentRecord, PaymentRequestRecord } from "@/types/domain"

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
}

function paymentMethodLabel(m: string): string {
  if (m === "card") return "Card"
  if (m === "bank") return "Bank transfer"
  if (m === "cash") return "Cash"
  return m
}

function statusClass(status: string): string {
  if (status === "approved") return "bg-emerald-500/20 text-emerald-300"
  if (status === "pending") return "bg-amber-500/20 text-amber-200"
  if (status === "rejected") return "bg-rose-500/20 text-rose-200"
  return "bg-white/10 text-slate-300"
}

export function InvestorStatementsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequestRecord[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")
  const [installmentStatusFilter, setInstallmentStatusFilter] = useState<string>("all")
  const [paymentPage, setPaymentPage] = useState(1)
  const [paymentPageSize, setPaymentPageSize] = useState(10)
  const [installmentPage, setInstallmentPage] = useState(1)
  const [installmentPageSize, setInstallmentPageSize] = useState(10)
  const [requestPage, setRequestPage] = useState(1)
  const [requestPageSize, setRequestPageSize] = useState(10)
  const [requestInvestmentId, setRequestInvestmentId] = useState<string>("")
  const [requestAmount, setRequestAmount] = useState("")
  const [requestMethod, setRequestMethod] = useState("bank")
  const [requestNote, setRequestNote] = useState("")
  const [requestBusy, setRequestBusy] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([listPayments(token), listInvestments(token), listPaymentRequests(token)])
      .then(([p, inv, req]) => {
        setPayments(p)
        setInvestments(inv)
        setPaymentRequests(req)
      })
      .catch(() => {
        setPayments([])
        setInvestments([])
        setPaymentRequests([])
      })
      .finally(() => setLoading(false))
  }, [])

  const installmentsFlat = useMemo(() => {
    const rows: { id: string; propertyTitle: string; amount: string; due: string; status: string }[] = []
    for (const inv of investments) {
      const title = inv.property_title
      for (const ins of inv.installments ?? []) {
        rows.push({
          id: `${inv.id}-${ins.id}`,
          propertyTitle: title,
          amount: ins.amount,
          due: ins.due_date,
          status: ins.status,
        })
      }
    }
    return rows.sort((a, b) => a.due.localeCompare(b.due))
  }, [investments])

  const filteredPayments = useMemo(() => {
    let list = payments
    if (paymentStatusFilter !== "all") {
      list = list.filter((p) => p.status === paymentStatusFilter)
    }
    if (paymentMethodFilter !== "all") {
      list = list.filter((p) => p.method === paymentMethodFilter)
    }
    return list
  }, [payments, paymentStatusFilter, paymentMethodFilter])
  useEffect(() => {
    setPaymentPage(1)
  }, [paymentStatusFilter, paymentMethodFilter])

  const paymentMethodOptions = useMemo(() => {
    const set = new Set(payments.map((p) => p.method).filter(Boolean))
    return Array.from(set).sort()
  }, [payments])

  const filteredInstallments = useMemo(() => {
    if (installmentStatusFilter === "all") {
      return installmentsFlat
    }
    return installmentsFlat.filter((r) => r.status === installmentStatusFilter)
  }, [installmentsFlat, installmentStatusFilter])
  useEffect(() => {
    setInstallmentPage(1)
  }, [installmentStatusFilter])

  const paymentTotalPages = Math.max(1, Math.ceil(filteredPayments.length / paymentPageSize))
  const paymentCurrentPage = Math.min(paymentPage, paymentTotalPages)
  const pagedPayments = useMemo(() => {
    const start = (paymentCurrentPage - 1) * paymentPageSize
    return filteredPayments.slice(start, start + paymentPageSize)
  }, [filteredPayments, paymentCurrentPage, paymentPageSize])

  const installmentTotalPages = Math.max(1, Math.ceil(filteredInstallments.length / installmentPageSize))
  const installmentCurrentPage = Math.min(installmentPage, installmentTotalPages)
  const pagedInstallments = useMemo(() => {
    const start = (installmentCurrentPage - 1) * installmentPageSize
    return filteredInstallments.slice(start, start + installmentPageSize)
  }, [filteredInstallments, installmentCurrentPage, installmentPageSize])

  const installmentStatusOptions = useMemo(() => {
    const set = new Set(installmentsFlat.map((r) => r.status).filter(Boolean))
    return Array.from(set).sort()
  }, [installmentsFlat])

  const installmentInvestments = useMemo(
    () => investments.filter((i) => i.type === "installment"),
    [investments]
  )
  const requestTotalPages = Math.max(1, Math.ceil(paymentRequests.length / requestPageSize))
  const requestCurrentPage = Math.min(requestPage, requestTotalPages)
  const pagedRequests = useMemo(() => {
    const start = (requestCurrentPage - 1) * requestPageSize
    return paymentRequests.slice(start, start + requestPageSize)
  }, [paymentRequests, requestCurrentPage, requestPageSize])

  async function submitInstallmentRequest() {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    const invId = Number(requestInvestmentId)
    const amount = requestAmount.trim()
    if (!invId || !amount) return
    setRequestBusy(true)
    try {
      await createPaymentRequest(
        { investment: invId, amount, method: requestMethod, note: requestNote.trim() || undefined },
        token
      )
      const latest = await listPaymentRequests(token)
      setPaymentRequests(latest)
      setRequestPage(1)
      setRequestAmount("")
      setRequestNote("")
    } finally {
      setRequestBusy(false)
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold text-white">Statements &amp; payments</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Payment activity and installment schedule for your account. Official tax documents can be exported from
          here when your administrator enables downloads.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white">Payments</h3>
        {loading ? (
          <TableLoader rows={4} cols={5} className="mt-4" />
        ) : payments.length === 0 ? (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-sm text-slate-400">
            No payment records yet. Completed checkout flows will appear here.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="dashboard-filters-row">
              <div className="dashboard-filter-group min-w-[140px]">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
                <div className="dashboard-filter-select-shell">
                  <CompactFormSelect
                    ariaLabel="Filter payments by status"
                    value={paymentStatusFilter}
                    onValueChange={setPaymentStatusFilter}
                    options={[
                      { value: "all", label: "All statuses" },
                      { value: "pending", label: "Pending" },
                      { value: "approved", label: "Approved" },
                      { value: "rejected", label: "Rejected" },
                    ]}
                  />
                </div>
              </div>
              <div className="dashboard-filter-group min-w-[140px]">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Method</span>
                <div className="dashboard-filter-select-shell">
                  <CompactFormSelect
                    ariaLabel="Filter payments by method"
                    value={paymentMethodFilter}
                    onValueChange={setPaymentMethodFilter}
                    options={[
                      { value: "all", label: "All methods" },
                      ...paymentMethodOptions.map((m) => ({ value: m, label: paymentMethodLabel(m) })),
                    ]}
                  />
                </div>
              </div>
              <div className="dashboard-filter-group min-w-[140px]">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Page size</span>
                <div className="dashboard-filter-select-shell">
                  <CompactFormSelect
                    ariaLabel="Payments page size"
                    value={String(paymentPageSize)}
                    onValueChange={(v) => setPaymentPageSize(Number(v))}
                    options={[
                      { value: "10", label: "10 rows" },
                      { value: "20", label: "20 rows" },
                      { value: "50", label: "50 rows" },
                    ]}
                  />
                </div>
              </div>
            </div>
            {filteredPayments.length === 0 ? (
              <p className="text-sm text-slate-500">No payments match the filters.</p>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="min-w-full text-left text-sm text-slate-200">
                    <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-4 py-3">When</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedPayments.map((p) => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="px-4 py-3">{formatDateTime(p.created_at)}</td>
                          <td className="px-4 py-3 font-medium text-white">{formatBdtAmount(p.amount)}</td>
                          <td className="px-4 py-3">{paymentMethodLabel(p.method)}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusClass(p.status)}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.transaction_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <DashboardTablePagination
                  page={paymentCurrentPage}
                  totalPages={paymentTotalPages}
                  pageSize={paymentPageSize}
                  totalItems={filteredPayments.length}
                  onPageChange={setPaymentPage}
                />
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white">Installment schedule</h3>
        {loading ? (
          <TableLoader rows={4} cols={4} className="mt-4" />
        ) : installmentsFlat.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No installment schedule rows. Plot buys and settled positions may not generate installments.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="dashboard-filters-row">
              <div className="dashboard-filter-group min-w-[160px] max-w-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Row status</span>
                <div className="dashboard-filter-select-shell">
                  <CompactFormSelect
                    ariaLabel="Filter installments by status"
                    value={installmentStatusFilter}
                    onValueChange={setInstallmentStatusFilter}
                    options={[
                      { value: "all", label: "All" },
                      ...installmentStatusOptions.map((s) => ({ value: s, label: s })),
                    ]}
                  />
                </div>
              </div>
              <div className="dashboard-filter-group min-w-[140px]">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Page size</span>
                <div className="dashboard-filter-select-shell">
                  <CompactFormSelect
                    ariaLabel="Installments page size"
                    value={String(installmentPageSize)}
                    onValueChange={(v) => setInstallmentPageSize(Number(v))}
                    options={[
                      { value: "10", label: "10 rows" },
                      { value: "20", label: "20 rows" },
                      { value: "50", label: "50 rows" },
                    ]}
                  />
                </div>
              </div>
            </div>
            {filteredInstallments.length === 0 ? (
              <p className="text-sm text-slate-500">No installments match the filter.</p>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="min-w-full text-left text-sm text-slate-200">
                    <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Property</th>
                        <th className="px-4 py-3">Due</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedInstallments.map((row) => (
                        <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-white">{row.propertyTitle}</td>
                          <td className="px-4 py-3">{row.due}</td>
                          <td className="px-4 py-3">{formatBdtAmount(row.amount)}</td>
                          <td className="px-4 py-3 capitalize text-slate-300">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <DashboardTablePagination
                  page={installmentCurrentPage}
                  totalPages={installmentTotalPages}
                  pageSize={installmentPageSize}
                  totalItems={filteredInstallments.length}
                  onPageChange={setInstallmentPage}
                />
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white">Installment payment submissions</h3>
        <p className="mt-2 text-sm text-slate-400">
          Submit installment payment entries with amount and method. Staff (admin/representative/agent) can review from
          their dashboards.
        </p>
        <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="dashboard-filters-row">
            <div className="dashboard-filter-group min-w-[240px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Investment</span>
              <div className="dashboard-filter-select-shell">
                <CompactFormSelect
                  ariaLabel="Select installment investment"
                  value={requestInvestmentId}
                  onValueChange={setRequestInvestmentId}
                  emptyLabel="Select installment investment"
                  options={installmentInvestments.map((i) => ({
                    value: String(i.id),
                    label: `${i.property_title} (${i.duration_years}y)`,
                  }))}
                />
              </div>
            </div>
            <label className="dashboard-filter-group min-w-[150px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Amount</span>
              <input
                className="dashboard-filter-input"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                placeholder="e.g. 25000"
              />
            </label>
            <div className="dashboard-filter-group min-w-[140px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Method</span>
              <div className="dashboard-filter-select-shell">
                <CompactFormSelect
                  ariaLabel="Payment method"
                  value={requestMethod}
                  onValueChange={setRequestMethod}
                  options={[
                    { value: "bank", label: "Bank transfer" },
                    { value: "card", label: "Card" },
                    { value: "cash", label: "Cash" },
                  ]}
                />
              </div>
            </div>
          </div>
          <label className="dashboard-filter-group">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Note (optional)</span>
            <textarea
              className="dashboard-filter-input min-h-20 resize-y"
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              placeholder="Reference, transfer details, or comments"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={requestBusy || !requestInvestmentId || !requestAmount.trim()}
              onClick={() => void submitInstallmentRequest()}
              className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
            >
              {requestBusy ? "Submitting..." : "Submit payment"}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {paymentRequests.length === 0 ? (
            <p className="text-sm text-slate-500">No payment submissions yet.</p>
          ) : (
            <>
              <div className="dashboard-filters-row">
                <div className="dashboard-filter-group min-w-[140px]">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Page size</span>
                  <div className="dashboard-filter-select-shell">
                    <CompactFormSelect
                      ariaLabel="Requests page size"
                      value={String(requestPageSize)}
                      onValueChange={(v) => setRequestPageSize(Number(v))}
                      options={[
                        { value: "10", label: "10 rows" },
                        { value: "20", label: "20 rows" },
                        { value: "50", label: "50 rows" },
                      ]}
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="min-w-full text-left text-sm text-slate-200">
                  <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Review note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRequests.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3">{r.investment_property_title ?? "—"}</td>
                        <td className="px-4 py-3">{formatBdtAmount(r.amount)}</td>
                        <td className="px-4 py-3 capitalize">{r.method}</td>
                        <td className="px-4 py-3 capitalize">{r.status}</td>
                        <td className="max-w-[340px] truncate px-4 py-3 text-slate-300" title={r.review_note || "—"}>
                          {r.review_note || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <DashboardTablePagination
                page={requestCurrentPage}
                totalPages={requestTotalPages}
                pageSize={requestPageSize}
                totalItems={paymentRequests.length}
                onPageChange={setRequestPage}
              />
            </>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Monthly statements</h3>
        <p className="mt-2 text-sm text-slate-500">
          PDF or CSV exports for tax reporting can be connected to your backend later. For now, use the tables
          above as your account activity log.
        </p>
        <Link to="/dashboard/investor/investments" className="mt-3 inline-block text-sm font-semibold text-emerald-400 hover:underline">
          View all investments
        </Link>
      </section>
    </div>
  )
}
