import { useId, useLayoutEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  src: string
  shotName: string
  projectName: string
  onClose: () => void
}

export function VideoPlayer({ src, shotName, projectName, onClose }: VideoPlayerProps) {
  const titleId = useId()
  const projectId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    const video = videoRef.current
    dialog?.showModal()
    return () => {
      video?.pause()
      dialog?.close()
    }
  }, [])

  function closePlayer() {
    videoRef.current?.pause()
    dialogRef.current?.close()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={projectId}
      onCancel={(event) => {
        event.preventDefault()
        closePlayer()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closePlayer()
      }}
      className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-5xl overflow-y-auto rounded-panel border border-border-subtle bg-surface text-text-primary shadow-card backdrop:bg-background/85"
    >
      <div className="grid gap-(--space-4) p-(--space-4) sm:p-(--space-5)">
        <header className="flex items-start justify-between gap-(--space-4)">
          <div className="min-w-0 wrap-anywhere">
            <h2 id={titleId} className="text-section-heading font-semibold">{shotName}</h2>
            <p id={projectId} className="text-text-secondary">{projectName}</p>
          </div>
          <button
            type="button"
            aria-label="Close video player"
            onClick={closePlayer}
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-control text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5">
              <path d="m5 5 10 10m0-10L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        {failed ? (
          <div role="status" className="grid aspect-video max-h-[70dvh] place-items-center rounded-control bg-background p-(--space-4) text-center text-text-secondary">
            The video could not be loaded. Its link may have expired.
          </div>
        ) : (
          <video
            ref={videoRef}
            src={src}
            controls
            playsInline
            preload="metadata"
            aria-label={`${shotName} video`}
            onError={() => setFailed(true)}
            className="block aspect-video max-h-[70dvh] w-full rounded-control bg-background object-contain"
          />
        )}
      </div>
    </dialog>
  )
}
