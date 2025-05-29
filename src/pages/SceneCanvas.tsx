// src/pages/SceneCanvas.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, TransformControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import Grass from '../components/environment/grass/grass';
import { loadWindTurbines } from '../components/wind-turbine/useWindTurbines';
import Interface from '../components/Interface/Interface';
import PointComponent from '../components/Point';

import { findNearestNeighborPath, PathPoint } from '../utils/pathfiding';

import { useWindFarm } from '../context/WindFarmContext';

const PLANE_SIZE = 250;
const MIN_CAMERA_HEIGHT = 1.5;
const CAMERA_SPEED = 0.2;

// GroundPlane, WindTurbines, CameraController (sem alterações relevantes para o bug)
function GroundPlane() {
  const texture = useThree(({ gl }) => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/src/assets/grassTexture.png'); 
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(PLANE_SIZE / 10, PLANE_SIZE / 10);
    return tex;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function WindTurbines() {
  const [turbines, setTurbines] = useState<THREE.Object3D[]>([]);
  useEffect(() => { loadWindTurbines().then(setTurbines); }, []);
  return <>{turbines.map((obj, i) => (<primitive key={i} object={obj} />))}</>;
}

function CameraController() {
  const { camera } = useThree();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const prevPos = useRef(camera.position.clone());

  useEffect(() => {
    const onKey = (e: KeyboardEvent, value: boolean) => {
      switch (e.key.toLowerCase()) {
        case 'w': moveState.current.forward = value; break;
        case 'a': moveState.current.left = value; break;
        case 's': moveState.current.backward = value; break;
        case 'd': moveState.current.right = value; break;
      }
    };
    const onKeyDown = (e: KeyboardEvent) => onKey(e, true);
    const onKeyUp = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame(() => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction).setY(0).normalize();
    const sideDirection = new THREE.Vector3().crossVectors(camera.up, direction).normalize();

    if (moveState.current.forward) camera.position.addScaledVector(direction, CAMERA_SPEED);
    if (moveState.current.backward) camera.position.addScaledVector(direction, -CAMERA_SPEED);
    if (moveState.current.left) camera.position.addScaledVector(sideDirection, CAMERA_SPEED);
    if (moveState.current.right) camera.position.addScaledVector(sideDirection, -CAMERA_SPEED);

    if (camera.position.y < MIN_CAMERA_HEIGHT) camera.position.y = MIN_CAMERA_HEIGHT;
    const halfPlane = PLANE_SIZE / 2;
    camera.position.x = Math.max(-halfPlane, Math.min(halfPlane, camera.position.x));
    camera.position.z = Math.max(-halfPlane, Math.min(halfPlane, camera.position.z));
    prevPos.current.copy(camera.position);
  });
  return null;
}

type Point = PathPoint;

export default function SceneCanvas() {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const { turbinesPositions, setTurbinesPositions } = useWindFarm();
  const [grassEnabled, setGrassEnabled] = useState(true);

  const [points, setPoints] = useState<Point[]>([]);
  const [generatedPath, setGeneratedPath] = useState<Point[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const transformControlsRef = useRef<any>(null);

  // Ref para rastrear se o carregamento inicial do contexto já ocorreu
  const initialLoadDone = useRef(false);

  useEffect(() => {
    // Este useEffect agora só roda para o carregamento inicial a partir do contexto
    // ou se turbinesPositions for explicitamente zerado (novo upload vazio).
    if (!initialLoadDone.current || (turbinesPositions && turbinesPositions.length === 0 && points.length > 0)) {
      if (turbinesPositions && turbinesPositions.length > 0) {
        console.log("Context: Loading points from turbinesPositions (initial load / reset)");
        const initialPoints = turbinesPositions.map((pos, idx) => ({
          id: `tp-${idx + 1}-${Date.now()}`, // IDs mais únicos para evitar colisões
          position: pos,
        }));
        setPoints(initialPoints);
        // if (initialPoints.length >= 2) {
        //   setGeneratedPath(findNearestNeighborPath(initialPoints));
        // } else {
        //   setGeneratedPath([]);
        // } // if (initialPoints.length >= 2) {
        //   setGeneratedPath(findNearestNeighborPath(initialPoints));
        // } else {
        //   setGeneratedPath([]);
        // }
      } else {
        // Se turbinesPositions estiver vazio, limpa os pontos locais
        // setPoints([]);
        // setGeneratedPath([]);
      }
      if (turbinesPositions && turbinesPositions.length > 0) {
        initialLoadDone.current = true;
      }
      // Se turbinesPositions for zerado, permite recarregar na próxima vez que for populado
      if (turbinesPositions && turbinesPositions.length === 0) {
         initialLoadDone.current = false;
      }
    }
  }, [turbinesPositions]); // Dependência mantida, mas lógica interna alterada

  const updateContextAndPath = (updatedPoints: Point[]) => {
    setTurbinesPositions(updatedPoints.map(p => p.position));
    if (updatedPoints.length >= 2) {
      setGeneratedPath(findNearestNeighborPath(updatedPoints));
    } else {
      setGeneratedPath([]);
    }
  };

  const handlePointChange = (id: string, newPos: [number, number, number]) => {
    const newPointsList = points.map(p => (p.id === id ? { ...p, position: newPos } : p));
    setPoints(newPointsList);
    // updateContextAndPath(newPointsList);
  };

  const handleAddPoint = () => {
    const camera = cameraRef.current;
    if (!camera) return;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const newPosVec = camera.position.clone().add(dir.multiplyScalar(5));
    const newPosition: [number, number, number] = [newPosVec.x, newPosVec.y, newPosVec.z];
    
    // Gera ID único baseado no maior ID numérico existente ou timestamp
    const existingIds = points.map(p => parseInt(p.id.split('-').pop() || '0', 10)).filter(num => !isNaN(num));
    const maxIdNum = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const newId = `pt-${maxIdNum + 1}-${Date.now()}`;

    const newPointsList = [...points, { id: newId, position: newPosition }];
    setPoints(newPointsList);
    // updateContextAndPath(newPointsList);
  };

  const handleGeneratePath = () => {
    if (points.length < 2) {
      setGeneratedPath([]);
      return;
    }
    const bestPath = findNearestNeighborPath(points);
    setGeneratedPath(bestPath);
  };

  const handleDeletePoint = (idToDelete: string) => {
    console.log("Attempting to delete point ID:", idToDelete);
    console.log("Points before deletion:", JSON.parse(JSON.stringify(points)));

    const newPointsList = points.filter(p => p.id !== idToDelete);
    
    console.log("Points after filtering:", JSON.parse(JSON.stringify(newPointsList)));
    console.log("Point was (or should have been) filtered out:", points.length !== newPointsList.length);

    setPoints(newPointsList); // Atualiza o estado local 'points'

    if (selectedId === idToDelete) {
      setSelectedId(null);
    }
    // Atualiza o contexto e o caminho gerado com base na newPointsList
    updateContextAndPath(newPointsList);
    initialLoadDone.current = true; // Marca que a interação do usuário ocorreu, para o useEffect não sobrescrever
  };

  useEffect(() => {
    const controls = transformControlsRef.current;
    if (!controls) return;
    if (!selectedId && controls.object) {
      controls.detach();
      setOrbitEnabled(true);
    }
  }, [selectedId, transformControlsRef]);
  
  useEffect(() => {
    // Limpa o caminho se houver menos de 2 pontos (apenas como segurança extra)
    // if (points.length < 2 && generatedPath.length > 0) {
    //   setGeneratedPath([]);
    // }
  }, [points, generatedPath]);


  return (
    <>
      <Interface
        onAddPoint={handleAddPoint}
        points={points}
        selectedId={selectedId}
        onSelectPoint={setSelectedId}
        grassEnabled={grassEnabled}
        setGrassEnabled={setGrassEnabled}
        onGeneratePath={handleGeneratePath}
        onDeletePoint={handleDeletePoint}
      />

      <Canvas
        shadows
        camera={{ position: [0, 10, 20], fov: 75, near: 0.1, far: 1000 }}
        style={{ width: '100vw', height: '100vh' }}
        onCreated={({ camera }) => { if (camera instanceof THREE.PerspectiveCamera) cameraRef.current = camera; }}
        onClick={() => { if (selectedId) setSelectedId(null); }}
      >
        {points.map((p) => (
          <PointComponent
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

        <TransformControls ref={transformControlsRef} />

        {generatedPath.length >= 2 && (
          <Line points={generatedPath.map(p => p.position)} color="blue" lineWidth={3} />
        )}

        <Sky distance={450000} sunPosition={[100, 50, 100]} inclination={0.49} azimuth={0.25} />
        <ambientLight intensity={Math.PI / 2} />
        <hemisphereLight skyColor={0xddddff} groundColor={0x88bb88} intensity={0.5} />
        <directionalLight
            position={[10, 20, 10]} intensity={1.5} castShadow
            shadow-mapSize-width={2048} shadow-mapSize-height={2048}
            shadow-camera-far={50} shadow-camera-left={-PLANE_SIZE/2}
            shadow-camera-right={PLANE_SIZE/2} shadow-camera-top={PLANE_SIZE/2}
            shadow-camera-bottom={-PLANE_SIZE/2}
        />
        <GroundPlane />
        {grassEnabled && (
          <Grass instanceCount={100000} width={PLANE_SIZE} height={0.6} windSpeed={1.3} color="#7fc56b" position={[0, 0.01, 0]} />
        )}
        <WindTurbines />
        <OrbitControls enablePan={true} enabled={orbitEnabled} target={[0, MIN_CAMERA_HEIGHT, 0]} />
        <CameraController />
      </Canvas>
    </>
  );
}