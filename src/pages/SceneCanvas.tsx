// src/components/SceneCanvas.tsx
import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sky, TransformControls } from '@react-three/drei'
import * as THREE from 'three'
import Grass from '../components/environment/grass/grass'
import { loadWindTurbines } from '../components/wind-turbine/useWindTurbines'
import Interface from '../components/Interface/Interface'
import Point from '../components/Point'

// Importa seu contexto para obter e atualizar posições
import { useWindFarm } from '../context/WindFarmContext'

const PLANE_SIZE = 250
const MIN_CAMERA_HEIGHT = 1.5
const CAMERA_SPEED = 0.2

// ... (GroundPlane, WindTurbines, CameraController permanecem iguais)

function GroundPlane() {
  const texture = useThree(({ gl }) => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load('src/assets/grassTexture.png')
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(PLANE_SIZE / 10, PLANE_SIZE / 10)
    return tex
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  )
}

function WindTurbines() {
  const [turbines, setTurbines] = useState<THREE.Object3D[]>([])

  useEffect(() => {
    loadWindTurbines().then((objs) => {
      setTurbines(objs)
    })
  }, [])

  return (
    <>
      {turbines.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </>
  )
}

function CameraController() {
  const { camera } = useThree()
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })
  const prevPos = useRef(camera.position.clone())
  const planePos = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          moveState.current.forward = true
          break
        case 'a':
          moveState.current.left = true
          break
        case 's':
          moveState.current.backward = true
          break
        case 'd':
          moveState.current.right = true
          break
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          moveState.current.forward = false
          break
        case 'a':
          moveState.current.left = false
          break
        case 's':
          moveState.current.backward = false
          break
        case 'd':
          moveState.current.right = false
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame(() => {
    const direction = new THREE.Vector3()
    const sideDirection = new THREE.Vector3()

    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()

    sideDirection.crossVectors(camera.up, direction).normalize()

    if (moveState.current.forward) camera.position.addScaledVector(direction, CAMERA_SPEED)
    if (moveState.current.backward) camera.position.addScaledVector(direction, -CAMERA_SPEED)
    if (moveState.current.left) camera.position.addScaledVector(sideDirection, CAMERA_SPEED)
    if (moveState.current.right) camera.position.addScaledVector(sideDirection, -CAMERA_SPEED)

    if (camera.position.y < MIN_CAMERA_HEIGHT) camera.position.y = MIN_CAMERA_HEIGHT

    const halfPlane = PLANE_SIZE / 2
    camera.position.x = Math.min(Math.max(camera.position.x, -halfPlane), halfPlane)
    camera.position.z = Math.min(Math.max(camera.position.z, -halfPlane), halfPlane)

    const cameraMovement = new THREE.Vector3().subVectors(camera.position, prevPos.current)

    planePos.current.x -= cameraMovement.x
    planePos.current.z -= cameraMovement.z

    if (planePos.current.x > halfPlane) planePos.current.x -= PLANE_SIZE
    else if (planePos.current.x < -halfPlane) planePos.current.x += PLANE_SIZE
    if (planePos.current.z > halfPlane) planePos.current.z -= PLANE_SIZE
    else if (planePos.current.z < -halfPlane) planePos.current.z += PLANE_SIZE

    prevPos.current.copy(camera.position)
  })

  return null
}

export default function SceneCanvas() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const [orbitEnabled, setOrbitEnabled] = useState(true)
  const { turbinesPositions, setTurbinesPositions } = useWindFarm()
  const [grassEnabled, setGrassEnabled] = useState(true)


  // Cria o estado local de pontos a partir do contexto (assumindo que turbinesPositions é array de [x,y,z])
  const [points, setPoints] = useState<{ id: string; position: [number, number, number] }[]>([])

  // Inicializa os pontos ao montar e quando turbinesPositions mudam
  useEffect(() => {
    if (turbinesPositions && turbinesPositions.length) {
      setPoints(
        turbinesPositions.map((pos, idx) => ({
          id: String(idx + 1),
          position: pos,
        }))
      )
    }
  }, [turbinesPositions])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const transformControlsRef = useRef<any>(null)

  // Atualiza posição do ponto selecionado no estado local e no contexto global
  const handlePointChange = (id: string, newPos: [number, number, number]) => {
    setPoints((prev) => {
      const newPoints = prev.map((p) => (p.id === id ? { ...p, position: newPos } : p))
      // Atualiza no contexto as posições para persistir
      setTurbinesPositions(newPoints.map((p) => p.position))
      return newPoints
    })
  }

  // Adiciona ponto na frente da câmera, atualizando estado local e contexto global
  const handleAddPoint = () => {
    const camera = cameraRef.current
    if (!camera) return

    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    const newPos = camera.position.clone().add(dir.multiplyScalar(5))

    setPoints((prev) => {
      const newPoints = [
        ...prev,
        { id: String(prev.length + 1), position: [newPos.x, newPos.y, newPos.z] },
      ]
      setTurbinesPositions(newPoints.map((p) => p.position))
      return newPoints
    })
  }

  // Efeito para controlar o TransformControls e OrbitControls conforme seleção
  useEffect(() => {
    const controls = transformControlsRef.current
    if (!controls) return

    if (!selectedId) {
      controls.detach()
      setOrbitEnabled(true)
    }
  }, [selectedId])

  return (
    <>
      <Interface
        onAddPoint={handleAddPoint}
        points={points}
        selectedId={selectedId}
        onSelectPoint={setSelectedId}
        grassEnabled={grassEnabled}
        setGrassEnabled={setGrassEnabled}
      />


      <Canvas
        shadows
        camera={{ position: [0, 10, 20], fov: 75, near: 0.1, far: 1000 }}
        style={{ width: '100vw', height: '100vh' }}
        onCreated={({ camera }) => {
          cameraRef.current = camera
        }}
      >
        {points.map((p) => (
          <Point
            key={p.id}
            id={p.id}
            position={p.position}
            selected={selectedId === p.id}
            onSelect={setSelectedId}
            onChange={handlePointChange}
            setOrbitEnabled={setOrbitEnabled}
            transformControlsRef={transformControlsRef}
          />
        ))}

        <TransformControls
          ref={transformControlsRef}
          onMouseDown={() => setOrbitEnabled(false)}
          onMouseUp={() => setOrbitEnabled(true)}
          onObjectChange={() => {
            if (transformControlsRef.current?.object) {
              const obj = transformControlsRef.current.object
              const id = obj.userData.id
              if (id) {
                const pos = obj.position
                handlePointChange(id, [pos.x, pos.y, pos.z])
              }
            }
          }}
        />

        <Sky distance={450000} sunPosition={[100, 50, 100]} inclination={0.49} azimuth={0.25} />
        <ambientLight intensity={0.4} />
        <hemisphereLight skyColor={0xddddff} groundColor={0x88bb88} intensity={0.2} />
        <directionalLight position={[10, 20, 10]} intensity={0.3} />
        <GroundPlane />
        {grassEnabled && (
          <Grass
            instanceCount={100000 * 2}
            width={PLANE_SIZE}
            height={0.6}
            windSpeed={1.3}
            color="#7fc56b"
            position={[0, 0.02, 0]}
          />
        )}

        <WindTurbines />
        <OrbitControls enablePan={false} enabled={orbitEnabled} />
        <CameraController />
      </Canvas>
    </>
  )
}
