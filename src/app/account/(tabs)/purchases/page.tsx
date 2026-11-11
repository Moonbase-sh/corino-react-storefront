import type { Metadata } from 'next'
import { AccountPurchases } from '@/components/account/Purchases'

export const metadata: Metadata = { title: 'Purchases' }

export default function PurchasesPage() {
  return <AccountPurchases />
}
