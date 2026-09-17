import Code, { colors } from './Code'

const CODE = `function NoteModal({ onClose, onSubmit }) {
  const [note, setNote] = useState('')

  useMute()
  useKeys({
    escape: onClose,
    enter: () => onSubmit(note),
  })

  return <input value={note} onChange={...} autoFocus />
}

function Page() {
  const [color, setColor] = useState('green')
  const [open, setOpen] = useState(false)

  useKeys({
    r: () => setColor('red'),
    g: () => setColor('green'),
    b: () => setColor('blue'),
    m: () => setOpen(true),
  }, { active: !open })
}`

export default function Slide8() {
  return (
    <div style={{ width: 'min(1000px, 92vw)' }}>
      <h1 style={{ color: colors.hook }}>Mute while typing</h1>
      <Code fontSize="16px">{CODE}</Code>
      <p style={{ fontSize: '24px', color: colors.accent }}>
        r g b and m go into the input. Escape still closes the modal.
      </p>
    </div>
  )
}
