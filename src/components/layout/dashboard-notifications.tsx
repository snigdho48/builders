import { useCallback, useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBell } from "@fortawesome/free-solid-svg-icons"

import {
  fetchNotificationUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/api"
import type { UserNotification } from "@/types/domain"

function formatWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
}

export function DashboardNotifications() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const refreshCount = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setUnread(0)
      return
    }
    try {
      const n = await fetchNotificationUnreadCount(token)
      setUnread(n)
    } catch {
      setUnread(0)
    }
  }, [])

  const loadList = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      const list = await listNotifications(token, { pageSize: 30 })
      setItems(list)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshCount()
    const id = window.setInterval(() => void refreshCount(), 60_000)
    const onFocus = () => void refreshCount()
    window.addEventListener("focus", onFocus)
    return () => {
      window.clearInterval(id)
      window.removeEventListener("focus", onFocus)
    }
  }, [refreshCount])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", onDoc)
      void loadList()
    }
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open, loadList])

  async function onOpenOne(n: UserNotification) {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    if (!n.read_at) {
      try {
        await markNotificationRead(n.id, token)
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)))
        void refreshCount()
      } catch {
        /* ignore */
      }
    }
  }

  async function onMarkAll() {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    try {
      await markAllNotificationsRead(token)
      setItems((prev) => prev.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })))
      setUnread(0)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 text-white hover:border-[#f58e43]/50 hover:bg-[#f58e43]/10 sm:h-10 sm:w-10"
      >
        <FontAwesomeIcon icon={faBell} className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.6rem] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(100vw-1.5rem,22rem)] rounded-xl border border-white/15 bg-[#0b1629] shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
            <span className="text-xs font-semibold text-white">Notifications</span>
            <button
              type="button"
              onClick={() => void onMarkAll()}
              className="text-[10px] font-medium text-emerald-400 hover:underline"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-[min(60vh,320px)] overflow-y-auto">
            {loading ? (
              <p className="px-3 py-4 text-center text-xs text-slate-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-slate-500">No notifications yet.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => void onOpenOne(n)}
                      className={`w-full px-3 py-2.5 text-left transition-colors hover:bg-white/5 ${
                        n.read_at ? "opacity-75" : "bg-white/[0.04]"
                      }`}
                    >
                      <p className="text-xs font-semibold text-white">{n.title}</p>
                      {n.body ? <p className="mt-0.5 text-[11px] text-slate-400">{n.body}</p> : null}
                      <p className="mt-1 text-[10px] text-slate-500">{formatWhen(n.created_at)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
