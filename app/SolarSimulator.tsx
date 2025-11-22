'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sky, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface SolarPanelProps {
  azimuth: number
  elevation: number
  efficiency: number
}

function SolarPanel({ azimuth, elevation, efficiency }: SolarPanelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const panelRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = (azimuth * Math.PI) / 180
    }
    if (panelRef.current) {
      panelRef.current.rotation.x = -(elevation * Math.PI) / 180
    }
  })

  const panelColor = useMemo(() => {
    const r = 1 - efficiency / 100
    const g = efficiency / 100
    return new THREE.Color(r * 0.2, g * 0.8 + 0.2, 0.3)
  }, [efficiency])

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Base du support */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1, 16]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Poteau vertical */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
        <meshStandardMaterial color="#34495e" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Support horizontal pour azimuth */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Bras du panneau */}
      <group ref={panelRef} position={[0, 1.5, 0]}>
        <mesh position={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
          <meshStandardMaterial color="#95a5a6" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Panneau solaire */}
        <mesh position={[0, 0, 1.2]}>
          <boxGeometry args={[2.5, 0.1, 1.8]} />
          <meshStandardMaterial
            color={panelColor}
            metalness={0.9}
            roughness={0.1}
            emissive={panelColor}
            emissiveIntensity={efficiency / 200}
          />
        </mesh>

        {/* Grille de cellules solaires */}
        {Array.from({ length: 6 }).map((_, i) =>
          Array.from({ length: 8 }).map((_, j) => (
            <mesh key={`${i}-${j}`} position={[-1.1 + i * 0.45, 0.06, 0.3 + j * 0.21]}>
              <boxGeometry args={[0.4, 0.02, 0.18]} />
              <meshStandardMaterial
                color="#1a1a3a"
                metalness={0.95}
                roughness={0.05}
                emissive={new THREE.Color(0.1, 0.2, 0.8)}
                emissiveIntensity={efficiency / 300}
              />
            </mesh>
          ))
        )}

        {/* Cadre du panneau */}
        <mesh position={[0, 0, 1.2]}>
          <boxGeometry args={[2.6, 0.12, 1.9]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Indicateur d'orientation */}
      <mesh position={[0, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial color="#e67e22" emissive="#e67e22" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

interface SunProps {
  azimuth: number
  elevation: number
}

function Sun({ azimuth, elevation }: SunProps) {
  const sunRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.DirectionalLight>(null)

  useFrame(() => {
    if (sunRef.current && lightRef.current) {
      const azimuthRad = (azimuth * Math.PI) / 180
      const elevationRad = (elevation * Math.PI) / 180

      const distance = 50
      const x = distance * Math.cos(elevationRad) * Math.sin(azimuthRad)
      const y = distance * Math.sin(elevationRad)
      const z = distance * Math.cos(elevationRad) * Math.cos(azimuthRad)

      sunRef.current.position.set(x, y, z)
      lightRef.current.position.set(x, y, z)
      lightRef.current.target.position.set(0, 0, 0)
      lightRef.current.target.updateMatrixWorld()
    }
  })

  const sunIntensity = Math.max(0, Math.sin((elevation * Math.PI) / 180))

  return (
    <>
      <mesh ref={sunRef}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>
      <directionalLight
        ref={lightRef}
        intensity={sunIntensity * 3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
    </>
  )
}

function Ground() {
  return (
    <>
      {/* Sol principal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2d5016" roughness={0.8} />
      </mesh>

      {/* Grille de repérage */}
      <gridHelper args={[50, 50, '#ffffff', '#444444']} position={[0, -0.99, 0]} />

      {/* Cercles de référence pour azimuth */}
      {[5, 10, 15].map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.98, 0]}>
          <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
          <meshBasicMaterial color="#ffa500" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Axes directionnels */}
      <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -0.9, 0), 8, '#ff0000']} />
      <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -0.9, 0), 8, '#0000ff']} />

      {/* Marqueurs cardinaux */}
      {[
        { pos: [0, 0, 12], label: 'N' },
        { pos: [12, 0, 0], label: 'E' },
        { pos: [0, 0, -12], label: 'S' },
        { pos: [-12, 0, 0], label: 'O' },
      ].map(({ pos, label }) => (
        <mesh key={label} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </>
  )
}

interface SolarSimulatorProps {
  sunAzimuth: number
  sunElevation: number
  panelAzimuth: number
  panelElevation: number
  efficiency: number
}

export default function SolarSimulator({
  sunAzimuth,
  sunElevation,
  panelAzimuth,
  panelElevation,
  efficiency,
}: SolarSimulatorProps) {
  const skyInclination = useMemo(() => {
    return Math.max(0, sunElevation) / 90
  }, [sunElevation])

  const skyAzimuth = useMemo(() => {
    return ((sunAzimuth - 180) * Math.PI) / 180
  }, [sunAzimuth])

  return (
    <Canvas
      shadows
      camera={{ position: [10, 8, 10], fov: 60 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={['#87ceeb']} />

      <Sky
        sunPosition={[
          Math.cos(skyAzimuth) * Math.cos(skyInclination * Math.PI / 2) * 100,
          Math.sin(skyInclination * Math.PI / 2) * 100,
          Math.sin(skyAzimuth) * Math.cos(skyInclination * Math.PI / 2) * 100
        ]}
        turbidity={8}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      <ambientLight intensity={0.4} />
      <hemisphereLight intensity={0.3} color="#ffffff" groundColor="#444444" />

      <Sun azimuth={sunAzimuth} elevation={sunElevation} />
      <SolarPanel azimuth={panelAzimuth} elevation={panelElevation} efficiency={efficiency} />
      <Ground />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />

      <Environment preset="sunset" />
    </Canvas>
  )
}
