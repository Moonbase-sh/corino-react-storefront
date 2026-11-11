import type { Metadata } from 'next'
import { AccountInfo } from '@/components/account/Info'

export const metadata: Metadata = { title: 'Account' }

export default function AccountPage() {
  return <AccountInfo />
}
