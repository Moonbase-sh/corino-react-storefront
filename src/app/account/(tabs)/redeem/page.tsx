import type { Metadata } from 'next'
import { AccountRedeem } from '@/components/account/Redeem'

export const metadata: Metadata = { title: 'Redeem' }

export default function RedeemPage() {
  return <AccountRedeem />
}
