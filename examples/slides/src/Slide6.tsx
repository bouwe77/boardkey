import Code, { colors } from './Code'

const CODE = `function Counter() {
  const [count, setCount] = useState(0)

  useKeys({
    arrowup: () => setCount((c) => c + 1),
    arrowdown: () => setCount((c) => c - 1),
  })

  return <strong>{count}</strong>
}

function Page() {
  const [open, setOpen] = useState(false)

  useKeys({ m: () => setOpen(true) }, { active: !open })

  return (
    <>
      <Counter />
      {open && <Modal onClose={() => setOpen(false)}><Counter /></Modal>}
    </>
  )
}`

export default function Slide6() {
  return (
    <div style={{ width: 'min(1000px, 92vw)' }}>
      <h1 style={{ color: colors.hook }}>Two counters, no conflict</h1>
      <Code fontSize="16px" mark="active">
        {CODE}
      </Code>
      <p style={{ fontSize: '24px', color: colors.accent }}>
        If the counter in the modal is on top, it gets the arrows.
      </p>
    </div>
  )
}
