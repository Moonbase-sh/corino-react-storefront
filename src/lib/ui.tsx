'use client'

import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'

export type DownloadModalMode = 'trial' | 'owned'

interface UiState {
  cartOpen: boolean
  loginOpen: boolean
  downloadModal: { productId: string, mode: DownloadModalMode } | null
  /** The cookie banner, opened again from "Cookie settings" in the footer. */
  cookieSettingsOpen: boolean
}

interface Ui {
  state: UiState
  showCart: () => void
  hideCart: () => void
  showLogin: () => void
  hideLogin: () => void
  showTrial: (productId: string) => void
  showDownloads: (productId: string) => void
  hideDownloadModal: () => void
  showCookieSettings: () => void
  hideCookieSettings: () => void
}

const UiContext = createContext<Ui | null>(null)

/** What's open across the whole site: the cart drawer, the login and download modals, the cookie banner. */
export function UiProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UiState>({ cartOpen: false, loginOpen: false, downloadModal: null, cookieSettingsOpen: false })

  // The functions never change, so they're safe in effect dependencies
  const actions = useMemo(() => ({
    showCart: () => setState(s => ({ ...s, cartOpen: true })),
    hideCart: () => setState(s => ({ ...s, cartOpen: false })),
    showLogin: () => setState(s => ({ ...s, loginOpen: true })),
    hideLogin: () => setState(s => ({ ...s, loginOpen: false })),
    showTrial: (productId: string) => setState(s => ({ ...s, downloadModal: { productId, mode: 'trial' as const } })),
    showDownloads: (productId: string) => setState(s => ({ ...s, downloadModal: { productId, mode: 'owned' as const } })),
    hideDownloadModal: () => setState(s => ({ ...s, downloadModal: null })),
    showCookieSettings: () => setState(s => ({ ...s, cookieSettingsOpen: true })),
    hideCookieSettings: () => setState(s => ({ ...s, cookieSettingsOpen: false })),
  }), [])

  const ui = useMemo<Ui>(() => ({ state, ...actions }), [state, actions])

  return <UiContext value={ui}>{children}</UiContext>
}

export function useUi(): Ui {
  const ui = useContext(UiContext)
  if (!ui)
    throw new Error('useUi() needs a <UiProvider> above it')
  return ui
}
