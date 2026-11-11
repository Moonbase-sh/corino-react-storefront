'use client'

import { useAuth, type User } from '@moonbase.sh/react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { errorMessage } from '@/lib/format'

function profileOf(user: User | null) {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    newsletterOptIn: user?.communicationPreferences?.newsletterOptIn ?? false,
    productUpdatesOptIn: user?.communicationPreferences?.productUpdatesOptIn ?? false,
  }
}

export function AccountInfo() {
  const { user, update, setPassword, signOut } = useAuth()
  const router = useRouter()

  // The form starts from the signed-in customer, and starts over whenever Moonbase hands back a
  // changed one (after saving, or a background refresh).
  const [profile, setProfile] = useState(() => profileOf(user))
  const [profileUser, setProfileUser] = useState(user)
  if (user && user !== profileUser) {
    setProfileUser(user)
    setProfile(profileOf(user))
  }

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [emailNeedsConfirmation, setEmailNeedsConfirmation] = useState(false)

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    setEmailNeedsConfirmation(false)
    try {
      const result = await update(profile.name, profile.email, undefined, {
        newsletterOptIn: profile.newsletterOptIn,
        productUpdatesOptIn: profile.productUpdatesOptIn,
      })
      setSaveSuccess(true)
      if (result.needsEmailConfirmationToken)
        setEmailNeedsConfirmation(true)
    }
    catch (err) {
      setSaveError(errorMessage(err))
    }
    finally {
      setSaving(false)
    }
  }

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  async function changePassword(event: FormEvent) {
    event.preventDefault()
    setPasswordSaving(true)
    setPasswordError(null)
    setPasswordSuccess(false)
    try {
      await setPassword(oldPassword, newPassword)
      setOldPassword('')
      setNewPassword('')
      setPasswordSuccess(true)
    }
    catch (err) {
      setPasswordError(errorMessage(err))
    }
    finally {
      setPasswordSaving(false)
    }
  }

  async function logOut() {
    await signOut()
    router.push('/')
  }

  return (
    <div className="account-section">
      <form className="account-form" onSubmit={save}>
        <h3>Profile</h3>

        <label htmlFor="account-name">Full name</label>
        <input
          id="account-name"
          value={profile.name}
          onChange={e => setProfile({ ...profile, name: e.target.value })}
          type="text"
          autoComplete="name"
          required
        />

        <label htmlFor="account-email">Email</label>
        <input
          id="account-email"
          value={profile.email}
          onChange={e => setProfile({ ...profile, email: e.target.value })}
          type="email"
          autoComplete="email"
          required
        />

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={profile.newsletterOptIn}
            onChange={e => setProfile({ ...profile, newsletterOptIn: e.target.checked })}
          />
          <span>Receive updates and offers by email</span>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={profile.productUpdatesOptIn}
            onChange={e => setProfile({ ...profile, productUpdatesOptIn: e.target.checked })}
          />
          <span>Receive product updates by email</span>
        </label>

        <button type="submit" className="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>

        {saveError
          ? <p className="error">{saveError}</p>
          : emailNeedsConfirmation
            ? <p className="notice">Please check your inbox to confirm your new email address.</p>
            : saveSuccess && <p className="success">Saved.</p>}
      </form>

      <form className="account-form" onSubmit={changePassword}>
        <h3>Change password</h3>

        <label htmlFor="account-old-password">Current password</label>
        <input
          id="account-old-password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          required
        />

        <label htmlFor="account-new-password">New password</label>
        <input
          id="account-new-password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          required
        />

        <button type="submit" className="submit" disabled={passwordSaving}>
          {passwordSaving ? 'Saving…' : 'Change password'}
        </button>

        {passwordError
          ? <p className="error">{passwordError}</p>
          : passwordSuccess && <p className="success">Password changed.</p>}
      </form>

      <button type="button" className="logout" onClick={logOut}>Log out</button>
    </div>
  )
}
