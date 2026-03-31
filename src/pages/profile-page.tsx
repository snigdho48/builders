import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Navigate } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { getMe, updateProfile } from "@/services/api"
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
      const formData = new FormData()
      formData.append("first_name", firstName)
      formData.append("last_name", lastName)
      formData.append("email", email)
      formData.append("phone", phone)
      if (photo) {
        formData.append("profile_photo", photo)
      }
      const updated = await updateProfile(formData, token)
      setProfile(updated)
      setMessage("Profile updated successfully.")
      showToast("Profile updated successfully.", "success")
    } catch (error) {
      const err = error instanceof Error ? error.message : "Profile update failed."
      setMessage(err)
      showToast(err, "error")
    }
  }

  return (
    <main className="bg-[#f4f6fb] px-4 py-14 text-slate-900 sm:px-6">
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="mt-1 text-sm text-slate-500">Role: {profile?.role ?? "investor"}</p>
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
