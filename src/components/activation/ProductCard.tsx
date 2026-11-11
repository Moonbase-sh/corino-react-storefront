import type { ReactNode } from 'react'

interface ActivationProduct {
  name: string
  iconUrl?: string | null
  tagline?: string | null
}

/** The product header both activation flows show. */
export function ActivationProductCard({ product, description, children }: { product: ActivationProduct, description?: ReactNode, children?: ReactNode }) {
  return (
    <div className="activation-product-card">
      <div className="activation-product-card-icon">
        {product.iconUrl && <img src={product.iconUrl} alt={product.name} />}
      </div>
      <div className="activation-product-card-content">
        <h2>{product.name}</h2>
        {product.tagline && <p className="tagline">{product.tagline}</p>}
        {description}
      </div>
      {children}
    </div>
  )
}
