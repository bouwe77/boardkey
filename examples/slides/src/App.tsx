import { useState } from 'react'
import { KeyboardProvider, useKeys } from 'boardkey'
import Slide1 from './Slide1'
import Slide2 from './Slide2'
import Slide3 from './Slide3'
import Slide4 from './Slide4'
import Slide5 from './Slide5'
import Slide6 from './Slide6'
import Slide7 from './Slide7'
import Slide8 from './Slide8'
import Slide9 from './Slide9'
import Slide10 from './Slide10'
import Slide11 from './Slide11'
import KeyCast from './KeyCast'

const SLIDES = [
  Slide1,
  Slide2,
  Slide3,
  Slide4,
  Slide5,
  Slide6,
  Slide7,
  Slide8,
  Slide9,
  Slide10,
  Slide11,
]

function Deck() {
  const [index, setIndex] = useState(0)

  // Stops at both ends, so the last slide does not roll back to the title
  const move = (step: number) =>
    setIndex((i) => Math.min(Math.max(i + step, 0), SLIDES.length - 1))

  useKeys({
    arrowright: () => move(1),
    arrowleft: () => move(-1),
  })

  const Slide = SLIDES[index]

  return (
    <div
      style={{
        height: 'calc(100vh - 47px)',
        background: '#1e1e1e',
        color: '#d4d4d4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <Slide />
      <KeyCast />
      <span
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          color: '#858585',
          fontSize: '14px',
        }}
      >
        {index + 1} / {SLIDES.length}
      </span>
    </div>
  )
}

export default function App() {
  return (
    <KeyboardProvider>
      <Deck />
    </KeyboardProvider>
  )
}
