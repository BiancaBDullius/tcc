import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import windFarmData from '../../assets/data/windfarm.json';

export async function loadWindTurbines(): Promise<THREE.Object3D[]> {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync('/models/windTower.glb');

  return windFarmData.map((turbine) => {
    const clone = gltf.scene.clone();
  clone.position.set(
    turbine.position[0],
    turbine.position[1],
    turbine.position[2]
  ); 
    clone.scale.set(1, 1, 1);
    clone.name = `Turbine-${turbine.id}`;
    return clone;
  });
}
