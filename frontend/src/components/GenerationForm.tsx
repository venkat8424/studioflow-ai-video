import { useId, useState } from 'react'
import type { ChangeEvent, SubmitEvent } from 'react'

const textFields = {
  projectName: {
    label: 'Project',
    placeholder: 'Project Aurora',
    maxLength: 100,
    requiredMessage: 'Please enter a project name.',
  },
  shotName: {
    label: 'Shot name',
    placeholder: 'Opening aerial',
    maxLength: 100,
    requiredMessage: 'Please enter a shot name.',
  },
  prompt: {
    label: 'Creative prompt',
    placeholder: 'A cinematic aerial camera moves slowly over a futuristic city at sunrise, with golden light reflecting off skyscrapers.',
    maxLength: 1000,
    requiredMessage: 'Please enter a creative prompt.',
  },
}

const nameFields = ['projectName', 'shotName'] as const
const textFieldNames = [...nameFields, 'prompt'] as const
const requiredFields = [...textFieldNames, 'referenceImageUrl'] as const
type RequiredField = (typeof requiredFields)[number]
type FieldValues = Record<RequiredField, string>
type FieldErrors = Partial<FieldValues>

const ratioOptions = [
  { value: '1280:720', label: '16:9 Landscape' },
  { value: '720:1280', label: '9:16 Portrait' },
] as const
const durationOptions = [
  { value: 5, label: '5 seconds' },
  { value: 10, label: '10 seconds' },
] as const
type Ratio = (typeof ratioOptions)[number]['value']
type Duration = (typeof durationOptions)[number]['value']

const controlClass = 'w-full min-w-0 rounded-control border border-border bg-input px-(--space-3) text-text-primary placeholder:text-text-muted aria-[invalid=true]:border-error'
const labelClass = 'mb-(--space-2) block text-label font-medium text-text-secondary'

function validate(values: FieldValues): FieldErrors {
  const errors: FieldErrors = {}

  for (const name of textFieldNames) {
    const { label, maxLength, requiredMessage } = textFields[name]
    if (!values[name].trim()) {
      errors[name] = requiredMessage
    } else if (values[name].length > maxLength) {
      errors[name] = `${label} must be ${maxLength} characters or fewer.`
    }
  }

  const imageUrl = values.referenceImageUrl.trim()
  if (!imageUrl) {
    errors.referenceImageUrl = 'Please enter a reference image URL.'
  } else if (!/^https:\/\/[^/\\\s][^\\\s]*$/i.test(imageUrl) || !URL.canParse(imageUrl)) {
    errors.referenceImageUrl = 'Please provide a valid HTTPS image URL.'
  }

  return errors
}

function RequiredMark() {
  return <span aria-hidden="true" className="ml-1 text-text-muted">*</span>
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <div id={id} aria-live="polite">
      {message && <p className="mt-(--space-2) text-supporting text-error">{message}</p>}
    </div>
  )
}

interface GenerationSelectProps<T extends string | number> {
  id: string
  label: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

function GenerationSelect<T extends string | number>({
  id,
  label,
  options,
  value,
  onChange,
}: GenerationSelectProps<T>) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => {
            const option = options.find(({ value }) => String(value) === event.target.value)
            if (option) onChange(option.value)
          }}
          className={controlClass + ' min-h-11 cursor-pointer appearance-none pr-(--space-6)'}
        >
          {options.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          className="pointer-events-none absolute top-1/2 right-(--space-3) size-4 -translate-y-1/2 text-text-secondary"
        >
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

interface GenerationFormProps {
  isSubmitting?: boolean
}

export function GenerationForm({ isSubmitting = false }: GenerationFormProps) {
  const id = useId()
  const [values, setValues] = useState<FieldValues>({
    projectName: '',
    shotName: '',
    prompt: '',
    referenceImageUrl: '',
  })
  const [touched, setTouched] = useState<Partial<Record<RequiredField, boolean>>>({})
  const [attempted, setAttempted] = useState(false)
  const [ratio, setRatio] = useState<Ratio>('1280:720')
  const [duration, setDuration] = useState<Duration>(5)
  const [showSubmissionNotice, setShowSubmissionNotice] = useState(false)

  const errors = validate(values)
  const firstInvalid = requiredFields.find((field) => errors[field])
  const referenceHelpId = id + '-reference-help'

  function fieldId(field: RequiredField) {
    return id + '-' + field
  }

  function visibleError(field: RequiredField) {
    return attempted || touched[field] ? errors[field] : undefined
  }

  function bindField(field: RequiredField, helpId?: string) {
    const error = visibleError(field)
    return {
      id: fieldId(field),
      name: field,
      value: values[field],
      required: true,
      'aria-invalid': Boolean(error),
      'aria-describedby': [helpId, error && fieldId(field) + '-error'].filter(Boolean).join(' ') || undefined,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = event.currentTarget
        setValues((current) => ({ ...current, [field]: value }))
        setShowSubmissionNotice(false)
      },
      onBlur: () => setTouched((current) => ({ ...current, [field]: true })),
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setAttempted(true)
    if (firstInvalid) {
      const input = event.currentTarget.elements.namedItem(firstInvalid)
      if (input instanceof HTMLElement) input.focus()
      return
    }

    setShowSubmissionNotice(true)
  }

  return (
    <form
      className="mt-(--space-5) grid gap-(--space-4)"
      noValidate
      aria-busy={isSubmitting || undefined}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-(--space-4) md:grid-cols-2">
        {nameFields.map((field) => (
          <div key={field}>
            <label htmlFor={fieldId(field)} className={labelClass}>
              {textFields[field].label}<RequiredMark />
            </label>
            <input
              {...bindField(field)}
              type="text"
              maxLength={textFields[field].maxLength}
              placeholder={textFields[field].placeholder}
              className={controlClass + ' min-h-11'}
            />
            <FieldError id={fieldId(field) + '-error'} message={visibleError(field)} />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor={fieldId('prompt')} className={labelClass}>
          {textFields.prompt.label}<RequiredMark />
        </label>
        <textarea
          {...bindField('prompt')}
          maxLength={textFields.prompt.maxLength}
          placeholder={textFields.prompt.placeholder}
          className={controlClass + ' block min-h-30 resize-y py-(--space-3)'}
        />
        <FieldError id={fieldId('prompt') + '-error'} message={visibleError('prompt')} />
      </div>

      <div className="rounded-card border border-dashed border-text-muted/70 bg-surface-elevated/45 p-(--space-4)">
        <div className="mb-(--space-3) flex items-center justify-center gap-(--space-3) sm:gap-(--space-4)">
          <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className="size-9 shrink-0 text-text-secondary">
            <path d="M19 4H7a3 3 0 0 0-3 3v18a3 3 0 0 0 3 3h18a3 3 0 0 0 3-3V15M4 24l7-7 4 4 5-5 8 8M26 3v8m-4-4h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="11" cy="11" r="2" fill="currentColor" />
          </svg>
          <div className="border-l border-border pl-(--space-3) sm:pl-(--space-4)">
            <label htmlFor={fieldId('referenceImageUrl')} className="block font-semibold">
              Reference image URL<RequiredMark />
            </label>
            <p id={referenceHelpId} className="mt-(--space-1) text-supporting text-text-secondary">
              Provide a publicly accessible image URL.
            </p>
          </div>
        </div>
        <input
          {...bindField('referenceImageUrl', referenceHelpId)}
          type="url"
          placeholder="https://example.com/reference.jpg"
          spellCheck={false}
          className={controlClass + ' min-h-11'}
        />
        <FieldError id={fieldId('referenceImageUrl') + '-error'} message={visibleError('referenceImageUrl')} />
      </div>

      <div className="grid gap-(--space-4) md:grid-cols-2">
        <GenerationSelect id={id + '-ratio'} label="Aspect ratio" options={ratioOptions} value={ratio} onChange={setRatio} />
        <GenerationSelect id={id + '-duration'} label="Duration" options={durationOptions} value={duration} onChange={setDuration} />
      </div>

      <div className="border-t border-border-subtle pt-(--space-4)">
        <div className="flex flex-col gap-(--space-3) sm:flex-row sm:items-center sm:justify-between">
          <p className="text-supporting text-text-muted" aria-live="polite">
            {ratio} · {duration} sec · Runway
          </p>
          {/* Keep Generate focusable while invalid so an attempt can reveal field errors. */}
          <button
            type="submit"
            disabled={isSubmitting}
            aria-disabled={Boolean(firstInvalid) || isSubmitting}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-(--space-2) rounded-control bg-primary px-(--space-5) text-button font-semibold text-text-primary hover:bg-[color-mix(in_srgb,var(--color-primary-hover)_40%,var(--color-primary))] active:bg-primary-active aria-disabled:cursor-not-allowed aria-disabled:bg-primary/55 aria-disabled:hover:bg-primary/55"
          >
            {isSubmitting ? (
              <span aria-hidden="true" className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />
            ) : (
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M8 2.5a.5.5 0 0 1 .47.33l1.35 3.7 3.68 1.35a.5.5 0 0 1 0 .94l-3.68 1.35-1.35 3.68a.5.5 0 0 1-.94 0l-1.35-3.68L2.5 8.82a.5.5 0 0 1 0-.94l3.68-1.35 1.35-3.7A.5.5 0 0 1 8 2.5Zm7.3 8.5a.4.4 0 0 1 .38.26l.78 2.13 2.12.78a.4.4 0 0 1 0 .75l-2.12.78-.78 2.12a.4.4 0 0 1-.75 0l-.78-2.12-2.13-.78a.4.4 0 0 1 0-.75l2.13-.78.78-2.13a.4.4 0 0 1 .37-.26Z" />
              </svg>
            )}
            {isSubmitting ? 'Submitting…' : 'Generate'}
          </button>
        </div>
        <div role="status">
          {showSubmissionNotice && (
            <p className="mt-(--space-2) text-supporting text-text-secondary">
              Generation submission is not available yet.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
