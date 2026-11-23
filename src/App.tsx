import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { JournalLog } from '@/components/journal-log'
import { initSite } from '@/lib/site'

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
)

// placeholder screens on each case study image (✎ swap for real screenshots when you have them)
const Stack = () => (
  <div className="card-panel" aria-hidden="true">
    <div className="stack">
      {[0, 1, 2].map(i => <span key={i} style={{ '--i': i } as CSSProperties} />)}
    </div>
  </div>
)

type CaseStudy = {
  title: string
  swatch: string
  href: string
  tags: string[]
  text: string
  cta: string
  label: string
  locked?: boolean
}

const work: CaseStudy[] = [
  {
    title: 'Capital Markets - Market Monitor', swatch: 'feature sw-blueberry', href: 'market-monitor.html', locked: true,
    tags: ['JPMorgan', 'Consumer & Investment Banking'],
    text: 'Building solutions for investment bankers to help them discover more new features and building a helpful in-app platform to help the JPMorgan Global Digital Products team manage communications.',
    cta: 'View case study', label: 'Read the Capital Markets - Market Monitor case study (password protected)',
  },
  {
    title: 'SENSE', swatch: 'sw-pomegranate', href: '#work', tags: ['Designlab', 'Health tech', 'Case study'],
    text: "A women's health and fitness app that adapts training to the body instead of a generic plan.",
    cta: 'Case study coming soon', label: 'Learn more about SENSE',
  },
  {
    title: 'Roomster', swatch: 'sw-matcha', href: '#work', tags: ['Designlab', 'Social', 'Case study'],
    text: 'A roommate matching redesign built around trust: what people need to see before they share a lease.',
    cta: 'Case study coming soon', label: 'Learn more about Roomster',
  },
  {
    title: 'Mando', swatch: 'sw-lemon', href: '#work', tags: ['Designlab', 'EdTech', 'Case study'],
    text: 'Mandarin learning built around tones and characters, for learners who stall after the basics.',
    cta: 'Case study coming soon', label: 'Learn more about Mando',
  },
]

const WinBar = ({ children }: { children: ReactNode }) => (
  <div className="win-bar"><i></i><i></i><i></i><span>{children}</span></div>
)

export default function App() {
  useEffect(() => { initSite() }, [])

  return (
    <>
      <div className="topfade" aria-hidden="true"></div>
      <a className="wordmark" href="#" aria-label="Sharon Tieu, home">st</a>
      {/* ✎ fill in the real email address and resume file */}
      <ul className="toplinks" aria-label="Contact">
        <li><a href="https://www.linkedin.com/in/sharon-tieu/" target="_blank" rel="noopener">LinkedIn</a></li>
        <li><a href="mailto:">Email</a></li>
        <li><a href="#" target="_blank" rel="noopener">Resume</a></li>
      </ul>

      <div className="shell">
        <main>
          <header className="intro play-in" id="intro">
            <div className="intro-text">
              <h1><span className="name">Sharon</span><span className="role">UXUI Designer. Currently at <em>J.P.Morgan</em>.</span></h1>
              <div className="clock" role="timer" aria-label="Time in New York">
                <span className="mono loc" tabIndex={0} aria-describedby="prevPlaces">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>
                  New York
                  <span className="prev" id="prevPlaces" role="tooltip"><span className="prev-h">Previously</span><span>California</span><span>Texas</span></span>
                </span>
                <span className="sep" aria-hidden="true">|</span>
                <span className="time" tabIndex={0} aria-describedby="clockDiff">
                  <b id="clock">--:--:--</b><span className="mono tz" id="clockTz">EST</span>
                  <span className="mono diff" id="clockDiff" role="tooltip"><span className="prev-h">Time difference</span><span id="clockDiffTxt">Same time as you</span></span>
                </span>
              </div>
            </div>
            <picture className="chibi" role="button" tabIndex={0} aria-label="Play with Sharon's chibi">
              <source srcSet="/assets/sharon-still.webp" media="(prefers-reduced-motion: reduce)" />
              <img src="/assets/sharon-blink.webp" width={419} height={617} alt="Pixel-art chibi of Sharon, blinking" />
            </picture>
          </header>

          <div className="rail">
            <nav className="fdock" aria-label="Sections">
              <div className="fdock-panel">
                <a href="#work" aria-label="My work"><span className="tip" aria-hidden="true">My work</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect width="20" height="14" x="2" y="6" rx="2" /></svg></a>
                <a href="#playground" aria-label="Playground"><span className="tip" aria-hidden="true">Playground</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" /><path d="M6.453 15h11.094" /><path d="M8.5 2h7" /></svg></a>
                <a href="#about" aria-label="About me"><span className="tip" aria-hidden="true">About me</span>
                  <img className="fdock-av" src="/assets/avatar.webp" width={32} height={32} alt="" /></a>
              </div>
            </nav>
          </div>

          <section id="work" aria-label="My work" style={{ display: 'grid', gap: 22 }}>
            <div className="grid">
              {work.map(w => (
                <a key={w.title} className={`card ${w.swatch}`} href={w.href} aria-label={w.label}
                  {...(w.locked ? { 'data-locked': '', 'aria-haspopup': 'dialog' as const } : {})}>
                  <div className="card-body">
                    <h3>{w.title}</h3>
                    <ul className="badges">{w.tags.map(t => <li key={t}>{t}</li>)}</ul>
                    <p>{w.text}</p>
                    <span className="cta">{w.cta}<Arrow /></span>
                  </div>
                  <Stack />
                </a>
              ))}
            </div>
          </section>

          <section id="playground" aria-label="Playground" style={{ display: 'grid', gap: 22 }}>
            <div className="play">
              <div className="demo dex-demo win" id="dex">
                <WinBar>sharon's pokedex</WinBar>
                <div className="hover-shield" id="dexShield" aria-hidden="true"></div>
                <div className="embed dex-embed"><iframe src="https://sharon-tieu.github.io/git_test/pokedex.html" title="Pokédex by Sharon Tieu" loading="lazy"></iframe></div>
              </div>

              <div className="demo card-demo win">
                <WinBar>clowcard</WinBar>
                <div className="embed clow-embed"><iframe src="https://sharon-tieu.github.io/clow-card/" title="Cardcaptor Sakura card by Sharon Tieu" loading="lazy"></iframe></div>
              </div>

              <div className="demo model-demo win">
                <WinBar>Ji xiang jie - <span lang="zh-Hant">吉祥結</span> (Lucky Knot)</WinBar>
                <div className="embed model-embed">
                  <model-viewer src="/assets/model.glb" alt="Ji xiang jie (吉祥結), a red Chinese lucky knot, 3D model by Sharon Tieu" camera-controls="" auto-rotate=""
                    auto-rotate-delay="1500" rotation-per-second="18deg" interaction-prompt="none" shadow-intensity="0.6" exposure="1" loading="lazy" touch-action="pan-y"></model-viewer>
                </div>
              </div>
            </div>

          </section>

          <section id="about" className="view-about" hidden aria-label="About me" style={{ display: 'grid', gap: 22 }}>
            <div className="ab-intro">
              <div className="ab-text">
                <h3>My Story</h3>
                <p>I started out writing documentation, which meant years of watching the gap between how software is built and how people try to use it. Design was the obvious next step: fix the screen so the manual gets shorter.</p>
                <p>I moved to Manhattan for my role at JPMorgan Chase.</p>
              </div>
              <div className="ab-pics">
                <figure className="ab-pic me" data-bubble="hi! that's me!"><img src="/assets/portrait-cutout.webp" width={760} height={964} alt="Sharon smiling, in a cream cable-knit sweater" /></figure>
                <figure className="ab-pic cats" data-bubble="meet levi + aiyu! ฅ^•ﻌ•^ฅ"><img src="/assets/cats-cutout.webp" width={720} height={763} alt="Sharon's two cats, Levi and Aiyu: a brown tabby with a white chest and a fluffy cream cat" /></figure>
              </div>
            </div>

            {/* 3D journal icon: hover shows the "journal" bubble, click opens the Journal Log card (src/components/journal-log.tsx) */}
            <div className="icon3d-wrap">
              <JournalLog />
            </div>
          </section>

          <footer><span>© 2026 Sharon Tieu</span><span>Designed in New York</span></footer>
        </main>

        <dialog className="lock-dlg" id="lockDlg" aria-labelledby="lockTitle">
          <form id="lockForm">
            <button type="button" className="x" id="lockClose" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
            <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <h2 id="lockTitle">Protected case study</h2>
            <p>This work is confidential. Enter the password to view it.</p>
            <label htmlFor="lockPw">Password</label>
            <input id="lockPw" type="password" autoComplete="current-password" required />
            <button type="submit" className="go">Unlock</button>
            <p className="err" id="lockErr" role="alert"></p>
          </form>
        </dialog>
      </div>

      <div className="cursor-bubble" id="aboutBubble" aria-hidden="true"></div>
      <div className="cursor-bubble" id="dexBubble" aria-hidden="true">Pokedex: Sound is on. Adjust volume accordingly.</div>
    </>
  )
}
