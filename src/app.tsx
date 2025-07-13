import React from 'react'

export default function App() {
  const [count, setCount] = React.useState<number>(0)

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h1>Vite SSR React App</h1>
      <p>This component is server-side rendered!</p>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        计数器: {count}
      </button>
    </div>
  )
}