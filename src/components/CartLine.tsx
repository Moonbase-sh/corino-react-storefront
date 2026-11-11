'use client'

import { type CartItem, formatMoney, useCartActions, useCurrency } from '@moonbase.sh/react'
import { productIds } from '@/lib/config'
import { CloseIcon } from './icons'

const fallbackIcons: Record<string, string> = {
  [productIds.halo]: '/assets/halo.svg',
  [productIds.drift]: '/assets/drift.svg',
  [productIds.bundle]: '/assets/bundle.svg',
}

export function CartLine({ item }: { item: CartItem }) {
  const { removeFromCart } = useCartActions()
  const currency = useCurrency()

  // `useCart` hands out its lines with their product or bundle from the catalog already attached
  const id = item.type === 'Product' ? item.productId : item.bundleId
  const catalogItem = item.type === 'Product' ? item.product : item.bundle
  const name = catalogItem?.name || id
  const icon = catalogItem?.iconUrl || fallbackIcons[id] || null

  const amount = item.price?.[currency]
  const linePrice = typeof amount === 'number' ? formatMoney(amount * item.quantity, currency) : null

  return (
    <div className="cart-line">
      <div className="cart-line-product">
        <div className="cart-line-icon">
          {icon && <img src={icon} alt={name} />}
        </div>
        <div className="cart-line-meta">
          <span className="name">{name}</span>
          {item.quantity > 1 && <span className="qty">{`× ${item.quantity}`}</span>}
        </div>
      </div>
      <span className="price">{linePrice}</span>
      <button className="remove" type="button" aria-label="Remove" onClick={() => removeFromCart(item)}>
        <CloseIcon size={14} />
      </button>
    </div>
  )
}
