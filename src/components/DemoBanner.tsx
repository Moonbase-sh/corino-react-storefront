export function DemoBanner() {
  return (
    <div className="demo-banner" role="note">
      <span className="demo-dot" aria-hidden="true" />
      <span>
        <strong>Demo site</strong>
        {' '}
        · Corino is fictional. This page is a live integration of the
        {' '}
        <a href="https://moonbase.sh/docs/storefronts/sdks/react/" target="_blank" rel="noopener">Moonbase React SDK</a>
        .
      </span>
    </div>
  )
}
