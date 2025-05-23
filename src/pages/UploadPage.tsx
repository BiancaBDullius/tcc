import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useWindFarm } from '../context/WindFarmContext'

export default function UploadPage() {
  const navigate = useNavigate()
  const { setTurbinesPositions } = useWindFarm()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string)
        // Exemplo: json deve ser um array de objetos com posição [x,y,z]
        // Ajuste conforme seu formato de JSON
        const positions = json.map((turbine: any) => turbine.position as [number, number, number])
        setTurbinesPositions(positions)
        navigate('/scene')
      } catch (error) {
        alert('Erro ao carregar JSON. Verifique o formato do arquivo.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <h2>Selecione o arquivo JSON com as posições das turbinas</h2>
      <input type="file" accept=".json" onChange={handleFileChange} />
    </div>
  )
}
