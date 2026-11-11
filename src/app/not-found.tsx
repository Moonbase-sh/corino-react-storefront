import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthPage } from '@/components/AuthPage'

export const metadata: Metadata = { title: 'Not found' }

export default function NotFound() {
  return (
    <AuthPage eyebrow="404" title="Nothing here." hint="The page you were looking for doesn't exist, or has moved.">
      <div className="auth-result">
        <Link href="/" className="submit">Back to home</Link>
      </div>
    </AuthPage>
  )
}
