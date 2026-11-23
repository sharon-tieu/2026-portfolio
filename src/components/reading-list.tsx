import { useRef } from 'react'
import { IconHover3D } from '@/components/ui/icon-3d-hover'

/* What Sharon is reading, in three columns, each with how far along she is (progress, 0–100). */
const reading = [
  { label: 'For fun', title: 'Throne of Glass', author: 'Sarah J. Maas', cover: '/assets/book-throne-of-glass.webp', progress: 53 },
  { label: 'For design', title: 'Solving Product Design Exercises', author: 'Artiom Dashinsky', cover: '/assets/book-product-design-exercises.webp', progress: 100 },
  { label: 'For career', title: 'The Unspoken Rules', author: 'Gorick Ng', cover: '/assets/book-unspoken-rules.webp', progress: 98 },
]

/* The 3D books icon in About. Clicking it opens the reading list in the middle of the screen over
   a dark overlay; "✕ Close", Esc, or a click outside closes it. */
export function ReadingList() {
  const dlg = useRef<HTMLDialogElement>(null)

  const open = () => {
    document.getElementById('aboutBubble')?.classList.remove('show')   // hide the hover bubble
    const d = dlg.current
    if (!d) return
    d.showModal()
    d.focus({ preventScroll: true })   // focus the pop-up itself, so "✕ Close" doesn't open with a focus ring
    d.scrollTop = 0                    // on phones the list scrolls: always start at "For fun"
  }

  return (
    <>
      <div className="journal-btn" data-bubble="what i'm reading" role="button" tabIndex={0} aria-haspopup="dialog" aria-label="Open what I'm reading"
        onClick={open} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}>
        <IconHover3D icon="books" iconOnly width={102} height={102} />
      </div>

      <dialog ref={dlg} className="journal-dlg reading-dlg" aria-labelledby="readingTitle" tabIndex={-1}
        onClick={e => { if (e.target === dlg.current) dlg.current?.close() }}>
        <h2 id="readingTitle" className="sr-only">What I'm reading</h2>
        <ul className="reading">
          {reading.map(b => (
            <li key={b.label}>
              <h3>{b.label}</h3>
              <img src={b.cover} width={560} height={866} alt={`${b.title} by ${b.author}, book cover`} />
              <div className="read-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={b.progress}
                aria-label={`${b.title}: ${b.progress}% read`}>
                <span className="track"><span className="fill" style={{ width: `${b.progress}%` }} /></span>
                <span className="pct">{b.progress}%</span>
              </div>
              <p><span>{b.title}</span>{b.author}</p>
            </li>
          ))}
        </ul>
        <button type="button" className="journal-close" onClick={() => dlg.current?.close()}>✕ Close</button>
      </dialog>
    </>
  )
}
