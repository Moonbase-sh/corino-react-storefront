import type { Metadata } from 'next'
import { AccountProducts } from '@/components/account/Products'

export const metadata: Metadata = { title: 'Products' }

export default function ProductsPage() {
  return <AccountProducts />
}
