'use client'

import { type Download, useOwnedProduct, useProduct } from '@moonbase.sh/react'
import { useUi } from '@/lib/ui'
import { DownloadList } from './DownloadList'
import { CloseIcon } from './icons'
import { useEscape } from './useEscape'

interface Shown {
  name: string
  iconUrl: string | null | undefined
  version: string | null | undefined
  downloads: Download[] | null | undefined
}

/**
 * The installers for a product: a free trial from the landing page, or one the customer owns.
 *
 * A trial is for anyone, signed in or not, so its files come from the catalog, which lists the
 * public ones. An owned product's come from the customer's account with `useOwnedProduct`, which
 * only loads for someone signed in.
 */
export function ProductDownloadModal() {
  const { state, hideDownloadModal } = useUi()
  const request = state.downloadModal
  const isTrial = request?.mode !== 'owned'

  const catalogProduct = useProduct(request && isTrial ? request.productId : null)
  const owned = useOwnedProduct(request && !isTrial ? request.productId : null)

  useEscape(!!request, hideDownloadModal)

  if (!request)
    return null

  const shown: Shown | null = isTrial
    ? catalogProduct && { name: catalogProduct.name, iconUrl: catalogProduct.iconUrl, version: catalogProduct.currentVersion, downloads: catalogProduct.downloads }
    : owned.data && { name: owned.data.name, iconUrl: owned.data.iconUrl, version: owned.data.version, downloads: owned.data.downloads }
  const error = isTrial ? null : owned.error

  return (
    <div className="modal-mask" onClick={hideDownloadModal}>
      <div className="modal trial-modal" role="dialog" aria-labelledby="download-modal-title" onClick={e => e.stopPropagation()}>
        <header className="trial-modal-head">
          <h2 id="download-modal-title">{isTrial ? 'Free trial · 14 days' : 'Downloads'}</h2>
          <button className="close-btn" type="button" aria-label="Close" onClick={hideDownloadModal}>
            <CloseIcon />
          </button>
        </header>

        {error
          ? <p className="error">{error.message}</p>
          : !shown
              ? <p className="empty">Loading downloads…</p>
              : (
                  <>
                    <div className="trial-product">
                      <div className="trial-product-icon">
                        {shown.iconUrl && <img src={shown.iconUrl} alt={shown.name} />}
                      </div>
                      <div>
                        <h3>{shown.name}</h3>
                        {shown.version && <p className="hint">{`Version ${shown.version}`}</p>}
                      </div>
                    </div>

                    <p className="trial-hint">
                      {isTrial
                        ? 'Download the installer for your platform. The plugin runs as a 14-day trial with no card needed and all features unlocked. Sign in inside the plugin to extend with a license.'
                        : 'Pick the installer for your platform. Sign in inside the plugin if it asks: your license is already on your account.'}
                    </p>

                    <DownloadList downloads={shown.downloads} empty="No downloadable files available for this product yet." />
                  </>
                )}
      </div>
    </div>
  )
}
