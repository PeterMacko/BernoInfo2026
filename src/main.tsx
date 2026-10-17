import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

function App() {
  return (
    <main className="card">
      <p className="eyebrow">BernoInfo2026 · integration test</p>
      <h1>Hello, world.</h1>
      <p>This is a deployment smoke test. No election information is published here.</p>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
