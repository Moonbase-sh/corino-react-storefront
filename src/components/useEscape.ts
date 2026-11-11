import { useEffect } from 'react'

/** Calls `onEscape` when the Escape key is pressed, while `active`. */
export function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active)
      return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape')
        onEscape()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, onEscape])
}
