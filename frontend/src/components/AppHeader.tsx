export function AppHeader() {
  return (
    <header className="flex items-center justify-between gap-(--space-3)">
      <div className="flex min-w-0 items-center gap-(--space-3) sm:gap-(--space-4)">
        <img
          src={import.meta.env.BASE_URL + 'favicon.svg'}
          alt=""
          width={48}
          height={48}
          className="size-10 shrink-0 sm:size-12"
        />
        <div>
          <h1 className="text-app-title font-bold">StudioFlow</h1>
          <p className="mt-(--space-1) text-metadata font-medium tracking-[0.14em] text-text-muted sm:text-supporting">
            AI PRODUCTION STUDIO
          </p>
        </div>
      </div>
      <span className="shrink-0 rounded-full border border-border bg-surface px-(--space-3) py-(--space-1) text-supporting font-semibold text-text-secondary">
        MVP
      </span>
    </header>
  )
}
