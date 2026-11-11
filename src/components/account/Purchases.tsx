'use client'

import { type CompletedOrder, formatMoney, useOrderHistory, useOrders } from '@moonbase.sh/react'
import { useState } from 'react'

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

function itemsOf(order: CompletedOrder) {
  return order.items
    .map((item) => {
      const name = (item.type === 'Product' ? item.product?.name : item.bundle?.name) ?? 'Item'
      return item.quantity > 1 ? `${name} × ${item.quantity}` : name
    })
    .join(', ')
}

/** The customer's completed orders, newest first, a page at a time, each with a PDF receipt. */
export function AccountPurchases() {
  const orders = useOrderHistory()
  const { downloadReceipt } = useOrders()

  const [downloading, setDownloading] = useState<ReadonlySet<string>>(() => new Set())
  const [receiptErrors, setReceiptErrors] = useState<Record<string, string>>({})

  async function receipt(order: CompletedOrder) {
    setDownloading(ids => new Set(ids).add(order.id))
    setReceiptErrors(errors => Object.fromEntries(Object.entries(errors).filter(([id]) => id !== order.id)))
    try {
      await downloadReceipt(order)
    }
    catch (err) {
      console.error('Receipt download failed', err)
      setReceiptErrors(errors => ({ ...errors, [order.id]: 'Could not download the receipt. Try again.' }))
    }
    finally {
      setDownloading((ids) => {
        const rest = new Set(ids)
        rest.delete(order.id)
        return rest
      })
    }
  }

  return (
    <div className="account-section purchases">
      {!orders.data && !orders.error && <p className="empty">Loading purchases…</p>}
      {orders.data?.length === 0 && <p className="empty">No purchases yet.</p>}
      {orders.data && orders.data.length > 0 && (
        <ul className="purchase-list">
          {orders.data.map(order => (
            <li key={order.id} className="purchase-row">
              <div className="purchase-meta">
                <span className="name">{itemsOf(order)}</span>
                <span className="caption">
                  {order.completedAt && (
                    <time dateTime={order.completedAt.toISOString()}>{dateFormat.format(order.completedAt)}</time>
                  )}
                  {order.isFullyRefunded
                    ? <span className="badge">Refunded</span>
                    : order.isPartiallyRefunded && <span className="badge">Partly refunded</span>}
                </span>
                {receiptErrors[order.id] && <span className="error">{receiptErrors[order.id]}</span>}
              </div>
              <span className="purchase-total">{formatMoney(order.total.due)}</span>
              <button
                type="button"
                className="download-btn"
                disabled={downloading.has(order.id)}
                onClick={() => receipt(order)}
              >
                {downloading.has(order.id) ? 'Preparing…' : 'Receipt'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {orders.error && <p className="error">Could not load your purchases. Try again in a moment.</p>}
      {orders.hasMore
        ? (
            <button type="button" className="show-more" disabled={orders.loading} onClick={orders.loadMore}>
              {orders.loading ? 'Loading…' : 'Show more'}
            </button>
          )
        : !orders.data && orders.error && (
            <button type="button" className="show-more" disabled={orders.loading} onClick={orders.reload}>
              {orders.loading ? 'Loading…' : 'Try again'}
            </button>
          )}
    </div>
  )
}
