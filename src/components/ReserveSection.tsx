import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { LIVE, sendRow } from '../lib/sheet'

// Same questions and options as the original prototype page, split into three short steps.
const CAMPUSES = ['City', 'Bundoora', 'Brunswick', 'Other / online']
const ARRIVALS = ['Less than 1 month ago', '1–3 months ago', '3–6 months ago', '6–12 months ago', 'More than a year ago']
const EVENINGS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

const STEPS = [
  { title: 'About you', hint: 'So we know which campus kitchen to plan for.' },
  { title: 'Your food', hint: 'So the menu tastes like home. All optional.' },
  { title: 'How we reach you', hint: 'Only for the menu message on the Sunday before.' },
]

const MENU = [
  { dish: 'Dal tadka with cumin rice', qty: '2 boxes' },
  { dish: 'Tomato & egg stir-fry 西红柿炒蛋', qty: '2 boxes' },
  { dish: 'Roast pumpkin & chickpea salad (rescued veg)', qty: 'shared' },
  { dish: 'Skill of the week: rice that never burns', qty: '10 min' },
]

const FAQ = [
  {
    q: 'Is it really free?',
    a: 'Yes during the pilot. We plan to cook with rescued produce plus a small staples budget; supply is still being arranged. If the circle continues, we would test a $2–3 co-payment per circle, never more.',
  },
  {
    q: 'I can’t cook at all. Is that a problem?',
    a: 'That’s the point. Every circle teaches one skill in ten minutes, and your mentor will be a senior student who once started from scratch too.',
  },
  {
    q: 'Who sees my answers?',
    a: 'Only the student project team. Your answers go to a private Google Sheet that only the team can open, and we delete them when the course ends in December 2026. We never ask about visa, income or work hours.',
  },
]

type Answers = {
  firstName: string
  campus: string
  arrival: string
  dishes: string
  diet: string
  evenings: string[]
  contact: string
}

const EMPTY: Answers = { firstName: '', campus: '', arrival: '', dishes: '', diet: '', evenings: [], contact: '' }

type Errors = Partial<Record<keyof Answers, string>>

function validate(step: number, a: Answers): Errors {
  const e: Errors = {}
  if (step === 0) {
    if (!a.firstName.trim()) e.firstName = 'Please add your first name.'
    if (!a.campus) e.campus = 'Please choose a campus.'
    if (!a.arrival) e.arrival = 'Please choose when you arrived.'
  }
  if (step === 2 && !a.contact.trim()) e.contact = 'Please add a phone number or email.'
  return e
}

const inputClass = (error?: string) =>
  `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-base text-[#321C04] placeholder:text-[#321C04]/40 focus:outline-none focus:ring-2 focus:ring-[#321C04]/20 ${
    error ? 'border-[#B3261E] focus:border-[#B3261E]' : 'border-[#D9C4AA] focus:border-[#321C04]'
  }`

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null
  return (
    <p id={id} className="mt-2 text-sm text-[#B3261E]">
      {text}
    </p>
  )
}

type ChoiceProps = {
  name: string
  type: 'radio' | 'checkbox'
  options: string[]
  isChecked: (option: string) => boolean
  onToggle: (option: string) => void
  describedBy?: string
}

/** Pill-shaped radio buttons or checkboxes (real inputs, so keyboard and screen readers work as usual). */
function Choices({ name, type, options, isChecked, onToggle, describedBy }: ChoiceProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((option) => (
        <label key={option} className="cursor-pointer">
          <input
            type={type}
            name={name}
            value={option}
            checked={isChecked(option)}
            onChange={() => onToggle(option)}
            aria-describedby={describedBy}
            className="peer sr-only"
          />
          <span className="inline-flex items-center rounded-full border border-[#D9C4AA] bg-white px-4 py-2 text-sm text-[#321C04] transition-colors hover:border-[#321C04] peer-checked:border-[#321C04] peer-checked:bg-[#321C04] peer-checked:text-[#FFF9F2] peer-focus-visible:ring-2 peer-focus-visible:ring-[#321C04]/30">
            {option}
          </span>
        </label>
      ))}
    </div>
  )
}

function Group({ legend, children }: { legend: ReactNode; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-[#321C04]">{legend}</legend>
      {children}
    </fieldset>
  )
}

const Req = () => (
  <span className="text-[#321C04]/60" aria-hidden="true">
    {' '}
    *
  </span>
)

export default function ReserveSection() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [doneName, setDoneName] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)

  // move focus to the new step's heading (not on first render)
  useEffect(() => {
    if (moved.current) headingRef.current?.focus({ preventScroll: true })
    moved.current = true
  }, [step, status])

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((a) => ({ ...a, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const toggleEvening = (day: string) =>
    set('evenings', answers.evenings.includes(day) ? answers.evenings.filter((d) => d !== day) : [...answers.evenings, day])

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const e = validate(step, answers)
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }
    setStatus('sending')
    await sendRow({
      type: 'seat',
      first_name: answers.firstName.trim(),
      contact: answers.contact.trim(),
      campus: answers.campus,
      arrival: answers.arrival,
      dishes: answers.dishes.trim(),
      diet: answers.diet.trim(),
      evenings: answers.evenings.join(', '),
    })
    setDoneName(answers.firstName.trim())
    setStatus('done')
  }

  const restart = () => {
    setAnswers(EMPTY)
    setErrors({})
    setStep(0)
    setStatus('idle')
  }

  const darkButton =
    'inline-flex items-center gap-3 rounded-full bg-[#321C04] py-1.5 pl-1.5 pr-5 text-sm font-medium uppercase tracking-wide text-[#FFF9F2] transition-colors hover:bg-[#1F1003] disabled:opacity-60'
  const lightButton =
    'inline-flex items-center gap-3 rounded-full bg-[#D9C4AA] py-1.5 pl-1.5 pr-5 text-sm font-medium uppercase tracking-wide text-[#321C04] transition-colors hover:bg-[#CEBA9E]'
  const iconDot = 'flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF9F2] text-[#321C04]'

  return (
    <section id="reserve" className="relative z-10 rounded-t-[25px] bg-[#F6E4CF] px-6 py-20 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
        {/* left: what happens, and the three questions people ask */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#321C04]/70">Reserve a seat</p>
          <h2 className="mt-4 text-3xl font-normal leading-[1.2] text-[#321C04] md:text-[42px] md:leading-[1.2]">
            Pilot circles are planned for October 2026 at RMIT City.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#321C04]/80">
            Three short steps, about thirty seconds. We use your answers only to plan the menu and the kitchen. Seats
            would be confirmed by message on the Sunday before.
          </p>
          {/* sample menu: the concrete offer */}
          <div id="menu" className="mt-10 rounded-3xl border border-[#D9C4AA] bg-[#FFF9F2]/60 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#321C04]/70">Sample menu</p>
            <h3 className="mt-2 text-xl font-medium text-[#321C04]">Circle 1 · Home comforts</h3>
            <p className="mt-1 text-sm text-[#321C04]/70">Tue 6:00 pm · Example mentor: a 3rd-year Business student</p>
            <ul className="mt-4 border-t border-[#D9C4AA]">
              {MENU.map((item) => (
                <li key={item.dish} className="flex items-baseline justify-between gap-4 border-b border-[#D9C4AA] py-2.5 text-sm text-[#321C04]">
                  <span>{item.dish}</span>
                  <span className="shrink-0 text-[#321C04]/60">{item.qty}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-[#321C04]">
              <div>
                <dt className="text-xs uppercase tracking-widest text-[#321C04]/60">Cost to you</dt>
                <dd className="mt-1 font-medium">Free (pilot)</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-[#321C04]/60">You bring</dt>
                <dd className="mt-1 font-medium">An empty container</dd>
              </div>
            </dl>
          </div>

          <div className="mt-10 border-t border-[#D9C4AA]">
            {FAQ.map((item) => (
              <details key={item.q} className="group border-b border-[#D9C4AA]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-medium text-[#321C04] [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-xl leading-none text-[#321C04]/60 transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-[#321C04]/80">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* right: the three-step form */}
        <div className="rounded-3xl bg-[#FFF9F2] p-6 md:p-10">
          {status === 'done' ? (
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#321C04] text-[#FFF9F2]">
                <Check size={22} aria-hidden="true" />
              </span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-[#321C04]/70">Seat reserved</p>
              <h3 ref={headingRef} tabIndex={-1} className="mt-2 text-3xl font-normal text-[#321C04] focus:outline-none">
                You’re in, {doneName || 'friend'}.
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[#321C04]/80">
                Thanks for reserving. Your interest is now recorded with the student team. This is a university project
                and the pilot is not confirmed yet; if it runs, we will message you on the Sunday before with the menu
                and the kitchen location.
              </p>
              <p className="mt-4 text-sm text-[#321C04]/60">All entries are deleted when the course ends in December 2026.</p>
              {!LIVE && (
                <p className="mt-2 text-sm text-[#321C04]/60">Preview copy: nothing was sent to the sheet.</p>
              )}
              <div className="mt-8">
                <button type="button" onClick={restart} className={lightButton}>
                  <span className={iconDot}>
                    <ArrowLeft size={16} aria-hidden="true" />
                  </span>
                  Reserve for a friend
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              {/* progress */}
              <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
                {STEPS.map((s, i) => (
                  <li key={s.title} aria-current={i === step ? 'step' : undefined}>
                    <span className={`block h-1 rounded-full ${i <= step ? 'bg-[#321C04]' : 'bg-[#D9C4AA]'}`} />
                    <span className={`mt-2 block text-xs font-medium ${i <= step ? 'text-[#321C04]' : 'text-[#321C04]/50'}`}>
                      {i + 1}. {s.title}
                    </span>
                  </li>
                ))}
              </ol>

              <h3 ref={headingRef} tabIndex={-1} className="mt-8 text-2xl font-normal text-[#321C04] focus:outline-none">
                <span className="sr-only">
                  Step {step + 1} of {STEPS.length}:{' '}
                </span>
                {STEPS[step].title}
              </h3>
              <p className="mt-1 text-sm text-[#321C04]/70">{STEPS[step].hint}</p>

              <div className="mt-6 flex flex-col gap-6">
                {step === 0 && (
                  <>
                    <label className="block text-sm font-medium text-[#321C04]">
                      First name
                      <Req />
                      <input
                        type="text"
                        autoComplete="given-name"
                        placeholder="Yu"
                        value={answers.firstName}
                        onChange={(e) => set('firstName', e.target.value)}
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? 'err-firstName' : undefined}
                        className={inputClass(errors.firstName)}
                      />
                    </label>
                    <FieldError id="err-firstName" text={errors.firstName} />
                    <Group legend={<>Campus<Req /></>}>
                      <Choices
                        name="campus"
                        type="radio"
                        options={CAMPUSES}
                        isChecked={(o) => answers.campus === o}
                        onToggle={(o) => set('campus', o)}
                        describedBy={errors.campus ? 'err-campus' : undefined}
                      />
                      <FieldError id="err-campus" text={errors.campus} />
                    </Group>
                    <Group legend={<>When did you arrive in Australia?<Req /></>}>
                      <Choices
                        name="arrival"
                        type="radio"
                        options={ARRIVALS}
                        isChecked={(o) => answers.arrival === o}
                        onToggle={(o) => set('arrival', o)}
                        describedBy={errors.arrival ? 'err-arrival' : undefined}
                      />
                      <FieldError id="err-arrival" text={errors.arrival} />
                    </Group>
                  </>
                )}

                {step === 1 && (
                  <>
                    <label className="block text-sm font-medium text-[#321C04]">
                      What would you love to cook or eat?
                      <textarea
                        rows={3}
                        placeholder="e.g. dal, mapo tofu, pho, jollof rice, biryani…"
                        value={answers.dishes}
                        onChange={(e) => set('dishes', e.target.value)}
                        className={inputClass()}
                      />
                    </label>
                    <label className="block text-sm font-medium text-[#321C04]">
                      Dietary needs
                      <input
                        type="text"
                        placeholder="halal, vegetarian, vegan, allergies…"
                        value={answers.diet}
                        onChange={(e) => set('diet', e.target.value)}
                        className={inputClass()}
                      />
                    </label>
                    <Group legend="Evenings you could come (tick any)">
                      <Choices
                        name="evenings"
                        type="checkbox"
                        options={EVENINGS}
                        isChecked={(o) => answers.evenings.includes(o)}
                        onToggle={toggleEvening}
                      />
                    </Group>
                  </>
                )}

                {step === 2 && (
                  <>
                    <label className="block text-sm font-medium text-[#321C04]">
                      Phone or email
                      <Req />
                      <input
                        type="text"
                        autoComplete="email"
                        placeholder="you@student.rmit.edu.au"
                        value={answers.contact}
                        onChange={(e) => set('contact', e.target.value)}
                        aria-invalid={!!errors.contact}
                        aria-describedby={errors.contact ? 'err-contact' : 'help-contact'}
                        className={inputClass(errors.contact)}
                      />
                    </label>
                    <p id="help-contact" className="-mt-4 text-sm text-[#321C04]/60">
                      Used once a week, for Sunday’s menu.
                    </p>
                    <FieldError id="err-contact" text={errors.contact} />
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-2xl border border-[#D9C4AA] p-4 text-sm text-[#321C04]">
                      <dt className="text-[#321C04]/60">Name</dt>
                      <dd>{answers.firstName}</dd>
                      <dt className="text-[#321C04]/60">Campus</dt>
                      <dd>{answers.campus}</dd>
                      <dt className="text-[#321C04]/60">Arrived</dt>
                      <dd>{answers.arrival}</dd>
                      <dt className="text-[#321C04]/60">Evenings</dt>
                      <dd>{answers.evenings.length ? answers.evenings.join(', ') : 'Not chosen'}</dd>
                    </dl>
                    <p className="text-xs leading-relaxed text-[#321C04]/60">
                      No proof of need, ever. By reserving you agree that the student project team stores these answers in a
                      private sheet until December 2026.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {step > 0 && (
                  <button type="button" onClick={() => setStep(step - 1)} className={lightButton}>
                    <span className={iconDot}>
                      <ArrowLeft size={16} aria-hidden="true" />
                    </span>
                    Back
                  </button>
                )}
                <button type="submit" disabled={status === 'sending'} className={darkButton}>
                  <span className={iconDot}>
                    {step < STEPS.length - 1 ? <ArrowRight size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
                  </span>
                  {step < STEPS.length - 1 ? 'Next' : status === 'sending' ? 'Sending…' : 'Reserve my free seat'}
                </button>
              </div>
              {Object.keys(errors).some((k) => errors[k as keyof Answers]) && (
                <p className="mt-4 text-sm text-[#B3261E]" role="alert">
                  Please check the highlighted answers.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
