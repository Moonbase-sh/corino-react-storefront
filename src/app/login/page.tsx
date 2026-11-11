import type { Metadata } from 'next'
import { AuthPage } from '@/components/AuthPage'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Sign in' }

/** The tenant's `LogIn` URL. */
export default function LoginPage() {
  return (
    <AuthPage eyebrow="LOG IN" title="Sign in" hint="Sign in to manage your account, downloads, and licenses.">
      <LoginForm />
    </AuthPage>
  )
}
