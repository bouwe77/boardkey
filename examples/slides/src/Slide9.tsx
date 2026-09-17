import { colors } from './Code'

export default function Slide9() {
  return (
    <div style={{ textAlign: 'center' }}>
      <pre
        style={{
          display: 'inline-block',
          margin: '40px 0',
          padding: '20px 40px',
          background: colors.panel,
          border: `1px solid ${colors.border}`,
          fontSize: '32px',
        }}
      >
        npm install boardkey
      </pre>
      <p style={{ fontSize: '26px', color: colors.accent }}>
        github.com/bouwe77/boardkey
      </p>
    </div>
  )
}
