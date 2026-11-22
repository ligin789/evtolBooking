import { AdaptiveDpr, Environment, Lightformer, OrbitControls, PerformanceMonitor, Sky } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DEFAULT_AIRCRAFT_ID } from '../config/aircraft';
import { useIsMobile, useReducedMotion } from '../hooks/useReducedMotion';
import { useBooking } from '../store/bookingStore';
import { useExperience } from '../store/experienceStore';
import { CameraDirector } from './CameraDirector';
import { CityEnvironment, CloudLayer } from './CityEnvironment';
import { EVTOLModel } from './EVTOLModel';

const SUN = new THREE.Vector3(0.55, 0.3, 0.78).normalize();

/**
 * Root 3D scene: golden-hour sky, coastal city, cloud layer and the eVTOL.
 * Rendered once behind every route so transitions never cut.
 */
export default function EVTOLScene() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [dpr, setDpr] = useState<[number, number]>([1, isMobile ? 1.5 : 1.75]);
  const setHovered = useExperience((s) => s.setHoveredSeat);

  return (
    <Canvas
      shadows
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [11.5, 3.4, 15.5], fov: 36, near: 0.05, far: 6000 }}
      onPointerMissed={() => setHovered(null)}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.85;
      }}
      aria-label="Interactive 3D view of the AERIS eVTOL air taxi"
    >
      <PerformanceMonitor onDecline={() => setDpr([1, 1])} onIncline={() => setDpr([1, isMobile ? 1.5 : 1.75])} />
      <AdaptiveDpr />
      <fog attach="fog" args={['#d3dde3', 90, 820]} />
      <Sky distance={4500} sunPosition={SUN.clone().multiplyScalar(100).toArray()} turbidity={3.2} rayleigh={2.2} mieCoefficient={0.005} mieDirectionalG={0.88} />
      <Environment resolution={256} frames={1} environmentIntensity={0.85}>
        <Sky distance={4500} sunPosition={SUN.clone().multiplyScalar(100).toArray()} turbidity={3.2} rayleigh={2.2} mieCoefficient={0.005} mieDirectionalG={0.88} />
        <Lightformer form="rect" intensity={2.4} color="#fff1dc" position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[20, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#d8e4ff" position={[10, 2, 6]} scale={[10, 3, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#ffd9a8" position={[-9, 3, -6]} scale={4} />
      </Environment>

      <hemisphereLight args={['#fdf3e4', '#5e5146', 0.65]} />
      <directionalLight
        castShadow
        position={SUN.clone().multiplyScalar(30).toArray()}
        intensity={2.6}
        color="#ffe0b6"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={70}
      />
      <directionalLight position={[8, 4, 10]} intensity={0.55} color="#dfe8ff" />

      <Suspense fallback={null}>
        <CloudLayer reducedMotion={reducedMotion} />
      </Suspense>
      <CityEnvironment reducedMotion={reducedMotion} />
      <AircraftRig reducedMotion={reducedMotion} />

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} enablePan={false} />
      <CameraDirector reducedMotion={reducedMotion} isMobile={isMobile} />
      <ReadySignal />
    </Canvas>
  );
}

/** Marks the scene ready after a couple of rendered frames (shaders compiled). */
function ReadySignal() {
  const frames = useRef(0);
  const setReady = useExperience((s) => s.setSceneReady);
  useFrame(() => {
    frames.current++;
    if (frames.current === 3) setReady(true);
  });
  return null;
}

/** Positions the aircraft: cinematic entrance, idle hover motion and the departure climb. */
function AircraftRig({ reducedMotion }: { reducedMotion: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const bob = useRef<THREE.Group>(null);
  const amp = useRef(1);
  const stage = useExperience((s) => s.stage);
  const sceneReady = useExperience((s) => s.sceneReady);
  const aircraftId = useBooking((s) => s.flight?.aircraftId ?? DEFAULT_AIRCRAFT_ID);
  const invalidate = useThree((s) => s.invalidate);

  // entrance
  useEffect(() => {
    const g = rig.current;
    if (!g || stage !== 'intro' || !sceneReady) return;
    if (reducedMotion) {
      g.position.set(0, 0, 0);
      useExperience.getState().setStage('hero');
      return;
    }
    g.position.set(-14, -7, -95);
    g.rotation.set(0.05, 0.18, 0.32);
    const tl = gsap.timeline({ onComplete: () => useExperience.getState().setStage('hero') });
    tl.to(g.position, { x: 0, y: 0, z: 0, duration: 4.2, ease: 'power3.out' }, 0);
    tl.to(g.rotation, { x: 0, y: 0, z: 0, duration: 4.6, ease: 'power2.out' }, 0);
    return () => void tl.kill();
  }, [stage, sceneReady, reducedMotion]);

  // departure climb / return
  useEffect(() => {
    const g = rig.current;
    if (!g || stage === 'intro') return;
    if (stage === 'departure') {
      const tl = gsap.timeline({ delay: reducedMotion ? 0 : 1.2 });
      tl.to(g.position, { y: 2.2, duration: reducedMotion ? 0.01 : 2.2, ease: 'power2.inOut' });
      tl.to(g.rotation, { x: -0.08, duration: reducedMotion ? 0.01 : 1.6, ease: 'power2.inOut' }, '<0.6');
      tl.to(g.position, { z: 60, y: 18, duration: reducedMotion ? 0.01 : 7, ease: 'power2.in' }, '>-0.4');
      return () => void tl.kill();
    }
    const t = gsap.to(g.position, { x: 0, y: 0, z: 0, duration: reducedMotion ? 0.01 : 1.6, ease: 'power3.out' });
    const r = gsap.to(g.rotation, { x: 0, y: 0, z: 0, duration: reducedMotion ? 0.01 : 1.6, ease: 'power3.out' });
    return () => {
      t.kill();
      r.kill();
    };
  }, [stage, reducedMotion]);

  useFrame(({ clock }, dt) => {
    const st = useExperience.getState().stage;
    const target = st === 'cabin' || st === 'seat' || reducedMotion ? 0 : st === 'route' ? 0.5 : 1;
    amp.current += (target - amp.current) * Math.min(1, dt * 2);
    const t = clock.elapsedTime;
    if (bob.current) {
      bob.current.position.y = Math.sin(t * 0.9) * 0.12 * amp.current;
      bob.current.rotation.z = Math.sin(t * 0.55) * 0.03 * amp.current;
      bob.current.rotation.x = Math.sin(t * 0.7 + 1) * 0.012 * amp.current;
    }
    invalidate();
  });

  return (
    <group ref={rig}>
      <group ref={bob}>
        <EVTOLModel key={aircraftId} aircraftId={aircraftId} reducedMotion={reducedMotion} />
      </group>
    </group>
  );
}
