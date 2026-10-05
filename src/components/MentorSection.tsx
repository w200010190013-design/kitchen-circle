import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Check, Plus } from 'lucide-react'
import { LIVE, sendRow } from '../lib/sheet'

type MentorAnswers = {
  name: string
  email: string
  dish: string
}

const EMPTY: MentorAnswers = { name: '', email: '', dish: '' }

const fieldClass = (error?: string) =>
  `mt-2 w-full rounded-xl border bg-transparent px-4 py-3 text-base text-[#FFF9F2] placeholder:text-[#FFF9F2]/40 focus:outline-none focus:ring-2 focus:ring-[#FFF9F2]/25 ${
    error ? 'border-[#F2A69B] focus:border-[#F2A69B]' : 'border-[#FFF9F2]/30 focus:border-[#FFF9F2]'
  }`

export default function MentorSection() {
  const [answers, setAnswers] = useState<MentorAnswers>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof MentorAnswers, string>>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const doneRef = useRef<HTMLHeadingElement>(null)

  const set = (key: keyof MentorAnswers, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const e: Partial<Record<keyof MentorAnswers, string>> = {}
    if (!answers.name.trim()) e.name = 'Please add your name.'
    if (!answers.email.trim()) e.email = 'Please add your email.'
    else if (!/^\S+@\S+\.\S+$/.test(answers.email.trim())) e.email = 'Please check the email address.'
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    setStatus('sending')
    await sendRow({
      type: 'mentor',
      first_name: answers.name.trim(),
      contact: answers.email.trim(),
      dishes: answers.dish.trim(),
    })
    setStatus('done')
    requestAnimationFrame(() => doneRef.current?.focus({ preventScroll: true }))
  }

  const restart = () => {
    setAnswers(EMPTY)
    setErrors({})
    setStatus('idle')
  }

  return (
    <section id="mentor" className="relative z-10 bg-[#F6E4CF] px-6 pb-20 md:pb-32">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl bg-[#321C04] p-6 text-[#FFF9F2] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16 md:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FFF9F2]/60">Senior students</p>
          <h2 className="mt-4 text-3xl font-normal leading-[1.2] md:text-[42px] md:leading-[1.2]">Become a food mentor</h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#FFF9F2]/75">
            If the pilot goes ahead: ninety minutes on a Tuesday. You bring one dish from home you can teach in ten
            minutes; we plan to bring the ingredients, the kitchen and the people. This is an unpaid volunteer role with
            capped hours.
          </p>
        </div>

        {status === 'done' ? (
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF9F2] text-[#321C04]">
              <Check size={22} aria-hidden="true" />
            </span>
            <h3 ref={doneRef} tabIndex={-1} className="mt-6 text-2xl font-normal focus:outline-none">
              Thank you, {answers.name.trim() || 'friend'}.
            </h3>
            <p className="mt-3 text-base leading-relaxed text-[#FFF9F2]/75">
              Your interest is recorded. We will email you if the pilot goes ahead.
            </p>
            {!LIVE && <p className="mt-2 text-sm text-[#FFF9F2]/55">Preview copy: nothing was sent to the sheet.</p>}
            <button
              type="button"
              onClick={restart}
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#FFF9F2] py-1.5 pl-1.5 pr-5 text-sm font-medium uppercase tracking-wide text-[#321C04] transition-colors hover:bg-[#F6E4CF]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#321C04] text-[#FFF9F2]">
                <Plus size={16} aria-hidden="true" />
              </span>
              Add another mentor
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium">
                Your name
                <span className="text-[#FFF9F2]/60" aria-hidden="true">
                  {' '}
                  *
                </span>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Priya"
                  value={answers.name}
                  onChange={(e) => set('name', e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'm-err-name' : undefined}
                  className={fieldClass(errors.name)}
                />
              </label>
              {errors.name && (
                <p id="m-err-name" className="mt-2 text-sm text-[#F2A69B]">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">
                Email
                <span className="text-[#FFF9F2]/60" aria-hidden="true">
                  {' '}
                  *
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@student.rmit.edu.au"
                  value={answers.email}
                  onChange={(e) => set('email', e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'm-err-email' : undefined}
                  className={fieldClass(errors.email)}
                />
              </label>
              {errors.email && (
                <p id="m-err-email" className="mt-2 text-sm text-[#F2A69B]">
                  {errors.email}
                </p>
              )}
            </div>
            <label className="block text-sm font-medium">
              A dish you can teach
              <input
                type="text"
                placeholder="Dal tadka, 西红柿炒蛋, adobo…"
                value={answers.dish}
                onChange={(e) => set('dish', e.target.value)}
                className={fieldClass()}
              />
            </label>
            <div className="mt-2">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center gap-3 rounded-full bg-[#FFF9F2] py-1.5 pl-1.5 pr-5 text-sm font-medium uppercase tracking-wide text-[#321C04] transition-colors hover:bg-[#F6E4CF] disabled:opacity-60"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#321C04] text-[#FFF9F2]">
                  <Plus size={16} aria-hidden="true" />
                </span>
                {status === 'sending' ? 'Sending…' : 'Sign up as a mentor'}
              </button>
            </div>
            <p className="text-xs leading-relaxed text-[#FFF9F2]/60">
              We keep your name and email in the team’s private sheet until December 2026.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
