export default function Slide3() {
  return (
    <div style={{ width: 'min(800px, 90vw)' }}>
      <h1 style={{ color: '#569cd6' }}>The problem</h1>
      <ul style={{ fontSize: '30px', lineHeight: 2 }}>
        <li>
          Multiple components, wanting the{' '}
          <span style={{ color: '#569cd6' }}>same keys</span>
        </li>
        <li>
          The same key, a{' '}
          <span style={{ color: '#569cd6' }}>different meaning</span>
        </li>
        <li>boardkey manages who gets it</li>
      </ul>
    </div>
  )
}
