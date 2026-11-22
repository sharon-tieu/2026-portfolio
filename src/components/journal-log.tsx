import { useRef } from 'react'
import { IconHover3D } from '@/components/ui/icon-3d-hover'

/* The 3D journal icon in About. Clicking it opens Sharon's Journal Log card in the middle of the
   screen over a dark overlay; "✕ Close", Esc, or a click outside closes it. */
export function JournalLog() {
  const dlg = useRef<HTMLDialogElement>(null)

  const open = () => {
    document.getElementById('aboutBubble')?.classList.remove('show')   // hide the "journal" hover bubble
    dlg.current?.showModal()
    dlg.current?.focus()   // focus the pop-up itself, so "✕ Close" doesn't open with a focus ring
  }

  return (
    <>
      <div className="journal-btn" data-bubble="journal" role="button" tabIndex={0} aria-haspopup="dialog" aria-label="Open my journal log"
        onClick={open} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}>
        <IconHover3D icon="journal" iconOnly width={102} height={102} />
      </div>

      <dialog ref={dlg} className="journal-dlg" aria-label="Journal log" tabIndex={-1}
        onClick={e => { if (e.target === dlg.current) dlg.current?.close() }}>
        <img src="/assets/journal-log.webp" width={1100} height={1639}
          alt="Journal Log. Present: Completed incubator project (3 months) in JPMorgan. Onwards to the next rotation! Jul 2026: making the big move to New York! May 2026: NO WAY!!11!! AN OPPORTUNITY AT JPMORGAN?! ;o; Jan 2025 – 2026: Started and completed Designlab w/ 3 end-to-end projects. Jun 2024 – 2026: Where it all began; technical writing at EBizCharge <3" />
        <button type="button" className="journal-close" onClick={() => dlg.current?.close()}>✕ Close</button>
      </dialog>
    </>
  )
}
