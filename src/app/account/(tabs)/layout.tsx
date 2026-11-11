import type { ReactNode } from 'react'
import { AccountShell } from '@/components/account/AccountShell'

/** The header, tabs and sign-in gate around every account tab. */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountShell>{children}</AccountShell>
}
