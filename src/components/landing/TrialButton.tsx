'use client'

import type { ReactNode } from 'react'
import { useUi } from '@/lib/ui'
import { DownloadIcon } from '../icons'

/** Opens the free-trial download list for a product. */
export function TrialButton({ productId, children }: { productId: string, children: ReactNode }) {
  const { showTrial } = useUi()

  return (
    <button type="button" className="trial-btn" onClick={() => showTrial(productId)}>
      <DownloadIcon />
      {children}
    </button>
  )
}
