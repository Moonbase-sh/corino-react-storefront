'use client'

import { type OwnedProduct, useOwnedProducts } from '@moonbase.sh/react'
import Link from 'next/link'
import { ArrowRightIcon } from '../icons'

function licenseCount(product: OwnedProduct) {
  return (product.numberOfLicenses ?? 0) + (product.subscriptionLicenses ?? 0)
}

export function AccountProducts() {
  const products = useOwnedProducts()

  return (
    <div className="account-section">
      {!products.data
        ? products.error
          ? <p className="error">{products.error.message}</p>
          : <p className="empty">Loading products…</p>
        : products.data.length === 0
          ? <p className="empty">You don&apos;t own any products yet.</p>
          : (
              <ul className="product-list">
                {products.data.map((product) => {
                  const licenses = licenseCount(product)
                  return (
                    <li key={product.id} className="product-row">
                      <div className="product-icon">
                        {product.iconUrl && <img src={product.iconUrl} alt={product.name} />}
                      </div>
                      <div className="product-meta">
                        <span className="name">{product.name}</span>
                        {licenses > 0 && <span className="licenses">{`${licenses} license${licenses === 1 ? '' : 's'}`}</span>}
                      </div>
                      <Link className="manage" href={`/account/products/${encodeURIComponent(product.id)}`}>
                        View
                        <ArrowRightIcon />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}

      {products.hasMore && (
        <button type="button" className="show-more" disabled={products.loading} onClick={products.loadMore}>
          {products.loading ? 'Loading…' : 'Show more'}
        </button>
      )}
    </div>
  )
}
