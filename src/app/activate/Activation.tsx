'use client'

import { useSearchParams } from 'next/navigation'
import { AutoActivation } from '@/components/activation/AutoActivation'
import { ManualActivation } from '@/components/activation/ManualActivation'

export function Activation() {
  const token = useSearchParams().get('token')

  return (
    <main className="activation-page">
      <div className="activation-head">
        <div className="section-num">[ ACTIVATION ]</div>
        <h1>{token ? 'Activate product' : 'Activate offline device'}</h1>
        <p className="hint">
          {token
            ? 'Finish setting up the device that opened this page.'
            : 'Activate a device that isn\'t connected to the internet.'}
        </p>
      </div>

      <div className="activation-panel">
        {token ? <AutoActivation token={token} /> : <ManualActivation />}
      </div>
    </main>
  )
}
