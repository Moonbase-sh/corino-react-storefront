import { useCallback, useSyncExternalStore } from 'react'

const SUBSCRIBED_KEY = 'corino:newsletter:subscribed'
const EMAIL_KEY = 'corino:newsletter:email'

interface NewsletterState {
  subscribed: boolean
  email: string | null
}

const notSubscribed: NewsletterState = { subscribed: false, email: null }
let state: NewsletterState | undefined
const listeners = new Set<() => void>()

function getState(): NewsletterState {
  state ??= localStorage.getItem(SUBSCRIBED_KEY) === 'true'
    ? { subscribed: true, email: localStorage.getItem(EMAIL_KEY) }
    : notSubscribed
  return state
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Whether this browser signed up for the newsletter, remembered so the footer form doesn't ask again. */
export function useNewsletter() {
  const current = useSyncExternalStore(subscribe, getState, () => notSubscribed)

  const markSubscribed = useCallback((email: string) => {
    localStorage.setItem(SUBSCRIBED_KEY, 'true')
    localStorage.setItem(EMAIL_KEY, email)
    state = { subscribed: true, email }
    listeners.forEach(listener => listener())
  }, [])

  return { state: current, markSubscribed }
}
