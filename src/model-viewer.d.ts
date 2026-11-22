// <model-viewer> is a web component loaded from a CDN script in index.html; this lets TSX accept it
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, string | undefined>
    }
  }
}
