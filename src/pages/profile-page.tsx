import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Navigate } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { normalizeStoredRole } from "@/routes/protected-route"
import { getMe, postKycRequest, updateProfile } from "@/services/api"
import type { MeResponse } from "@/types/domain"

const API_HOST = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api").replace(
  /\/api$/,
  ""
)

export function ProfilePage() {
  const { showToast } = useToast()
  const token = localStorage.getItem("accessToken")
  const [profile, setProfile] = useState<MeResponse | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [kycRequestMessage, setKycRequestMessage] = useState("")
  const [kycRequestBusy, setKycRequestBusy] = useState(false)

  useEffect(() => {
    if (!token) {
      return
    }
    getMe(token).then((data) => {
      setProfile(data)
      setFirstName(data.first_name || "")
      setLastName(data.last_name || "")
      setEmail(data.email || "")
      setPhone(data.phone || "")
      setKycRequestMessage(data.kyc_investor_notes ?? "")
    })
  }, [token])

  const photoUrl = useMemo(() => {
    if (!profile?.profile_photo) {
      return ""
    }
    return profile.profile_photo.startsWith("http")
      ? profile.profile_photo
      : `${API_HOST}${profile.profile_photo}`
  }, [profile])

  if (!token) {
    return <Navigate to="/auth" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) {
      setMessage("Please login first.")
      showToast("Please login first.", "error")
      return
    }
    setMessage("Updating profile...")
    try {
      if (newPassword || confirmPassword || currentPassword) {
        if (!currentPassword) {
          setMessage("Enter your current password to change it.")
          showToast("Enter your current password to change it.", "error")
          return
        }
        if (newPassword.length < 8) {
          setMessage("New password must be at least 8 characters.")
          showToast("New password must be at least 8 characters.", "error")
          return
        }
        if (newPassword !== confirmPassword) {
          setMessage("New password and confirmation do not match.")
          showToast("New password and confirmation do not match.", "error")
          return
        }
      }
      const formData = new FormData()
      formData.append("first_name", firstName)
      formData.append("last_name", lastName)
      formData.append("email", email)
      formData.append("phone", phone)
      if (photo) {
        formData.append("profile_photo", photo)
      }
      if (newPassword) {
        formData.append("current_password", currentPassword)
        formData.append("new_password", newPassword)
      }
      const updated = await updateProfile(formData, token)
      setProfile(updated)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setMessage("Profile updated successfully.")
      showToast("Profile updated successfully.", "success")
    } catch (error) {
      const err = error instanceof Error ? error.message : "Profile update failed."
      setMessage(err)
      showToast(err, "error")
    }
  }

  async function submitKycRequest() {
    if (!token) {
      showToast("Please login first.", "error")
      return
    }
    setKycRequestBusy(true)
    try {
      const updated = await postKycRequest(token, { message: kycRequestMessage.trim() })
      setProfile(updated)
      setKycRequestMessage(updated.kyc_investor_notes || "")
      showToast("KYC request sent. Our team will review your account.", "success")
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Request failed", "error")
    } finally {
      setKycRequestBusy(false)
    }
  }

  return (
    <main className="bg-[#f4f6fb] py-14 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(3.5rem,env(safe-area-inset-bottom,0px))] text-slate-900 sm:px-6">
      <section className="mx-auto grid min-w-0 max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="mt-1 text-sm text-slate-500">Role: {profile?.role ?? "investor"}</p>
          <p className="mt-1 text-sm text-slate-500">
            Username: <span className="font-medium text-slate-800">{profile?.username ?? "—"}</span>
          </p>
          <div className="mt-5 h-44 w-44 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No photo
              </div>
            )}
          </div>
          <p className="mt-4 text-sm text-slate-600">Referral code: {profile?.referral_code ?? "-"}</p>
          <p className="mt-1 text-sm text-slate-600">
            Your referral commission: {profile?.referral_commission_percent ?? "-"}%
          </p>
          {profile && normalizeStoredRole(profile.role) === "investor" ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Identity verification (KYC)</p>
              <p className="mt-2 text-sm text-slate-700">
                Status:{" "}
                <span className="font-semibold capitalize text-[#0b1f44]">
                  {profile.kyc_status === "approved"
                    ? "Verified"
                    : profile.kyc_status === "rejected"
                      ? "Rejected — you may request review again below"
                      : "Pending review"}
                </span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Request a review anytime (optional note for our team). Verification is completed by staff; document
                uploads are not handled in this form — use the note to reference how you will share ID (e.g. email,
                in-person).
              </p>
              {profile.kyc_requested_at ? (
                <p className="mt-2 text-xs text-slate-600">
                  Last request: {profile.kyc_requested_at.slice(0, 19).replace("T", " ")}
                </p>
              ) : null}
              {profile.kyc_status === "approved" && profile.kyc_verified_at ? (
                <p className="mt-2 text-xs text-slate-500">Verified on {profile.kyc_verified_at.slice(0, 10)}</p>
              ) : null}
              {profile.kyc_status !== "approved" ? (
                <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                  <label className="text-xs font-medium text-slate-600" htmlFor="kyc-req-msg">
                    Message for our team (optional)
                  </label>
                  <textarea
                    id="kyc-req-msg"
                    className="profile-input min-h-[88px] w-full resize-y text-sm"
                    value={kycRequestMessage}
                    onChange={(e) => setKycRequestMessage(e.target.value)}
                    placeholder="e.g. Ready to verify by video call, or ID sent to your support inbox…"
                    maxLength={2000}
                  />
                  <button
                    type="button"
                    disabled={kycRequestBusy}
                    onClick={() => void submitKycRequest()}
                    className="w-full rounded-xl bg-[#0b1f44] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {kycRequestBusy ? "Sending…" : "Request KYC verification"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          {profile?.referral_link ? (
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-500">Share link</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <input
                  readOnly
                  className="profile-input min-w-0 flex-1 text-xs"
                  value={profile.referral_link}
                />
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0b1f44] hover:bg-slate-50"
                  onClick={() => {
                    void navigator.clipboard.writeText(profile.referral_link)
                    showToast("Link copied", "success")
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          ) : null}
        </aside>
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold">Profile Settings</h1>
          <form className="mt-6 grid gap-3" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-[#0b1f44]">Security</p>
              <p className="mt-1 text-xs text-slate-500">Leave blank to keep your current password.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <input
                  className="profile-input"
                  type="password"
                  placeholder="Current password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
                <input
                  className="profile-input"
                  type="password"
                  placeholder="New password (min 8)"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
                <input
                  className="profile-input"
                  type="password"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="profile-input"
                placeholder="First name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
              <input
                className="profile-input"
                placeholder="Last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
            <input
              className="profile-input"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              className="profile-input"
              placeholder="Phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <input
              className="profile-input"
              type="file"
              accept="image/*"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            />
            <button className="mt-2 rounded-xl bg-[#f58e43] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#ff9b4f]">
              Save Profile
            </button>
            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          </form>
        </article>
      </section>
    </main>
  )
}
