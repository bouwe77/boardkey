export default function Slide3() {
  return (
    <div style={{ width: 'min(800px, 90vw)' }}>
      <h1 style={{ color: '#569cd6' }}>The problem</h1>
      <ul style={{ fontSize: '30px', lineHeight: 2 }}>
        <li>Multiple components, wanting the same keys</li>
        <li>The same key, a different meaning</li>
        <li style={{ color: '#4ec9b0' }}>boardkey decides who gets it</li>
      </ul>
    </div>
  )
}
