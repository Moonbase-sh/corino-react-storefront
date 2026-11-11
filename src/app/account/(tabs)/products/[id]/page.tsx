import type { Metadata } from 'next'
import { AccountProductDetail } from '@/components/account/ProductDetail'

export const metadata: Metadata = { title: 'Product' }

// No product pages at build time: each one renders the first time it's visited, and is cached
// after. There's nothing customer-specific in it until the browser loads what they own.
export function generateStaticParams() {
  return []
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AccountProductDetail key={id} productId={id} />
}
