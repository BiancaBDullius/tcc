import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <button
        style={{
          padding: '1rem 2rem',
          fontSize: '1.5rem',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/upload')}
      >
        Carregar JSON das turbinas
      </button>
    </div>
  )
}
