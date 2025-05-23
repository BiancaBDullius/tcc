import { useFrame } from '@react-three/fiber';
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

type GrassProps = {
  instanceCount?: number;
  width?: number;
  height?: number;
  windSpeed?: number;
  color?: string;
  position?: [number, number, number];
};

export default function Grass({
  instanceCount = 5000,
  width = 10,
  height = 1,
  windSpeed = 1,
  color = '#69ff5d',
  position = [0, 0, 0]
}: GrassProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const clockRef = useRef(new THREE.Clock());

  const uniforms = useRef({
    time: { value: 0 },
    windSpeed: { value: windSpeed },
    baseColor: { value: new THREE.Color(color) }
  });

  // Atualiza windSpeed se mudar (opcional)
  useEffect(() => {
    uniforms.current.windSpeed.value = windSpeed;
  }, [windSpeed]);

  // Atualiza baseColor se mudar (opcional)
  useEffect(() => {
    uniforms.current.baseColor.value.set(color);
  }, [color]);

  // Inicializa posições e matrizes das instâncias
  useEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < instanceCount; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * width,
        0,
        (Math.random() - 0.5) * width
      );
      dummy.scale.setScalar(0.5 + Math.random() * 0.5);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [instanceCount, width]);

  // Atualiza o tempo do shader a cada frame
  useFrame(() => {
    uniforms.current.time.value = clockRef.current.getElapsedTime();
  });

  // Geometria para uma folha de grama
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.1, height, 1, 4);
    geo.translate(0, height / 2, 0);
    return geo;
  }, [height]);

  // Material customizado com shaders
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      uniform float time;
      uniform float windSpeed;

      void main() {
        vUv = uv;
        vec4 mvPosition = vec4(position, 1.0);
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif

        float dispPower = 1.0 - cos(uv.y * 3.1416 / 2.0);
        float displacement = sin(mvPosition.z + time * 10.0 * windSpeed) * (0.1 * dispPower);
        mvPosition.z += displacement;

        vec4 modelViewPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * modelViewPosition;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 baseColor;

      void main() {
        float clarity = (vUv.y * 0.5) + 0.5;
        gl_FragColor = vec4(baseColor * clarity, 1.0);
      }
    `,
    uniforms: uniforms.current,
    side: THREE.DoubleSide,
  }), []);

  useEffect(() => {
    console.log('Grass component mounted');
  }, []);

  return (
    <group position={position}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, instanceCount]}
      />
    </group>
  );
}
