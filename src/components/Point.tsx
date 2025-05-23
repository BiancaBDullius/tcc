import React, { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { TransformControls } from '@react-three/drei'
import * as THREE from 'three'

interface PointProps {
  id: string
  position: [number, number, number]
  selected: boolean
  onSelect: (id: string) => void
  onChange: (id: string, pos: [number, number, number]) => void
  setOrbitEnabled: (enabled: boolean) => void
  transformControlsRef: React.RefObject<any> // controle único compartilhado
}

export default function Point({
  id,
  position,
  selected,
  onSelect,
  onChange,
  setOrbitEnabled,
  transformControlsRef,
}: PointProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  // Quando o ponto é selecionado, attach o TransformControls nesse mesh
  useEffect(() => {
    const controls = transformControlsRef.current
    const mesh = meshRef.current
    if (!controls || !mesh) return

    if (selected) {
      controls.attach(mesh)
      controls.enabled = true
      setOrbitEnabled(false)
    } else {
      // Só detach se o controle estiver anexado a esse mesh
      if (controls.object === mesh) {
        controls.detach()
      }
      setOrbitEnabled(true)
    }
  }, [selected, setOrbitEnabled, transformControlsRef])

  // Atualizar posição do estado quando a transformação mudar
  useEffect(() => {
    const controls = transformControlsRef.current
    if (!controls) return

    function onChangeHandler() {
      if (meshRef.current) {
        const p = meshRef.current.position
        onChange(id, [p.x, p.y, p.z])
      }
    }
    controls.addEventListener('objectChange', onChangeHandler)
    controls.addEventListener('dragging-changed', (event: any) => {
      setOrbitEnabled(!event.value)
    })

    return () => {
      controls.removeEventListener('objectChange', onChangeHandler)
    }
  }, [id, onChange, setOrbitEnabled, transformControlsRef])

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(id)
      }}
    >
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color={selected ? 'red' : 'orange'} />
    </mesh>
  )
}
