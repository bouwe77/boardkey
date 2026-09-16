import { Colors } from 'boardkey/tui'

export const MONOCHROME: Colors = {
  title: '#d4d4d4',
  border: '#d4d4d4',
  background: '#1e1e1e',
  text: '#d4d4d4',
  selectedBackground: '#d4d4d4',
  selectedText: '#1e1e1e',
}

export const AMBER: Colors = {
  title: '#ffb000',
  border: '#c07800',
  background: '#1a1200',
  text: '#ffd280',
  selectedBackground: '#ffb000',
  selectedText: '#1a1200',
}

export const PHOSPHOR: Colors = {
  title: '#39ff14',
  border: '#1f7a10',
  background: '#001400',
  text: '#8cff7c',
  selectedBackground: '#39ff14',
  selectedText: '#001400',
}

export const SYNTH: Colors = {
  title: '#ff6ec7',
  border: '#8a2be2',
  background: '#16001f',
  text: '#c8a2ff',
  selectedBackground: '#00ffe0',
  selectedText: '#16001f',
}

export const THEMES = [
  { key: '1', label: 'Monochrome', colors: MONOCHROME },
  { key: '2', label: 'Amber', colors: AMBER },
  { key: '3', label: 'Phosphor', colors: PHOSPHOR },
  { key: '4', label: 'Synth', colors: SYNTH },
]

// Random per channel inside a range: dark stays readable under light text, and
// light stays readable on a dark background, while the hue is a surprise.
const channel = (min: number, max: number) =>
  Math.floor(min + Math.random() * (max - min))
    .toString(16)
    .padStart(2, '0')

const pick = (min: number, max: number) =>
  `#${channel(min, max)}${channel(min, max)}${channel(min, max)}`

export const randomColors = (): Colors => ({
  title: pick(150, 255),
  border: pick(90, 200),
  background: pick(0, 40),
  text: pick(150, 255),
  selectedBackground: pick(150, 255),
  selectedText: pick(0, 40),
})
