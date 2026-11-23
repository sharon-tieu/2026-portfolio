import { useRef, type PointerEvent } from 'react'
import { IconHover3D } from '@/components/ui/icon-3d-hover'

/* Levi and Aiyu as a 3D icon in About. Clicking it opens Levi and Aiyu's photo in the middle of the screen over a
   dark overlay; "✕ Close", Esc, or a click outside closes it. While it's open the cursor is a little digital camera
   (its screen is see-through, like a viewfinder); on touch screens there is no cursor, so it stays hidden. */
export function CatPaws() {
  const dlg = useRef<HTMLDialogElement>(null)
  const cam = useRef<HTMLImageElement>(null)
  // the camera follows the pointer, centred on its screen
  const moveCam = (e: PointerEvent) => {
    const c = cam.current
    if (!c) return
    c.style.transform = `translate(${e.clientX - 55}px, ${e.clientY - 82}px)`
    c.style.visibility = 'visible'
  }

  const open = () => {
    document.getElementById('aboutBubble')?.classList.remove('show')   // hide the hover bubble
    const d = dlg.current
    if (!d) return
    if (cam.current) cam.current.style.visibility = 'hidden'   // shown once the pointer moves
    d.showModal()
    d.focus({ preventScroll: true })   // focus the pop-up itself, so "✕ Close" doesn't open with a focus ring
  }

  return (
    <>
      <div className="journal-btn" data-bubble="meet levi + aiyu! ฅ^•ﻌ•^ฅ" role="button" tabIndex={0} aria-haspopup="dialog" aria-label="See Levi and Aiyu, my cats"
        onClick={open} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}>
        <IconHover3D icon="cats" iconOnly width={102} height={102} />
      </div>

      <dialog ref={dlg} className="journal-dlg cats-dlg" aria-label="Levi and Aiyu" tabIndex={-1}
        onClick={e => { if (e.target === dlg.current) dlg.current?.close() }}
        onPointerMove={moveCam} onPointerEnter={moveCam}>
        <img ref={cam} className="cam-cursor" src="/assets/camera-cursor.webp" width={150} height={148} alt="" aria-hidden="true" />
        <img src="/assets/cats-cutout.webp" width={720} height={763}
          alt="Sharon's two cats, Levi and Aiyu: a brown tabby with a white chest and a fluffy cream cat" />
        <button type="button" className="journal-close" onClick={() => dlg.current?.close()}>✕ Close</button>
      </dialog>
    </>
  )
}
