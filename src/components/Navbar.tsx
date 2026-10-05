import { useEffect, useRef, useState } from 'react'

type NavbarProps = {
  reserveUrl: string
}

const EASE = 'cubic-bezier(0.77,0,0.175,1)'

export default function Navbar({ reserveUrl }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const links = [
    { label: 'Meet Yu', href: '#features' },
    { label: 'Why we built it', href: '#about' },
    { label: 'Reserve a seat', href: reserveUrl },
    { label: 'Become a mentor', href: '#mentor' },
  ]

  // close on Escape or on a click outside the pill
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  return (
    <nav ref={navRef} className="absolute left-1/2 top-6 z-50 -translate-x-1/2" aria-label="Main">
      <div className="flex items-center gap-6 rounded-full bg-white py-2 pl-6 pr-2 shadow-lg">
        <span className="whitespace-nowrap text-lg font-bold tracking-tight text-black">Kitchen Circle.</span>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="site-menu"
          className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
        >
          <span
            className={`absolute h-[2px] w-5 rounded-full bg-black transition-transform duration-300 ${
              open ? 'rotate-45' : '-translate-y-[4px]'
            }`}
            style={{ transitionTimingFunction: EASE }}
          />
          <span
            className={`absolute h-[2px] w-5 rounded-full bg-black transition-transform duration-300 ${
              open ? '-rotate-45' : 'translate-y-[4px]'
            }`}
            style={{ transitionTimingFunction: EASE }}
          />
        </button>
      </div>

      <div
        id="site-menu"
        className={`absolute left-0 right-0 top-full mt-2 origin-top rounded-2xl bg-white p-2 shadow-lg transition-all duration-300 ${
          open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
        }`}
        style={{ transitionTimingFunction: EASE }}
        aria-hidden={!open}
      >
        {links.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            className={`block rounded-xl px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-black/5 ${
              open ? 'animate-fade-in-down' : ''
            }`}
            style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
