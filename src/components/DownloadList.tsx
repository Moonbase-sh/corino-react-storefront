'use client'

import { describeDownload, type Download, Platform, sortDownloads, useInventory, visitorPlatform } from '@moonbase.sh/react'
import { useState } from 'react'
import { DownloadIcon } from './icons'

/**
 * A product's installers, the one for the visitor's platform first and highlighted. Used by the
 * download modal and the account's product page. Only rendered in the browser, once a product has
 * loaded, so reading the platform while rendering is safe.
 */
export function DownloadList({ downloads, empty }: { downloads: Download[] | null | undefined, empty: string }) {
  const { downloadProduct } = useInventory()
  const [platform] = useState(visitorPlatform)
  const [downloading, setDownloading] = useState<ReadonlySet<string>>(() => new Set())

  const sorted = sortDownloads(downloads, platform)

  async function startDownload(download: Download) {
    setDownloading(keys => new Set(keys).add(download.key))
    try {
      await downloadProduct(download)
    }
    catch (err) {
      console.error('Download failed', err)
    }
    finally {
      setDownloading((keys) => {
        const next = new Set(keys)
        next.delete(download.key)
        return next
      })
    }
  }

  if (sorted.length === 0)
    return <p className="empty">{empty}</p>

  return (
    <ul className="download-list">
      {sorted.map((download) => {
        const isCurrent = download.platform === platform
        const busy = downloading.has(download.key)
        return (
          <li
            key={download.key}
            className={isCurrent && download.platform !== Platform.Universal ? 'download-row recommended' : 'download-row'}
          >
            <div>
              <span className="name">{download.name}</span>
              <span className="caption">{describeDownload(download)}</span>
            </div>
            <button
              type="button"
              className={isCurrent ? 'download-btn primary' : 'download-btn'}
              disabled={busy}
              onClick={() => startDownload(download)}
            >
              <DownloadIcon />
              {busy
                ? 'Starting…'
                : download.platform === Platform.Universal ? 'Download' : `Download for ${download.platform}`}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
