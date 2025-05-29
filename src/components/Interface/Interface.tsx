// src/components/Interface/Interface.tsx
import React, { useState } from 'react';
import './Interface.css';
import { PathPoint } from '../../utils/pathfinding'; // Import the consistent Point type

// Use PathPoint for consistency with SceneCanvas
type Point = PathPoint; 

type InterfaceProps = {
    onAddPoint: () => void;
    points: Point[]; // Use the consistent Point type
    selectedId: string | null; // Assuming ID is always string
    onSelectPoint: (id: string) => void; // Assuming ID is always string
    grassEnabled: boolean;
    setGrassEnabled: (value: boolean) => void;
    onGeneratePath: () => void;
    onDeletePoint: (id: string) => void; // New prop, assuming ID is string
};

type TabKey = 'pontos' | 'ajuda' | 'config' | 'avancado';

export default function Interface({
    onAddPoint,
    points,
    selectedId,
    onSelectPoint,
    grassEnabled,
    setGrassEnabled,
    onGeneratePath,
    onDeletePoint, // Destructure
}: InterfaceProps) {
    const [tab, setTab] = useState<TabKey>('pontos');

    const buttonStyle: React.CSSProperties = {
        marginBottom: '10px',
        padding: '6px 12px',
        backgroundColor: '#2e8b57',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '100%',
    };

    return (
        <div className="interface-container">
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 10, borderBottom: '1px solid #444', paddingBottom: 10 }}>
                <button onClick={() => setTab('pontos')} style={getTabStyle(tab === 'pontos')} title="Pontos">📍</button>
                <button onClick={() => setTab('config')} style={getTabStyle(tab === 'config')} title="Configurações">⚙️</button>
                <button onClick={() => setTab('avancado')} style={getTabStyle(tab === 'avancado')} title="Avançado">🚁</button>
                <button onClick={() => setTab('ajuda')} style={getTabStyle(tab === 'ajuda')} title="Ajuda">❓</button>
            </div>

            {tab === 'pontos' && (
                <>
                    <h4>Trajetória</h4>
                    <button onClick={onAddPoint} style={buttonStyle}>
                        Adicionar Ponto
                    </button>
                    <hr style={{ margin: '10px 0', borderColor: '#444' }} />
                    <h4>Lista de Pontos</h4>
                    {points.length === 0 && <p style={{ fontSize: 12 }}>Nenhum ponto criado.</p>}
                    <ul
                        style={{
                            listStyle: 'none',
                            paddingLeft: 0,
                            maxHeight: 150, // Or adjust as needed
                            overflowY: 'auto',
                            fontSize: 14,
                            margin: 0,
                        }}
                    >
                        {points.map((point) => (
                            <li
                                key={point.id}
                                style={{
                                    padding: '6px 8px',
                                    marginBottom: 6,
                                    backgroundColor: selectedId === point.id ? '#2e8b57' : 'rgba(255,255,255,0.1)',
                                    borderRadius: 5,
                                    userSelect: 'none',
                                    display: 'flex', // For aligning text and button
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'background-color 0.2s ease',
                                }}
                                onMouseEnter={(e) => { if (selectedId !== point.id) (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'); }}
                                onMouseLeave={(e) => { if (selectedId !== point.id) (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'); }}
                            >
                                <span 
                                    onClick={() => onSelectPoint(point.id)} 
                                    style={{ cursor: 'pointer', flexGrow: 1 }}
                                    title={`Selecionar Ponto ${point.id}`}
                                >
                                    Ponto {point.id}
                                    <br />
                                    <span style={{fontSize: '0.8em'}}>
                                        X: {point.position[0].toFixed(1)}, Y: {point.position[1].toFixed(1)}, Z: {point.position[2].toFixed(1)}
                                    </span>
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent li's onClick
                                        onDeletePoint(point.id);
                                    }}
                                    title={`Excluir Ponto ${point.id}`}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ff8c8c', // Softer red
                                        cursor: 'pointer',
                                        padding: '0 0 0 8px', // Add some padding to the left
                                        fontSize: '18px', // Icon size
                                        lineHeight: '1', // Align icon better
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ff0000'} // Brighter red on hover
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#ff8c8c'}
                                >
                                    🗑️
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* Other tabs (ajuda, config, avancado) remain the same */}
            {tab === 'ajuda' && (
                <>
                    <h4>Controles da Câmera</h4>
                    <ul style={{ paddingLeft: 15, fontSize: '14px', marginTop: 0, lineHeight: '1.6' }}>
                        <li><b>W/A/S/D:</b> Mover câmera (frente/esquerda/trás/direita)</li>
                        <li><b>Mouse (arrastar):</b> Orbitar ao redor do centro</li>
                        <li><b>Scroll do Mouse:</b> Zoom in/out</li>
                    </ul>
                    <h4>Controles dos Pontos</h4>
                     <ul style={{ paddingLeft: 15, fontSize: '14px', marginTop: 0, lineHeight: '1.6' }}>
                        <li><b>Clique no Ponto:</b> Selecionar</li>
                        <li><b>Arrastar Gizmo:</b> Mover ponto selecionado (gizmo aparece no ponto)</li>
                        <li><b>Clique no Canvas:</b> Desselecionar ponto</li>
                        <li><b>Ícone 🗑️:</b> Excluir ponto</li>
                    </ul>
                </>
            )}

            {tab === 'config' && (
                <>
                    <h4>Configurações Visuais</h4>
                    <div style={{ fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <label htmlFor="toggle-grass">Grama:</label>
                        <label className="switch">
                            <input
                                id="toggle-grass"
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
                    <h4>Ações Avançadas</h4>
                    <button onClick={onGeneratePath} style={buttonStyle}>
                        Gerar/Atualizar Caminho Otimizado
                    </button>
                    <p style={{ fontSize: 12, marginTop: '10px' }}>
                        Calcula a rota mais curta visitando todos os pontos. O caminho é atualizado automaticamente ao adicionar/mover/excluir pontos se já estiver visível.
                    </p>
                </>
            )}
        </div>
    );
}

function getTabStyle(active: boolean): React.CSSProperties {
    return {
        background: active ? '#2e8b57' : 'transparent',
        border: '1px solid ' + (active ? '#2e8b57' : '#555'),
        color: '#fff',
        fontSize: 18, 
        cursor: 'pointer',
        padding: '5px 8px',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
    };
}