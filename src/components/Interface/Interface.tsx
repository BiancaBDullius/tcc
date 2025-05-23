import React, { useState } from 'react'
import './Interface.css'

type Point = {
    id: number | string
    position: [number, number, number]
}
type InterfaceProps = {
    onAddPoint: () => void
    points: Point[]
    selectedId: number | string | null
    onSelectPoint: (id: number | string) => void
    grassEnabled: boolean
    setGrassEnabled: (value: boolean) => void
}

type TabKey = 'pontos' | 'ajuda' | 'config' | 'avancado'

export default function Interface({
    onAddPoint,
    points,
    selectedId,
    onSelectPoint,
    grassEnabled,
    setGrassEnabled
}: InterfaceProps) {
    const [tab, setTab] = useState<TabKey>('pontos')

    return (
        <div
            style={{
                position: 'absolute',
                top: 20,
                left: 20,
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '10px 15px',
                borderRadius: '10px',
                color: '#fff',
                fontFamily: 'sans-serif',
                zIndex: 10,
                maxWidth: 300,
                minHeight: 300,
                minWidth: 200,
            }}
        >
            {/* Cabeçalho das Abas */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <button onClick={() => setTab('pontos')} style={getTabStyle(tab === 'pontos')}>📍</button>
                <button onClick={() => setTab('ajuda')} style={getTabStyle(tab === 'ajuda')}>❓</button>
                <button onClick={() => setTab('config')} style={getTabStyle(tab === 'config')}>⚙️</button>
                <button onClick={() => setTab('avancado')} style={getTabStyle(tab === 'avancado')}>🚁</button>
            </div>

            {/* Conteúdo da Aba */}
            {tab === 'pontos' && (
                <>
                    <h4>Trajetória</h4>
                    <button
                        onClick={onAddPoint}
                        style={{
                            marginBottom: '10px',
                            padding: '6px 12px',
                            backgroundColor: '#2e8b57',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            width: '100%',
                        }}
                    >
                        Adicionar Ponto
                    </button>

                    <hr style={{ margin: '10px 0', borderColor: '#444' }} />

                    <h4>Lista de Pontos</h4>
                    {points.length === 0 && <p style={{ fontSize: 12 }}>Nenhum ponto criado.</p>}
                    <ul
                        style={{
                            listStyle: 'none',
                            paddingLeft: 0,
                            maxHeight: 150,
                            overflowY: 'auto',
                            fontSize: 14,
                            margin: 0,
                        }}
                    >
                        {points.map((point) => (
                            <li
                                key={point.id}
                                onClick={() => onSelectPoint(point.id)}
                                style={{
                                    padding: '6px 8px',
                                    marginBottom: 6,
                                    cursor: 'pointer',
                                    backgroundColor: selectedId === point.id ? '#2e8b57' : 'transparent',
                                    borderRadius: 5,
                                    userSelect: 'none',
                                }}
                            >
                                ID: {point.id} — Pos: {point.position.map((v) => v.toFixed(2)).join(', ')}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {tab === 'ajuda' && (
                <>
                    <h4>Controles</h4>
                    <ul style={{ paddingLeft: 15, fontSize: '14px', marginTop: 0 }}>
                        <li>W/A/S/D: Mover câmera</li>
                        <li>Mouse: Orbitar</li>
                        <li>Clique: Selecionar ponto</li>
                        <li>Arrastar: Mover ponto</li>
                    </ul>
                </>
            )}

            {tab === 'config' && (
                <>
                    <h4>Configurações</h4>
                    <div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <label htmlFor="toggle-grass">Grama:</label>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={grassEnabled}
                                onChange={(e) => setGrassEnabled(e.target.checked)}
                            />
                            <span className="slider" />
                        </label>

                    </div>
                </>
            )}


            {tab === 'avancado' && (
                <>
                    <h4>Avançado</h4>
                    <p style={{ fontSize: 14 }}>Espaço para funcionalidades como exportar JSON, importar dados, etc.</p>
                </>
            )}
        </div>
    )
}

function getTabStyle(active: boolean): React.CSSProperties {
    return {
        background: active ? '#2e8b57' : 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: 20,
        cursor: 'pointer',
        padding: 4,
        borderRadius: 6,
        width: 32,
        height: 32,
    }
}
