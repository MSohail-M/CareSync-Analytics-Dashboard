'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  opacity?: number
}

export default function ThreeBackground({ opacity = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500)
    camera.position.z = 38

    // ── Nodes ──────────────────────────────────────
    const NODE_COUNT = 110
    const COLORS = [0x6366f1, 0x818cf8, 0x38bdf8, 0xa78bfa, 0x60a5fa, 0x34d399]
    const nodeGeo = new THREE.SphereGeometry(0.13, 8, 8)
    const nodeMaterials: THREE.MeshBasicMaterial[] = []
    const nodes: THREE.Mesh[] = []
    const positions: THREE.Vector3[] = []

    for (let i = 0; i < NODE_COUNT; i++) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: Math.random() * 0.5 + 0.2,
      })
      nodeMaterials.push(mat)
      const mesh = new THREE.Mesh(nodeGeo, mat)
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 75,
        (Math.random() - 0.5) * 55,
        (Math.random() - 0.5) * 45,
      )
      mesh.position.copy(pos)
      positions.push(pos)
      nodes.push(mesh)
      scene.add(mesh)
    }

    // ── Static connections ──────────────────────────
    const MAX_DIST = 11
    const lineGroup = new THREE.Group()
    scene.add(lineGroup)

    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const d = positions[i].distanceTo(positions[j])
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.22
          const mat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: alpha })
          const geo = new THREE.BufferGeometry().setFromPoints([positions[i].clone(), positions[j].clone()])
          lineGroup.add(new THREE.Line(geo, mat))
        }
      }
    }

    // ── Ambient glow spheres ────────────────────────
    const glowGeo = new THREE.SphereGeometry(6, 16, 16)
    const glow1 = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.04 }))
    const glow2 = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.025 }))
    glow1.position.set(-15, 8, 0)
    glow2.position.set(18, -10, -5)
    glow1.scale.setScalar(3)
    glow2.scale.setScalar(2.5)
    scene.add(glow1, glow2)

    // ── Animation ──────────────────────────────────
    let animFrame: number
    let t = 0

    function animate() {
      animFrame = requestAnimationFrame(animate)
      t += 0.006

      scene.rotation.y = t * 0.038
      scene.rotation.x = Math.sin(t * 0.025) * 0.06

      nodeMaterials.forEach((mat, i) => {
        mat.opacity = 0.18 + Math.sin(t * 1.8 + i * 0.5) * 0.15 + 0.15
      })

      glow1.position.x = -15 + Math.sin(t * 0.2) * 4
      glow1.position.y = 8 + Math.cos(t * 0.15) * 3
      glow2.position.x = 18 + Math.cos(t * 0.18) * 5
      glow2.position.y = -10 + Math.sin(t * 0.12) * 4

      renderer.render(scene, camera)
    }

    animate()

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity,
      }}
    />
  )
}
