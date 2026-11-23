'use client';

import React, { useState, useRef } from 'react';
import { motion, MotionConfigContext, LayoutGroup } from 'framer-motion';

// Types
interface Props {
  heading?: string;
  text?: string;
  variant?: 'Default' | 'Hover';
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  /** 'cube' (the original stacked slices), 'journal' (a 3D notebook) or 'books' (a stack of three books) 'pen' (a pen lying on a sheet of lined paper) 'coffee' (a takeaway coffee cup) 'controller' (a game controller) 'handheld' (a clamshell handheld console) 'circuit' (a printed circuit board) 'cats' (Levi and Aiyu) or 'playlist' (a vinyl record in its sleeve) */
  icon?: 'cube' | 'journal' | 'books' | 'pen' | 'coffee' | 'controller' | 'handheld' | 'circuit' | 'cats' | 'playlist';
  /** show only the icon (no card, heading or text) */
  iconOnly?: boolean;
}

// Transitions
const transition1 = {
  bounce: 0,
  delay: 0,
  duration: 0.4,
  type: "spring" as const
};

const transition2 = {
  delay: 0,
  duration: 0.4,
  ease: [0.44, 0, 0.56, 1] as [number, number, number, number],
  type: "tween" as const
};

const transformTemplate1 = (_: any, t: string) => `translate(-50%, -50%) ${t}`;

// Transition wrapper component
const Transition: React.FC<{ value: any; children: React.ReactNode }> = ({ value, children }) => {
  const config = React.useContext(MotionConfigContext);
  const transition = value ?? config.transition;
  const contextValue = React.useMemo(() => ({ ...config, transition }), [JSON.stringify(transition)]);

  return (
    <MotionConfigContext.Provider value={contextValue}>
      {children}
    </MotionConfigContext.Provider>
  );
};


const Variants = motion.create(React.Fragment);

/* ---------- Journal icon: a 3D notebook drawn in the same outline style as the cube.
   Cover, back, spine and page edges are the six faces of a box; an elastic band and a ribbon
   bookmark sit on the cover. On hover it turns and lifts the way the cube does. ---------- */
const JW = 200, JH = 250, JD = 46;   // width, height, thickness (before the icon's 0.3 scale)
const journalLine = "4px solid var(--foreground)";
const journalFace = (w: number, h: number, transform: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  position: "absolute", left: "50%", top: "50%", width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2,
  boxSizing: "border-box", border: journalLine, backgroundColor: "var(--background)", transform, ...extra
});
// page edges: thin lines running along the pages
const pagesAcross = { backgroundImage: "repeating-linear-gradient(90deg, color-mix(in srgb, var(--foreground) 35%, transparent) 0 2px, transparent 2px 9px)" };
const pagesDown = { backgroundImage: "repeating-linear-gradient(0deg, color-mix(in srgb, var(--foreground) 35%, transparent) 0 2px, transparent 2px 9px)" };

const Journal: React.FC<{ hover: boolean }> = ({ hover }) => (
  <motion.div
    className="journal"
    data-framer-name="Journal"
    style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, transformStyle: "preserve-3d", zIndex: 3, transformPerspective: 1200 }}
    initial={false}
    animate={hover ? { rotateX: -16, rotateY: -46, rotateZ: 4, scale: 1.1 } : { rotateX: 14, rotateY: -28, rotateZ: -8, scale: 1 }}
    transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
  >
    {/* back cover */}
    <div style={journalFace(JW, JH, `rotateY(180deg) translateZ(${JD / 2}px)`)} />
    {/* spine (solid) */}
    <div style={journalFace(JD, JH, `rotateY(-90deg) translateZ(${JW / 2}px)`, { backgroundColor: "var(--foreground)" })} />
    {/* page edges: right, top, bottom */}
    <div style={journalFace(JD, JH, `rotateY(90deg) translateZ(${JW / 2}px)`, pagesAcross)} />
    <div style={journalFace(JW, JD, `rotateX(90deg) translateZ(${JH / 2}px)`, pagesDown)} />
    <div style={journalFace(JW, JD, `rotateX(-90deg) translateZ(${JH / 2}px)`, pagesDown)} />
    {/* front cover with a label, the elastic band and a ribbon bookmark */}
    <div style={journalFace(JW, JH, `translateZ(${JD / 2}px)`)}>
      <div style={{ position: "absolute", left: 26, top: 44, width: 104, height: 52, border: journalLine, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: 26, top: 116, width: 70, height: 4, backgroundColor: "var(--foreground)" }} />
      <div style={{ position: "absolute", right: 26, top: -4, bottom: -4, width: 16, backgroundColor: "var(--foreground)" }} />
      <div style={{ position: "absolute", left: 60, bottom: -46, width: 18, height: 46, backgroundColor: "var(--primary, #581b11)",
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)" }} />
    </div>
  </motion.div>
);

/* ---------- Books icon: three books lying in a stack, spines facing out, same outline style.
   On hover the stack turns like the journal and the books fan out a little. ---------- */
type BookSpec = { w: number; h: number; y: number; turn: number; slide: number; spine: React.CSSProperties; band?: boolean };
const BD = 160;   // book depth (front to back)
const books: BookSpec[] = [
  { w: 230, h: 42, y: 40, turn: 0, slide: -6, spine: { backgroundColor: "var(--foreground)" } },
  { w: 206, h: 36, y: 1, turn: -9, slide: -16, spine: { backgroundColor: "var(--background)" }, band: true },
  { w: 184, h: 32, y: -33, turn: 7, slide: 22, spine: { backgroundColor: "var(--primary, #581b11)" } },
];
const Book: React.FC<{ b: BookSpec; hover: boolean }> = ({ b, hover }) => (
  <motion.div
    style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformStyle: "preserve-3d" }}
    initial={false}
    animate={{ y: b.y, x: hover ? b.slide : 0, rotateY: hover ? b.turn * 1.8 : b.turn }}
    transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
  >
    {/* spine (facing out), with two bands on the light one */}
    <div style={journalFace(b.w, b.h, `translateZ(${BD / 2}px)`, b.spine)}>
      {b.band && <>
        <div style={{ position: "absolute", left: 22, top: 0, bottom: 0, width: 10, backgroundColor: "var(--foreground)" }} />
        <div style={{ position: "absolute", right: 22, top: 0, bottom: 0, width: 10, backgroundColor: "var(--foreground)" }} />
      </>}
    </div>
    {/* page edges on the other three sides */}
    <div style={journalFace(b.w, b.h, `rotateY(180deg) translateZ(${BD / 2}px)`, pagesDown)} />
    <div style={journalFace(BD, b.h, `rotateY(90deg) translateZ(${b.w / 2}px)`, pagesDown)} />
    <div style={journalFace(BD, b.h, `rotateY(-90deg) translateZ(${b.w / 2}px)`, pagesDown)} />
    {/* covers */}
    <div style={journalFace(b.w, BD, `rotateX(90deg) translateZ(${b.h / 2}px)`)} />
    <div style={journalFace(b.w, BD, `rotateX(-90deg) translateZ(${b.h / 2}px)`)} />
  </motion.div>
);
const Books: React.FC<{ hover: boolean }> = ({ hover }) => (
  <motion.div
    className="books"
    data-framer-name="Books"
    style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, transformStyle: "preserve-3d", zIndex: 3, transformPerspective: 1200 }}
    initial={false}
    animate={hover ? { rotateX: -34, rotateY: 40, scale: 1.08 } : { rotateX: -22, rotateY: 24, scale: 1 }}
    transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
  >
    {books.map((b, i) => <Book key={i} b={b} hover={hover} />)}
  </motion.div>
);

/* ---------- Pen and paper icon: a lined sheet (with a red margin line) and a pen lying across it,
   same outline style. On hover the sheet tilts toward you and the pen moves as if writing. ---------- */
const PW = 210, PH = 270, PT = 6;       // paper width, height, thickness
const PL = 230, PR = 22;                // pen length and thickness
const paperLines = { backgroundImage: "repeating-linear-gradient(180deg, transparent 0 26px, color-mix(in srgb, var(--foreground) 30%, transparent) 26px 29px)", backgroundPosition: "0 34px" };
const PenAndPaper: React.FC<{ hover: boolean }> = ({ hover }) => (
  <motion.div
    className="pen-paper"
    data-framer-name="Pen and paper"
    style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, transformStyle: "preserve-3d", zIndex: 3, transformPerspective: 1200 }}
    initial={false}
    animate={hover ? { rotateX: 30, rotateY: -22, rotateZ: -4, scale: 1.08 } : { rotateX: 42, rotateY: -10, rotateZ: -10, scale: 1 }}
    transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
  >
    {/* the sheet: lined top with a red margin, thin edges */}
    <div style={journalFace(PW, PH, `translateZ(${PT / 2}px)`, paperLines)}>
      <div style={{ position: "absolute", left: 40, top: -4, bottom: -4, width: 4, backgroundColor: "var(--primary, #581b11)" }} />
    </div>
    <div style={journalFace(PW, PH, `rotateY(180deg) translateZ(${PT / 2}px)`)} />
    <div style={journalFace(PT, PH, `rotateY(90deg) translateZ(${PW / 2}px)`)} />
    <div style={journalFace(PT, PH, `rotateY(-90deg) translateZ(${PW / 2}px)`)} />
    <div style={journalFace(PW, PT, `rotateX(90deg) translateZ(${PH / 2}px)`)} />
    <div style={journalFace(PW, PT, `rotateX(-90deg) translateZ(${PH / 2}px)`)} />

    {/* the pen, lying across the sheet: black barrel, red cap end, pointed nib */}
    <motion.div
      style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformStyle: "preserve-3d", z: PT / 2 + PR / 2 + 2 }}
      initial={false}
      animate={hover ? { x: 6, y: 30, rotateZ: -50 } : { x: 18, y: 10, rotateZ: -38 }}
      transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
    >
      <div style={journalFace(PL, PR, `translateZ(${PR / 2}px)`, { backgroundColor: "var(--foreground)" })}>
        <div style={{ position: "absolute", left: 6, top: 4, width: 60, height: 6, backgroundColor: "var(--background)", opacity: .55 }} />
      </div>
      <div style={journalFace(PL, PR, `rotateX(180deg) translateZ(${PR / 2}px)`, { backgroundColor: "var(--foreground)" })} />
      <div style={journalFace(PL, PR, `rotateX(90deg) translateZ(${PR / 2}px)`, { backgroundColor: "var(--foreground)" })} />
      <div style={journalFace(PL, PR, `rotateX(-90deg) translateZ(${PR / 2}px)`, { backgroundColor: "var(--foreground)" })} />
      <div style={journalFace(PR, PR, `rotateY(-90deg) translateZ(${PL / 2}px)`, { backgroundColor: "var(--primary, #581b11)" })} />
      {/* nib: a point past the right end of the barrel */}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 46, height: PR, marginTop: -PR / 2,
        transform: `translateX(${PL / 2 - 2}px) translateZ(${PR / 2}px)`, backgroundColor: "var(--foreground)",
        clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 46, height: PR, marginTop: -PR / 2,
        transform: `translateX(${PL / 2 - 2}px)`, backgroundColor: "var(--foreground)",
        clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
    </motion.div>
  </motion.div>
);

/* ---------- Coffee cup icon: a takeaway cup (a 16-sided cylinder, shaded so it reads round) with a red
   sleeve, a lid and two lines of steam. On hover it turns and tips toward you and the steam rises. ---------- */
const CR = 64, CH = 196, CSIDES = 16;                       // cup radius, height, number of sides
const CFACE = 2 * CR * Math.tan(Math.PI / CSIDES) + 1;       // width of one side (+1px so the seams close)
const cupSides = Array.from({ length: CSIDES }, (_, i) => {
  const a = (360 / CSIDES) * i;
  const shade = Math.round((1 - Math.cos(((a - 35) * Math.PI) / 180)) * 9);   // darker on the far side
  return { a, shade };
});
const Coffee: React.FC<{ hover: boolean }> = ({ hover }) => (
  <motion.div
    className="coffee"
    data-framer-name="Coffee"
    style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, transformStyle: "preserve-3d", zIndex: 3, transformPerspective: 1200 }}
    initial={false}
    animate={hover ? { rotateX: -34, rotateY: 80, rotateZ: -6, scale: 1.08, y: 10 } : { rotateX: -26, rotateY: 20, rotateZ: 0, scale: 1, y: 16 }}
    transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
  >
    {/* the cup's sides, each with its piece of the sleeve */}
    {cupSides.map(({ a, shade }) => (
      <div key={a} style={{
        position: "absolute", left: "50%", top: "50%", width: CFACE, height: CH, marginLeft: -CFACE / 2, marginTop: -CH / 2,
        boxSizing: "border-box", borderTop: journalLine, borderBottom: journalLine,
        backgroundColor: `color-mix(in srgb, var(--foreground) ${shade}%, var(--background))`,
        transform: `rotateY(${a}deg) translateZ(${CR}px)`
      }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: "34%", height: "30%",
          backgroundColor: `color-mix(in srgb, #000 ${shade}%, var(--primary, #581b11))`,
          borderTop: journalLine, borderBottom: journalLine, boxSizing: "border-box" }} />
      </div>
    ))}
    {/* bottom, lid and the lid's raised top */}
    <div style={{ position: "absolute", left: "50%", top: "50%", width: CR * 2, height: CR * 2, marginLeft: -CR, marginTop: -CR,
      borderRadius: "50%", boxSizing: "border-box", border: journalLine, backgroundColor: "var(--background)",
      transform: `rotateX(90deg) translateZ(${-CH / 2}px)` }} />
    <div style={{ position: "absolute", left: "50%", top: "50%", width: CR * 2 + 22, height: CR * 2 + 22, marginLeft: -CR - 11, marginTop: -CR - 11,
      borderRadius: "50%", boxSizing: "border-box", border: journalLine, backgroundColor: "var(--background)",
      transform: `rotateX(90deg) translateZ(${CH / 2 + 4}px)` }} />
    <div style={{ position: "absolute", left: "50%", top: "50%", width: CR * 2 - 20, height: CR * 2 - 20, marginLeft: -CR + 10, marginTop: -CR + 10,
      borderRadius: "50%", boxSizing: "border-box", border: journalLine, backgroundColor: "color-mix(in srgb, var(--foreground) 8%, var(--background))",
      transform: `rotateX(90deg) translateZ(${CH / 2 + 16}px)` }} />
    {/* steam, kept facing you as the cup turns */}
    <motion.svg
      viewBox="0 0 80 90" width={80} height={90}
      style={{ position: "absolute", left: -40, top: -CH / 2 - 112, overflow: "visible" }}
      initial={false}
      animate={hover ? { rotateY: -80, y: -14, opacity: 1 } : { rotateY: -20, y: 0, opacity: 0.85 }}
      transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
    >
      <path d="M26 86c-12-14 12-22 0-38s10-24 2-40" fill="none" stroke="var(--foreground)" strokeWidth={6} strokeLinecap="round" />
      <path d="M54 86c-12-14 12-22 0-38s10-24 2-40" fill="none" stroke="var(--foreground)" strokeWidth={6} strokeLinecap="round" />
    </motion.svg>
  </motion.div>
);

/* ---------- Game controller icon: the controller's outline stacked in thin layers to give it thickness
   (dark sides, light top), with a d-pad, four buttons (one red) and two thumbsticks on top.
   It lies tilted toward you; on hover it lifts and turns as if picked up. ---------- */
const PAD_PATH = "M60 20H200C235 20 250 45 255 80C262 125 245 150 225 150C205 150 195 125 180 115H80C65 125 55 150 35 150C15 150-2 125 5 80C10 45 25 20 60 20Z";
const padLayers = [-12, -9, -6, -3, 0, 3, 6, 9];   // depth of each layer; the top sits at 12
const Pad: React.FC<{ z: number; top?: boolean }> = ({ z, top }) => (
  <svg viewBox="-4 14 268 142" width={268} height={142}
    style={{ position: "absolute", left: -134, top: -71, overflow: "visible", transform: `translateZ(${z}px)` }}>
    <path d={PAD_PATH} fill={top ? "var(--background)" : "var(--foreground)"} stroke="var(--foreground)" strokeWidth={top ? 5 : 2} strokeLinejoin="round" />
    {top && <g fill="var(--foreground)">
      {/* d-pad */}
      <rect x="60" y="56" width="16" height="44" rx="3" />
      <rect x="46" y="70" width="44" height="16" rx="3" />
      {/* face buttons */}
      <circle cx="196" cy="56" r="9" />
      <circle cx="216" cy="76" r="9" />
      <circle cx="176" cy="76" r="9" />
      <circle cx="196" cy="96" r="9" fill="var(--primary, #581b11)" />
      {/* thumbsticks */}
      <circle cx="104" cy="104" r="15" fill="var(--background)" stroke="var(--foreground)" strokeWidth={5} />
      <circle cx="104" cy="104" r="6" />
      <circle cx="156" cy="104" r="15" fill="var(--background)" stroke="var(--foreground)" strokeWidth={5} />
      <circle cx="156" cy="104" r="6" />
      {/* start / select */}
      <rect x="112" y="60" width="14" height="7" rx="3.5" />
      <rect x="134" y="60" width="14" height="7" rx="3.5" />
    </g>}
  </svg>
);
const Controller: React.FC<{ hover: boolean }> = ({ hover }) => (
  <motion.div
    className="controller"
    data-framer-name="Controller"
    style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, transformStyle: "preserve-3d", zIndex: 3, transformPerspective: 1200 }}
    initial={false}
    animate={hover ? { rotateX: 28, rotateY: -18, rotateZ: 8, scale: 1.1 } : { rotateX: 52, rotateY: 0, rotateZ: -10, scale: 1 }}
    transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
  >
    {padLayers.map(z => <Pad key={z} z={z} />)}
    <Pad z={12} top />
  </motion.div>
);

/* ---------- Handheld icon: a clamshell game console (3DS-style, no branding). The bottom half lies flat
   with a touchscreen, circle pad, d-pad and four buttons; the top half with the main screen is hinged
   open. On hover the console turns toward you and the lid opens wider. ---------- */
const HW = 236, HD = 150, HT = 18;   // width, depth of each half, thickness
const hBox = (prefix: string, radius: number, top?: React.ReactNode) => <>
  <div style={journalFace(HW, HD, `${prefix} translateZ(${HT / 2}px)`, { borderRadius: radius })}>{top}</div>
  <div style={journalFace(HW, HD, `${prefix} rotateY(180deg) translateZ(${HT / 2}px)`, { borderRadius: radius })} />
  <div style={journalFace(HW, HT, `${prefix} rotateX(-90deg) translateZ(${HD / 2}px)`)} />
  <div style={journalFace(HW, HT, `${prefix} rotateX(90deg) translateZ(${HD / 2}px)`)} />
  <div style={journalFace(HT, HD, `${prefix} rotateY(-90deg) translateZ(${HW / 2}px)`)} />
  <div style={journalFace(HT, HD, `${prefix} rotateY(90deg) translateZ(${HW / 2}px)`)} />
</>;
const dark = "var(--foreground)";
const Handheld: React.FC<{ hover: boolean }> = ({ hover }) => (
  <motion.div
    className="handheld"
    data-framer-name="Handheld"
    style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, transformStyle: "preserve-3d", zIndex: 3, transformPerspective: 1200 }}
    initial={false}
    animate={hover ? { rotateX: 40, rotateY: -16, rotateZ: 4, scale: 1.06, y: 34 } : { rotateX: 52, rotateY: 0, rotateZ: -10, scale: 1, y: 40 }}
    transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
  >
    {/* bottom half: touchscreen in the middle, circle pad + d-pad on the left, four buttons on the right */}
    {hBox("", 18, <>
      <div style={{ position: "absolute", left: 62, top: 16, width: 104, height: 80, border: `4px solid ${dark}`, borderRadius: 4, boxSizing: "border-box",
        backgroundColor: "color-mix(in srgb, var(--foreground) 10%, var(--background))" }} />
      <div style={{ position: "absolute", left: 14, top: 18, width: 34, height: 34, borderRadius: "50%", border: `4px solid ${dark}`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: 26, top: 64, width: 10, height: 34, backgroundColor: dark, borderRadius: 2 }} />
      <div style={{ position: "absolute", left: 14, top: 76, width: 34, height: 10, backgroundColor: dark, borderRadius: 2 }} />
      {[[192, 18], [208, 34], [176, 34], [192, 50]].map(([x, y], i) => (
        <div key={i} style={{ position: "absolute", left: x - 7, top: y - 7, width: 14, height: 14, borderRadius: "50%",
          backgroundColor: i === 3 ? "var(--primary, #581b11)" : dark }} />
      ))}
      <div style={{ position: "absolute", left: 84, top: 110, width: 60, height: 6, borderRadius: 3, backgroundColor: dark }} />
    </>)}
    {/* top half, hinged at the back edge: the main screen and a little camera */}
    <motion.div
      style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformStyle: "preserve-3d", y: -HD / 2, z: HT / 2 }}
      initial={false}
      animate={{ rotateX: hover ? -96 : -72 }}
      transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
    >
      {hBox(`translateY(${-HD / 2}px) translateZ(${HT / 2}px)`, 18, <>
        <div style={{ position: "absolute", left: 36, top: 18, width: 156, height: 100, border: `4px solid ${dark}`, borderRadius: 4, boxSizing: "border-box",
          backgroundColor: dark }}>
          <div style={{ position: "absolute", left: 10, top: 10, width: 46, height: 8, borderRadius: 4, backgroundColor: "var(--background)", opacity: .35 }} />
        </div>
        <div style={{ position: "absolute", left: HW / 2 - 6, top: 4, width: 8, height: 8, borderRadius: "50%", backgroundColor: dark }} />
      </>)}
    </motion.div>
  </motion.div>
);

/* ---------- Circuit board icon: a printed circuit board with traces and solder pads, a chip in the
   middle and two small red components. On hover the board turns toward you and the parts lift. ---------- */
const BW = 236, BH = 176, BT = 10;   // board width, height, thickness
const box3 = (w: number, h: number, d: number, fill: string, prefix = "") => <>
  <div style={journalFace(w, h, `${prefix} translateZ(${d / 2}px)`, { backgroundColor: fill })} />
  <div style={journalFace(w, h, `${prefix} rotateY(180deg) translateZ(${d / 2}px)`, { backgroundColor: fill })} />
  <div style={journalFace(w, d, `${prefix} rotateX(-90deg) translateZ(${h / 2}px)`, { backgroundColor: fill })} />
  <div style={journalFace(w, d, `${prefix} rotateX(90deg) translateZ(${h / 2}px)`, { backgroundColor: fill })} />
  <div style={journalFace(d, h, `${prefix} rotateY(-90deg) translateZ(${w / 2}px)`, { backgroundColor: fill })} />
  <div style={journalFace(d, h, `${prefix} rotateY(90deg) translateZ(${w / 2}px)`, { backgroundColor: fill })} />
</>;
const Circuit: React.FC<{ hover: boolean }> = ({ hover }) => (
  <motion.div
    className="circuit"
    data-framer-name="Circuit board"
    style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, transformStyle: "preserve-3d", zIndex: 3, transformPerspective: 1200 }}
    initial={false}
    animate={hover ? { rotateX: 38, rotateY: -20, rotateZ: 6, scale: 1.08 } : { rotateX: 50, rotateY: 0, rotateZ: -12, scale: 1 }}
    transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
  >
    {/* the board, with traces and pads drawn on top */}
    {box3(BW, BH, BT, "var(--background)")}
    <svg viewBox={`0 0 ${BW} ${BH}`} width={BW} height={BH}
      style={{ position: "absolute", left: -BW / 2, top: -BH / 2, transform: `translateZ(${BT / 2 + 0.5}px)`, overflow: "visible" }}>
      <g fill="none" stroke="var(--foreground)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 30H60L78 48" /><path d="M18 146H56L80 122" /><path d="M218 24V52L196 74" />
        <path d="M218 152H170L150 132" /><path d="M118 18V50" /><path d="M118 158V128" />
        <path d="M30 88H74" /><path d="M162 88H206" />
      </g>
      <g fill="var(--background)" stroke="var(--foreground)" strokeWidth={4}>
        {[[18, 30], [18, 146], [218, 24], [218, 152], [118, 18], [118, 158], [30, 88], [206, 88]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} />)}
      </g>
      {/* chip pins, peeking out around the chip */}
      <g stroke="var(--foreground)" strokeWidth={4} strokeLinecap="round">
        {[0, 1, 2, 3].map(i => <path key={"t" + i} d={`M${96 + i * 15} 56v-8`} />)}
        {[0, 1, 2, 3].map(i => <path key={"b" + i} d={`M${96 + i * 15} 120v8`} />)}
        {[0, 1, 2, 3].map(i => <path key={"l" + i} d={`M84 ${66 + i * 15}h-8`} />)}
        {[0, 1, 2, 3].map(i => <path key={"r" + i} d={`M152 ${66 + i * 15}h8`} />)}
      </g>
    </svg>
    {/* chip and two small components, lifting off the board on hover */}
    <motion.div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformStyle: "preserve-3d" }}
      initial={false} animate={{ z: hover ? 24 : BT / 2 + 8 }} transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}>
      {box3(64, 64, 16, "var(--foreground)")}
      <div style={{ position: "absolute", left: -20, top: -20, width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--background)", transform: "translateZ(8.5px)" }} />
    </motion.div>
    <motion.div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformStyle: "preserve-3d" }}
      initial={false} animate={{ z: hover ? 18 : BT / 2 + 6 }} transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}>
      {box3(30, 14, 12, "var(--primary, #581b11)", "translateX(-62px) translateY(-36px)")}
      {box3(14, 30, 12, "var(--primary, #581b11)", "translateX(70px) translateY(36px)")}
    </motion.div>
  </motion.div>
);

/* ---------- Cats icon: Levi (striped tabby with a white chest) and Aiyu (fluffy cream cat) sitting side by
   side, each a cat silhouette stacked in thin layers for thickness. On hover they turn and take a little hop. ---------- */
const CAT_PATH = "M30 62L22 16L48 40Q60 36 72 40L98 16L90 62Q100 78 92 94Q118 112 112 148Q110 158 100 158H20Q10 158 8 148Q2 112 28 94Q20 78 30 62Z";
const catLayers = [-10, -7, -4, -1, 2, 5, 8];   // depth of each layer; the face sits at 11
const CatFace: React.FC<{ tabby?: boolean }> = ({ tabby }) => {
  const ink = "var(--foreground)";
  return <g>
    {tabby ? <>
      {/* Levi: stripes on the head and body, white chest */}
      <path d="M52 44l3 10M60 42v12M68 44l-3 10" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      <path d="M16 128h16M14 116h16M88 116h16M88 128h16M20 140h14M86 140h14" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      <path d="M46 104Q60 96 74 104L70 150H50Z" fill="var(--background)" stroke={ink} strokeWidth={3} />
    </> : <>
      {/* Aiyu: soft cream with a fluffy chest */}
      <path d="M44 110q6 8 0 16q8 4 4 14M76 110q-6 8 0 16q-8 4-4 14" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
    </>}
    {/* inner ears */}
    <path d="M30 28L34 46L44 40Z M90 28L86 46L76 40Z" fill="var(--primary, #581b11)" opacity={0.85} />
    {/* eyes, nose, mouth, whiskers */}
    <circle cx="47" cy="68" r={tabby ? 5 : 6.5} fill={ink} /><circle cx="73" cy="68" r={tabby ? 5 : 6.5} fill={ink} />
    <circle cx="48.6" cy="66.4" r="1.6" fill="var(--background)" /><circle cx="74.6" cy="66.4" r="1.6" fill="var(--background)" />
    <path d="M56 77h8l-4 5z" fill="var(--primary, #581b11)" />
    <path d="M60 82q-3 5-8 3M60 82q3 5 8 3" fill="none" stroke={ink} strokeWidth={2.5} strokeLinecap="round" />
    <path d="M40 80h-14M40 85l-13 4M80 80h14M80 85l13 4" stroke={ink} strokeWidth={2} strokeLinecap="round" />
  </g>;
};
const Cat: React.FC<{ x: number; size: number; turn: number; tabby?: boolean; hover: boolean; delay: number }> = ({ x, size, turn, tabby, hover, delay }) => {
  const fill = tabby ? "var(--background)" : "color-mix(in srgb, #d5c3ad 45%, var(--background))";
  return (
    <motion.div
      style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformStyle: "preserve-3d" }}
      initial={false}
      animate={hover ? { x, y: [0, -22, 0], rotateZ: turn * -1, scale: size } : { x, y: 0, rotateZ: turn, scale: size }}
      transition={{ duration: 0.5, delay: hover ? delay : 0, ease: [0.44, 0, 0.56, 1] }}
    >
      {[...catLayers, 11].map(z => (
        <svg key={z} viewBox="0 0 120 162" width={120} height={162}
          style={{ position: "absolute", left: -60, top: -81, overflow: "visible", transform: `translateZ(${z}px)` }}>
          {/* tail, then the cat */}
          <path d="M104 146Q136 142 128 108" fill="none" stroke="var(--foreground)" strokeWidth={z === 11 ? 12 : 14} strokeLinecap="round" />
          {z === 11 && <path d="M104 146Q136 142 128 108" fill="none" stroke={fill} strokeWidth={5} strokeLinecap="round" />}
          <path d={CAT_PATH} fill={z === 11 ? fill : "var(--foreground)"} stroke="var(--foreground)" strokeWidth={z === 11 ? 5 : 2} strokeLinejoin="round" />
          {z === 11 && <CatFace tabby={tabby} />}
        </svg>
      ))}
    </motion.div>
  );
};
const Cats: React.FC<{ hover: boolean }> = ({ hover }) => (
  <motion.div
    className="cats"
    data-framer-name="Levi and Aiyu"
    style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, transformStyle: "preserve-3d", zIndex: 3, transformPerspective: 1200 }}
    initial={false}
    animate={hover ? { rotateX: 6, rotateY: -22, scale: 1.06 } : { rotateX: 12, rotateY: 22, scale: 1 }}
    transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
  >
    <Cat x={-62} size={1.05} turn={-4} tabby hover={hover} delay={0} />
    <Cat x={66} size={0.92} turn={5} hover={hover} delay={0.08} />
  </motion.div>
);

/* ---------- Playlist icon: a vinyl record peeking out of its sleeve. The sleeve has a simple cover (a red
   circle and title lines). On hover the record slides further out and spins. ---------- */
const SL = 200, ST = 12;   // sleeve size and thickness
const vinylGrooves = "repeating-radial-gradient(circle at 50% 50%, var(--foreground) 0 5px, color-mix(in srgb, var(--foreground) 78%, var(--background)) 5px 7px)";
const Playlist: React.FC<{ hover: boolean }> = ({ hover }) => (
  <motion.div
    className="playlist"
    data-framer-name="Playlist"
    style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, transformStyle: "preserve-3d", zIndex: 3, transformPerspective: 1200 }}
    initial={false}
    animate={hover ? { rotateX: 10, rotateY: -14, rotateZ: -4, scale: 1.04, x: -34 } : { rotateX: 16, rotateY: 26, rotateZ: -6, scale: 1, x: -22 }}
    transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}
  >
    {/* the record, between the sleeve's front and back */}
    <motion.div
      style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformStyle: "preserve-3d" }}
      initial={false}
      animate={hover ? { x: 96, rotateZ: 200 } : { x: 54, rotateZ: 0 }}
      transition={{ duration: 0.6, ease: [0.44, 0, 0.56, 1] }}
    >
      {[-2, 0, 2].map(z => (
        <div key={z} style={{ position: "absolute", left: -94, top: -94, width: 188, height: 188, borderRadius: "50%", boxSizing: "border-box",
          border: "4px solid var(--foreground)", background: z === 2 ? vinylGrooves : "var(--foreground)", transform: `translateZ(${z}px)` }}>
          {z === 2 && <>
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 64, height: 64, margin: -32, borderRadius: "50%",
              backgroundColor: "var(--primary, #581b11)", border: "4px solid var(--foreground)", boxSizing: "border-box" }} />
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 10, height: 10, margin: -5, borderRadius: "50%", backgroundColor: "var(--background)" }} />
            <div style={{ position: "absolute", left: 30, top: 34, width: 36, height: 10, borderRadius: 6, backgroundColor: "var(--background)", opacity: .35, transform: "rotate(-40deg)" }} />
          </>}
        </div>
      ))}
    </motion.div>
    {/* the sleeve: cover on the front, plain back, thin edges */}
    <div style={journalFace(SL, SL, `translateZ(${ST / 2}px)`)}>
      <div style={{ position: "absolute", left: 26, top: 26, width: 84, height: 84, borderRadius: "50%", backgroundColor: "var(--primary, #581b11)", border: "4px solid var(--foreground)", boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: 26, top: 132, width: 120, height: 8, borderRadius: 4, backgroundColor: "var(--foreground)" }} />
      <div style={{ position: "absolute", left: 26, top: 150, width: 80, height: 8, borderRadius: 4, backgroundColor: "var(--foreground)", opacity: .5 }} />
    </div>
    <div style={journalFace(SL, SL, `rotateY(180deg) translateZ(${ST / 2}px)`)} />
    <div style={journalFace(ST, SL, `rotateY(-90deg) translateZ(${SL / 2}px)`)} />
    <div style={journalFace(SL, ST, `rotateX(90deg) translateZ(${SL / 2}px)`)} />
    <div style={journalFace(SL, ST, `rotateX(-90deg) translateZ(${SL / 2}px)`)} />
  </motion.div>
);

export const IconHover3D: React.FC<Props> = ({
  heading = "Library",
  text = "A comprehensive collection of digital books and resources for learning and research. ",
  variant = 'Default',
  className = "",
  style = {},
  width = 600, // Increased from 369
  height = 150, // Increased from 71
  icon = 'cube',
  iconOnly = false,
  ...restProps
}) => {  const [currentVariant, setCurrentVariant] = useState<'Default' | 'Hover'>(variant);
  const [gestureState, setGestureState] = useState({ isHovered: false });
  const refBinding = useRef<HTMLDivElement>(null);
  const defaultLayoutId = React.useId();

  const isHoverVariant = currentVariant === 'Hover';
  const variants = [currentVariant === 'Default' ? 'GPnJri30y' : 'zEwHlJ7zp'];

  const handleMouseEnter = async () => {
    setGestureState({ isHovered: true });
    setCurrentVariant('Hover');
  };

  const handleMouseLeave = async () => {
    setGestureState({ isHovered: false });
    setCurrentVariant('Default');
  };

  const cubeSliceVariants = {
    zEwHlJ7zp: {
      "--border-color": "rgb(139, 47, 250)"
    }
  };
  const titleVariants = {
    default: {
      "--fill-width": "0%"
    },
    hovered: {
      "--fill-width": "100%"
    }
  };

  // Add this new transition for the title
  const titleTransition = {
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // Smoother easing curve
    type: "tween" as const
  };


  const sliceCubeVariants = {
    zEwHlJ7zp: {
      rotateX: -28,
      rotateY: -43,
      scale: 1.1
    }
  };

  const cornerScaleVariants = {
    zEwHlJ7zp: {
      scale: 2.2
    }
  };

  const bgFillVariants = {
    zEwHlJ7zp: {
      opacity: 1
    }
  };



  return (
    <div style={{ width, height }}>
      <LayoutGroup id={defaultLayoutId}>
        <Variants animate={variants} initial={false}>
          <Transition value={transition1}>
            <motion.div
              {...restProps}
              className={`icon-hover-3d ${className}`}
              data-framer-name="Default"
              data-highlight={true}
              ref={refBinding}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={currentVariant === 'Hover' ? handleMouseLeave : undefined}              style={{
                backgroundColor: "var(--background)",
                alignContent: "center",
                alignItems: "center",
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                gap: "40px", // Increased gap
                height: "min-content",
                justifyContent: "center",
                overflow: "visible",
                padding: "20px", // Added padding
                position: "relative",
                width: "min-content",
                borderRadius: "12px", // Added border radius
                border: "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
                ...style,
                ...(iconOnly ? { padding: 0, gap: 0, border: 'none', backgroundColor: 'transparent', borderRadius: 0 } : {})
              }}
            >
              {/* Icon Container */}
              <motion.div
                className="icon-container"
                data-framer-name="Icon"
                style={{
                  alignContent: "center",
                  alignItems: "center",
                  display: "flex",
                  flex: "none",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  gap: "10px",
                  height: "100px", // Increased from 64px
                  justifyContent: "center",
                  overflow: "visible",
                  padding: "0px",
                  position: "relative",
                  width: "100px", // Increased from 64px                  zIndex: 1,
                  border: "1px solid color-mix(in srgb, var(--foreground) 20%, transparent)"
                }}
              >
                {/* BG Container */}
                <motion.div
                  className="bg-container"
                  data-framer-name="BG"
                  style={{
                    flex: "none",
                    height: "348px",
                    overflow: "visible",
                    position: "relative",
                    width: "348px",
                    zIndex: 2,
                    scale: 0.3 // Increased from 0.2
                  }}
                >
                  {icon === 'journal' ? <Journal hover={isHoverVariant} /> : icon === 'books' ? <Books hover={isHoverVariant} /> : icon === 'pen' ? <PenAndPaper hover={isHoverVariant} /> : icon === 'coffee' ? <Coffee hover={isHoverVariant} /> : icon === 'controller' ? <Controller hover={isHoverVariant} /> : icon === 'handheld' ? <Handheld hover={isHoverVariant} /> : icon === 'circuit' ? <Circuit hover={isHoverVariant} /> : icon === 'cats' ? <Cats hover={isHoverVariant} /> : icon === 'playlist' ? <Playlist hover={isHoverVariant} /> : (<>
                  {/* Slice Cube */}
                  <motion.div
                    className="slice-cube"
                    data-framer-name="Slice Cube"
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                      display: "flex",
                      flex: "none",
                      flexDirection: "column",
                      flexWrap: "nowrap",
                      gap: "28px",
                      height: "min-content",
                      justifyContent: "center",
                      left: "50%",
                      overflow: "visible",
                      padding: "0px",
                      position: "absolute",
                      top: "50%",
                      transformStyle: "preserve-3d",
                      width: "min-content",
                      zIndex: 3,
                      rotate: 49,
                      rotateX: 23,
                      rotateY: 33,
                      scale: 0.7,
                      transformPerspective: 1200
                    }}
                    transformTemplate={transformTemplate1}
                    variants={sliceCubeVariants}
                    animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                  >
                    {/* Slice 1 */}
                    <Transition value={transition2}>
                      <motion.div
                        className="slice-1"
                        data-framer-name="Slice 1"
                        style={{
                          alignContent: "center",
                          alignItems: "center",
                          display: "flex",
                          flex: "none",
                          flexDirection: "row",
                          flexWrap: "nowrap",
                          gap: "10px",
                          height: "min-content",
                          justifyContent: "center",
                          overflow: "visible",
                          padding: "0px",
                          position: "relative",
                          transformStyle: "preserve-3d",
                          width: "min-content"
                        }}
                      >
                        {/* Front */}
                        <motion.div
                          className="slice-1-front"
                          data-framer-name="Front"
                          style={{
                            alignContent: "center",
                            alignItems: "center",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            height: "34px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "relative",
                            width: "240px", border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            zIndex: 120
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Back */}
                        <motion.div
                          className="slice-1-back"
                          data-framer-name="Back" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            right: "0px",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: 180,
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Right */}
                        <motion.div
                          className="slice-1-right"
                          data-framer-name="Right" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            left: "120px",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Left */}
                        <motion.div
                          className="slice-1-left"
                          data-framer-name="Left" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            right: "120px",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: -90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Top */}
                        <motion.div
                          className="slice-1-top"
                          data-framer-name="Top" style={{
                            flex: "none",
                            height: "240px",
                            left: "0px",
                            overflow: "hidden",
                            position: "absolute",
                            right: "0px",
                            top: "-120px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateX: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Bottom */}
                        <motion.div
                          className="slice-1-bottom"
                          data-framer-name="Bottom" style={{
                            flex: "none",
                            height: "240px",
                            left: "0px",
                            overflow: "hidden",
                            position: "absolute",
                            right: "0px",
                            top: "-86px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateX: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                      </motion.div>
                    </Transition>

                    {/* Slice 2 - Similar structure */}
                    <Transition value={transition2}>
                      <motion.div
                        className="slice-2"
                        data-framer-name="Slice 2"
                        style={{
                          alignContent: "center",
                          alignItems: "center",
                          display: "flex",
                          flex: "none",
                          flexDirection: "row",
                          flexWrap: "nowrap",
                          gap: "10px",
                          height: "min-content",
                          justifyContent: "center",
                          overflow: "visible",
                          padding: "0px",
                          position: "relative",
                          transformStyle: "preserve-3d",
                          width: "min-content"
                        }}
                      >
                        {/* Front */}
                        <motion.div
                          className="slice-1-front"
                          data-framer-name="Front"
                          style={{
                            alignContent: "center",
                            alignItems: "center",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            height: "34px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "relative",
                            width: "240px", border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            zIndex: 120
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Back */}
                        <motion.div
                          className="slice-1-back"
                          data-framer-name="Back" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            right: "0px",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: 180,
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Right */}
                        <motion.div
                          className="slice-1-right"
                          data-framer-name="Right" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            left: "120px",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Left */}
                        <motion.div
                          className="slice-1-left"
                          data-framer-name="Left" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            right: "120px",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: -90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Top */}
                        <motion.div
                          className="slice-1-top"
                          data-framer-name="Top" style={{
                            flex: "none",
                            height: "240px",
                            left: "0px",
                            overflow: "hidden",
                            position: "absolute",
                            right: "0px",
                            top: "-120px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateX: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Bottom */}
                        <motion.div
                          className="slice-1-bottom"
                          data-framer-name="Bottom" style={{
                            flex: "none",
                            height: "240px",
                            left: "0px",
                            overflow: "hidden",
                            position: "absolute",
                            right: "0px",
                            top: "-86px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateX: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                      </motion.div>
                    </Transition>

                    {/* Slice 3 - Similar structure */}
                    <Transition value={transition2}>
                      <motion.div
                        className="slice-3"
                        data-framer-name="Slice 3"
                        style={{
                          alignContent: "center",
                          alignItems: "center",
                          display: "flex",
                          flex: "none",
                          flexDirection: "row",
                          flexWrap: "nowrap",
                          gap: "10px",
                          height: "min-content",
                          justifyContent: "center",
                          overflow: "visible",
                          padding: "0px",
                          position: "relative",
                          transformStyle: "preserve-3d",
                          width: "min-content"
                        }}
                      >
                        {/* Front */}
                        <motion.div
                          className="slice-1-front"
                          data-framer-name="Front"
                          style={{
                            alignContent: "center",
                            alignItems: "center",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            height: "34px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "relative",
                            width: "240px", border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            zIndex: 120
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Back */}
                        <motion.div
                          className="slice-1-back"
                          data-framer-name="Back" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            right: "0px",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: 180,
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Right */}
                        <motion.div
                          className="slice-1-right"
                          data-framer-name="Right" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            left: "120px",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Left */}
                        <motion.div
                          className="slice-1-left"
                          data-framer-name="Left" style={{
                            alignContent: "center",
                            alignItems: "center",
                            bottom: "0px",
                            display: "flex",
                            flex: "none",
                            flexDirection: "column",
                            flexWrap: "nowrap",
                            gap: "10px",
                            justifyContent: "center",
                            overflow: "hidden",
                            padding: "0px",
                            position: "absolute",
                            right: "120px",
                            top: "0px",
                            width: "240px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateY: -90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Top */}
                        <motion.div
                          className="slice-1-top"
                          data-framer-name="Top" style={{
                            flex: "none",
                            height: "240px",
                            left: "0px",
                            overflow: "hidden",
                            position: "absolute",
                            right: "0px",
                            top: "-120px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateX: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                        {/* Bottom */}
                        <motion.div
                          className="slice-1-bottom"
                          data-framer-name="Bottom" style={{
                            flex: "none",
                            height: "240px",
                            left: "0px",
                            overflow: "hidden",
                            position: "absolute",
                            right: "0px",
                            top: "-86px",
                            zIndex: 1,
                            border: "4px solid var(--foreground)",
                            backgroundColor: "var(--background)",
                            rotateX: 90
                          }}
                          variants={cubeSliceVariants}
                          animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                        />
                      </motion.div>
                    </Transition>
                  </motion.div>
                  </>)}
                  {/* Corner elements */}
                  <motion.div
                  style={{
                    flex: "none",
                    height: "24px",
                    left: isHoverVariant ? "-6px" : "14px",
                    overflow: "hidden",
                    position: "absolute",
                    top: isHoverVariant ? "-6px" : "14px",
                    width: "24px",
                    zIndex: 2,
                    borderLeft: "4px solid var(--foreground)",
                    borderTop: "4px solid var(--foreground)",
                    scale: 1
                  }}
                  variants={cornerScaleVariants}
                  animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                  />
                  <motion.div
                  style={{
                    flex: "none",
                    height: "24px",
                    left: isHoverVariant ? "-6px" : "14px",
                    overflow: "hidden",
                    position: "absolute",
                    top: isHoverVariant ? "330px" : "310px",
                    width: "24px",
                    zIndex: 2,
                    borderLeft: "4px solid var(--foreground)",
                    borderBottom: "4px solid var(--foreground)",
                    scale: 1
                  }}
                  variants={cornerScaleVariants}
                  animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                  />
                  <motion.div
                  style={{
                    bottom: isHoverVariant ? "-6px" : "14px",
                    flex: "none",
                    height: "24px",
                    overflow: "hidden",
                    position: "absolute",
                    right: isHoverVariant ? "-6px" : "14px",
                    width: "24px",
                    zIndex: 2,
                    borderRight: "4px solid var(--foreground)",
                    borderBottom: "4px solid var(--foreground)",
                    scale: 1
                  }}
                  variants={cornerScaleVariants}
                  animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                  />
                  <motion.div
                  style={{
                    flex: "none",
                    height: "24px",
                    overflow: "hidden",
                    position: "absolute",
                    right: isHoverVariant ? "-6px" : "14px",
                    top: isHoverVariant ? "-6px" : "14px",
                    width: "24px",
                    zIndex: 2,
                    borderRight: "4px solid var(--foreground)",
                    borderTop: "4px solid var(--foreground)",
                    scale: 1
                  }}
                  variants={cornerScaleVariants}
                  animate={isHoverVariant ? 'zEwHlJ7zp' : 'default'}
                  />
                </motion.div>
              </motion.div>

              {!iconOnly && (<>
              {/* Content */}
              <motion.div
                className="content"
                data-framer-name="Content"
                style={{
                  alignContent: "flex-start",
                  alignItems: "flex-start",
                  display: "flex",
                  flex: "none",
                  flexDirection: "column",
                  flexWrap: "nowrap",
                  gap: "12px", // Increased gap
                  height: "min-content",
                  justifyContent: "center",
                  maxWidth: "400px", // Increased max width
                  overflow: "hidden",
                  padding: "0px",
                  position: "relative",
                  width: "min-content"
                }}
              >
                {/* Text Container */}
                <motion.div
                  className="text-container"
                  data-framer-name="Text"
                  style={{
                    alignContent: "center",
                    alignItems: "center",
                    display: "flex",
                    flex: "none",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    gap: "10px",
                    height: "32px", // Increased height
                    justifyContent: "center",
                    overflow: "visible",
                    padding: "0px",
                    position: "relative",
                  }}
                >
                  {/* BG Fill - Hidden for clean black/white effect */}
                  <motion.div
                    className="bg-fill"
                    data-framer-name="BG Fill"
                    style={{
                      flex: "none",
                      height: "32px", // Increased height
                      left: "0px",
                      overflow: "hidden",
                      position: "absolute",
                      top: "calc(50% - 16px)", // Adjusted for new height
                      width: "1px", // Keep minimal
                      zIndex: 0,
                      backgroundColor: "transparent", // Made transparent
                      opacity: 0 // Always hidden
                    }}
                  />                  {/* Heading Text with hover effect */}
                  <motion.div
                    style={{
                      flex: "none",
                      height: "32px", // Increased height
                      position: "relative",
                      whiteSpace: "pre",
                      width: "auto",
                      fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                      fontWeight: "600",
                      fontSize: "18px", // Increased font size
                      color: "var(--foreground)",
                      userSelect: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      overflow: "hidden"
                    }}
                  >
                    {/* Background text (white) */}
                    <span className='mx-1 text-center' style={{ position: "relative", zIndex: 1 }}>
                      {heading}
                    </span>                    {/* Animated overlay text (black) */}
                    <motion.span
                    className='mx-1 mt-0.5 text-center'
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        color: "var(--background)",
                        clipPath: `inset(0 ${isHoverVariant ? '0%' : '100%'} 0 0)`,
                        zIndex: 2
                      }}
                      animate={{
                        clipPath: `inset(0 ${isHoverVariant ? '0%' : '100%'} 0 0)`
                      }}
                      transition={titleTransition}
                    >
                      {heading}
                    </motion.span>

                    {/* White background fill that moves from left to right */}
                    <motion.div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "var(--foreground)",
                        transformOrigin: "left center",
                        scaleX: 0,
                        zIndex: 1
                      }}
                      animate={{
                        scaleX: isHoverVariant ? 1 : 0
                      }}
                      transition={titleTransition}
                    />
                  </motion.div>
                </motion.div>

                {/* Description Text */}
                <motion.div
                  style={{
                    flex: "none",
                    height: "auto",
                    position: "relative",
                    whiteSpace: "pre-wrap",
                    width: "400px", // Increased width
                    wordBreak: "break-word",
                    wordWrap: "break-word",
                    fontFamily: '"Inter", "Inter Placeholder", sans-serif',
                    fontWeight: "400", // Reduced weight for better readability
                    fontSize: "16px", // Increased font size
                    lineHeight: "1.5em", // Improved line height
                    color: "color-mix(in srgb, var(--foreground) 70%, transparent)",
                    userSelect: "none"
                  }}
                >
                  {text}
                </motion.div>
              </motion.div>
              </>)}
            </motion.div>
          </Transition>
        </Variants>
      </LayoutGroup>
    </div>
  );
};
