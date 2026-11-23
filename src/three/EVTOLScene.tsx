import { OrbitControls, PerformanceMonitor } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DEFAULT_AIRCRAFT_ID } from '../config/aircraft';
import { useIsMobile, useReducedMotion } from '../hooks/useReducedMotion';
import { useBooking } from '../store/bookingStore';
import { useExperience } from '../store/experienceStore';
import { CameraDirector } from './CameraDirector';
import { EVTOLModel } from './EVTOLModel';
import { HAZE_COLOR, SUN_DIR, SunSky } from './SunSky';
import { CityEnvironment } from './CityEnvironment';

/** Key light comes from the visible sun, raised a little so the airframe gets top light. */
const KEY_LIGHT = new THREE.Vector3(SUN_DIR.x, 0.22, SUN_DIR.z).normalize();

/**
 * Root 3D scene: golden-hour sky, coastal city and the eVTOL.
 * Rendered once behind every route so transitions never cut.
 */
export default function EVTOLScene() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  // Pixel budget: big retina screens would otherwise render 6–7 MP per frame
  // (×4 with MSAA). ~2.4 MP stays sharp while leaving GPU headroom for 60 fps.
  const budgetDpr = usePixelBudgetDpr(isMobile ? 1.6e6 : 2.4e6, isMobile ? 1.5 : 2);
  // Quality factor from the PerformanceMonitor: steps down when frames drop and
  // locks in after repeated flip-flops (each change reallocates the drawing buffer).
  const [quality, setQuality] = useState(1);
  const dpr = Math.max(1, Math.round(budgetDpr * (0.6 + 0.4 * quality) * 100) / 100);
  const setHovered = useExperience((s) => s.setHoveredSeat);
  const heroInView = useExperience((s) => s.heroInView);

  return (
    <Canvas
      frameloop={heroInView ? 'always' : 'never'}
      shadows
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      // near plane is adjusted per shot by CameraDirector (tiny only inside the cabin) to keep depth precision
      camera={{ position: [11.5, 3.4, 15.5], fov: 36, near: 0.5, far: 5000 }}
      onPointerMissed={() => setHovered(null)}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.72;
      }}
      aria-label="Interactive 3D view of the VIBE eVTOL air taxi"
    >
      <PerformanceMonitor
        factor={1}
        flipflops={3}
        onChange={({ factor }) => setQuality(Math.round(factor * 4) / 4)}
        onFallback={() => setQuality(0)}
      />
      <fog attach="fog" args={[HAZE_COLOR, 600, 4200]} />
      <SunSky />

      <hemisphereLight args={['#a9b3e0', '#4a372f', 0.7]} />
      <directionalLight
        castShadow
        position={KEY_LIGHT.clone().multiplyScalar(30).toArray()}
        intensity={2.6}
        color="#ffb27a"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={70}
      />
      {/* cool sky fill from the side away from the sun */}
      <directionalLight position={[8, 5, 10]} intensity={0.7} color="#dfe8ff" />

      <CityEnvironment reducedMotion={reducedMotion} />
      <AircraftRig reducedMotion={reducedMotion} />

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} enablePan={false} />
      <CameraDirector reducedMotion={reducedMotion} isMobile={isMobile} />
      <ReadySignal />
    </Canvas>
  );
}

/** Device pixel ratio that keeps the canvas within a pixel budget (recomputed on resize). */
function usePixelBudgetDpr(budget: number, cap: number) {
  const calc = () => {
    const px = window.innerWidth * window.innerHeight;
    const ideal = Math.sqrt(budget / Math.max(1, px));
    return Math.max(1, Math.min(window.devicePixelRatio || 1, cap, Math.round(ideal * 100) / 100));
  };
  const [dpr, setDpr] = useState(calc);
  useEffect(() => {
    const onResize = () => setDpr(calc());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return dpr;
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
  });

  return (
    <group ref={rig}>
      <group ref={bob}>
        <EVTOLModel key={aircraftId} aircraftId={aircraftId} reducedMotion={reducedMotion} />
      </group>
    </group>
  );
}
