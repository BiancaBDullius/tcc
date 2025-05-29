import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundImage: `url('https://www.edf-re.uk/wp-content/uploads/2022/06/Dorenell_81.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: '5vw', // espaço da esquerda
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '2rem',
          borderRadius: '12px',
          minWidth: '300px',
          maxWidth: '90vw',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h2 style={{ margin: 0 }}>Bem-vindo</h2>
        <p style={{ margin: 0 }}>Clique abaixo para começar:</p>
        <button
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            cursor: 'pointer',
            backgroundColor: '#2e8b57',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            transition: 'background-color 0.3s ease',
            alignSelf: 'flex-start',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#246b45')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2e8b57')}
          onClick={() => navigate('/upload')}
        >
          Entrar
        </button>
      </div>
    </div>
  )
}
