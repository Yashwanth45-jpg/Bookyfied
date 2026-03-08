"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import { useRef, useMemo } from "react"
import * as THREE from "three"

const TOTAL_PAGES = 4

// Map scroll progress [0,1] → rotation angle for a given page.
// Page i flips in the scroll range [(i+1)/5, (i+2)/5].
function getTargetAngle(index: number, scrollProgress: number): number {
  const flipStart = (index + 1) / 5
  const flipEnd   = (index + 2) / 5
  const t = Math.max(0, Math.min(1, (scrollProgress - flipStart) / (flipEnd - flipStart)))
  return t * Math.PI
}

// ─── Single scroll-driven page ───────────────────────────────────────────────
function BookPage({
  index,
  scrollProgress,
}: {
  index: number
  scrollProgress: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const targetAngle = getTargetAngle(index, scrollProgress)
  const zOffset = (TOTAL_PAGES - index) * 0.004

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetAngle,
      0.08,
    )
  })

  return (
    // All pages pivot at the spine (x = -1.5)
    <group ref={groupRef} position={[-1.5, 0, zOffset]}>
      <mesh position={[1.5, 0, 0]}>
        <planeGeometry args={[3, 4.2]} />
        <meshStandardMaterial
          color="#faf5ea"
          side={THREE.DoubleSide}
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>
    </group>
  )
}

// ─── Front cover – hinges open at the spine as scroll begins (range 0 → 0.2) ─
function BookCoverFront({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const coverT = Math.min(1, scrollProgress / 0.2)
  const targetAngle = coverT * Math.PI

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetAngle,
      0.07,
    )
  })

  return (
    // Pivot at spine edge (x = -1.5), cover extends 3 units to the right
    <group ref={groupRef} position={[-1.5, 0, 0.31]}>
      {/* Cover board */}
      <mesh position={[1.5, 0, 0]}>
        <boxGeometry args={[3.0, 4.24, 0.06]} />
        <meshStandardMaterial color="#0d1f3c" roughness={0.7} metalness={0.15} />
      </mesh>
      {/* Gold border */}
      <mesh position={[1.5, 0, 0.034]}>
        <boxGeometry args={[2.6, 3.8, 0.004]} />
        <meshStandardMaterial color="#c8a020" roughness={0.2} metalness={0.95} />
      </mesh>
      {/* Dark interior recess */}
      <mesh position={[1.5, 0, 0.036]}>
        <boxGeometry args={[2.44, 3.64, 0.003]} />
        <meshStandardMaterial color="#0d1f3c" roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  )
}

// ─── Static book body (back cover, spine, page block) ────────────────────────
function BookBody() {
  return (
    <group>
      {/* Back cover */}
      <mesh position={[0, 0, -0.28]}>
        <boxGeometry args={[3.08, 4.28, 0.06]} />
        <meshStandardMaterial color="#0a1628" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Page block */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.98, 4.18, 0.48]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.95} />
      </mesh>

      {/* Spine */}
      <mesh position={[-1.565, 0, 0]}>
        <boxGeometry args={[0.06, 4.28, 0.62]} />
        <meshStandardMaterial color="#070e1f" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ─── Floating dust particles ──────────────────────────────────────────────────
function FloatingParticles() {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(80 * 3)
    for (let i = 0; i < 80; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 8
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.04
    ref.current.rotation.x = clock.elapsedTime * 0.02
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#6699ff" size={0.025} opacity={0.55} transparent />
    </points>
  )
}

// ─── Master book group (gentle idle float + scroll tilt) ─────────────────────
function BookGroup({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    // Gentle idle float
    ref.current.position.y = Math.sin(t * 0.5) * 0.08
    ref.current.rotation.x = Math.sin(t * 0.28) * 0.03
    // Subtle extra Y-tilt driven by scroll (book turns slightly as pages flip)
    ref.current.rotation.y = Math.sin(t * 0.35) * 0.07 - 0.15 + scrollProgress * 0.15
  })

  return (
    <group ref={ref} position={[-0.5, 0, 0]}>
      <BookBody />
      <BookCoverFront scrollProgress={scrollProgress} />
      {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
        <BookPage key={i} index={i} scrollProgress={scrollProgress} />
      ))}
    </group>
  )
}

// ─── Exported Canvas wrapper ──────────────────────────────────────────────────
export default function BookCanvas({ scrollProgress }: { scrollProgress: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 42 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 6]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-5, 2, 3]} intensity={1.2} color="#3366ff" />
      <pointLight position={[3, -4, 3]} intensity={0.5} color="#ff9944" />

      <Stars radius={180} depth={70} count={4000} factor={4} saturation={0} fade speed={0.4} />
      <FloatingParticles />

      <BookGroup scrollProgress={scrollProgress} />
    </Canvas>
  )
}
