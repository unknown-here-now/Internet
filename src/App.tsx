import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HeroCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollProgress = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      radius: number; connections: number;
    }> = []
    const nodeCount = 35

    for (let i = 0; i < nodeCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 3 + 2,
        connections: 0
      })
    }

    let mouse = { x: width / 2, y: height / 2 }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    let animationId: number

    const animate = () => {
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, width, height)

      const scrollFactor = scrollProgress.current

      // Draw grid
      ctx.strokeStyle = `rgba(0, 255, 200, ${0.05 * scrollFactor})`
      ctx.lineWidth = 1
      const gridSize = 80
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Update particles
      particles.forEach(p => {
        p.x += p.vx * (1 + scrollFactor)
        p.y += p.vy * (1 + scrollFactor)

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Attract to mouse
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          p.vx += dx * 0.00005 * scrollFactor
          p.vy += dy * 0.00005 * scrollFactor
        }

        // Reset connections count
        p.connections = 0
      })

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 250) {
            const opacity = (1 - dist / 250) * 0.8
            const lineProgress = Math.min(1, scrollFactor * 2)
            
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${200 + scrollFactor * 50}, 255, ${200}, ${opacity * lineProgress})`
            ctx.lineWidth = 1 + p1.connections * 0.1
            ctx.moveTo(p1.x, p1.y)

            // Animated data packet
            if (scrollFactor > 0.2) {
              const t = Date.now() * 0.001 + i * 0.5
              const packetX = p1.x + (p2.x - p1.x) * ((t + scrollFactor) % 1)
              const packetY = p1.y + (p2.y - p1.y) * ((t + scrollFactor) % 1)
              
              ctx.lineTo(packetX, packetY)
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`
              ctx.lineWidth = 2
              ctx.stroke()
              
              ctx.beginPath()
              ctx.arc(packetX, packetY, 3, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
              ctx.fill()
            } else {
              ctx.lineTo(p2.x, p2.y)
              ctx.stroke()
            }

            p1.connections++
            p2.connections++
          }
        })
      })

      // Draw particles with glow
      particles.forEach(p => {
        // Glow effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4)
        gradient.addColorStop(0, `rgba(0, 255, 200, ${0.8 + scrollFactor * 0.2})`)
        gradient.addColorStop(1, 'rgba(0, 255, 200, 0)')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 255, 255, ${0.9 + scrollFactor * 0.1})`
        ctx.fill()
      })

      // Draw initial node at center with scroll-based expansion
      if (scrollFactor > 0) {
        pulseX = width / 2
        pulseY = height / 2
        
        for (let i = 0; i < 3; i++) {
          const pulseRadius = 50 + i * 30 + scrollFactor * 100
          const pulseOpacity = Math.max(0, (Math.sin(Date.now() * 0.005 + i) + 1) / 2 * 0.5 * scrollFactor)
          
          ctx.beginPath()
          ctx.arc(pulseX, pulseY, pulseRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0, 255, 200, ${pulseOpacity})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      // Story text on canvas
      if (scrollFactor > 0.3) {
        ctx.font = 'bold 48px "Courier New", monospace'
        ctx.fillStyle = `rgba(0, 255, 200, ${scrollFactor})`
        ctx.textAlign = 'center'
        ctx.fillText('A SIGNAL EMERGES...', width / 2, height - 100)
      }
      if (scrollFactor > 0.6) {
        ctx.font = 'bold 36px "Courier New", monospace'
        ctx.fillStyle = `rgba(255, 255, 255, ${(scrollFactor - 0.6) * 2.5})`
        ctx.fillText('NODES CONNECTING...', width / 2, height - 60)
      }
      if (scrollFactor > 0.8) {
        ctx.font = 'bold 28px "Courier New", monospace'
        ctx.fillStyle = `rgba(255, 200, 0, ${(scrollFactor - 0.8) * 5})`
        ctx.fillText('✦ NETWORK FORMED ✦', width / 2, height - 25)
      }

      animationId = requestAnimationFrame(animate)
    }

    let pulseX = 0, pulseY = 0
    animate()

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      scrollProgress.current = window.scrollY / scrollHeight
    }
    window.addEventListener('scroll', handleScroll)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

let pulseX = 0, pulseY = 0

const ArpanetCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    const nodes = [
      { name: 'UCLA', x: 0.2, y: 0.3 },
      { name: 'SRI', x: 0.4, y: 0.5 },
      { name: 'UCSB', x: 0.6, y: 0.3 },
      { name: 'UTAH', x: 0.8, y: 0.5 },
      { name: 'BBN', x: 0.3, y: 0.7 },
      { name: 'MIT', x: 0.5, y: 0.8 },
      { name: 'RAND', x: 0.7, y: 0.7 }
    ]

    // Connection pairs
    const connections = [[0,1], [1,2], [1,3], [0,4], [1,5], [2,6], [4,5], [5,6]]

    const packets: Array<{ connIndex: number, progress: number }> = []

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const scrollTop = window.scrollY
      const sectionTop = scrollTop + rect.top
      const scrollFactor = Math.min(1, Math.max(0, (scrollTop - sectionTop + window.innerHeight * 0.3) / (window.innerHeight * 0.7)))

      // Dark background
      ctx.fillStyle = '#000800'
      ctx.fillRect(0, 0, width, height)

      // CRT scanlines
      for (let y = 0; y < height; y += 4) {
        ctx.fillStyle = `rgba(0, 50, 0, ${0.03})`
        ctx.fillRect(0, y, width, 2)
      }

      // Random terminal characters
      ctx.font = '12px monospace'
      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'
      for (let i = 0; i < 50; i++) {
        const char = String.fromCharCode(33 + Math.floor(Math.random() * 90))
        ctx.fillText(char, Math.random() * width, Math.random() * height)
      }

      // Draw connections with animation
      connections.forEach((conn, idx) => {
        const n1 = nodes[conn[0]]
        const n2 = nodes[conn[1]]
        const x1 = n1.x * width
        const y1 = n1.y * height
        const x2 = n2.x * width
        const y2 = n2.y * height

        const connectionProgress = Math.min(1, scrollFactor * 2 + (idx * 0.2) - 0.5)
        
        if (connectionProgress > 0) {
          const endX = x1 + (x2 - x1) * connectionProgress
          const endY = y1 + (y2 - y1) * connectionProgress

          // Animated line
          ctx.beginPath()
          ctx.strokeStyle = '#00ff00'
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.lineDashOffset = -Date.now() * 0.05
          ctx.moveTo(x1, y1)
          ctx.lineTo(endX, endY)
          ctx.stroke()
          ctx.setLineDash([])

          // Glow
          ctx.beginPath()
          ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'
          ctx.lineWidth = 4
          ctx.moveTo(x1, y1)
          ctx.lineTo(endX, endY)
          ctx.stroke()
        }
      })

      // Draw nodes
      nodes.forEach((node, idx) => {
        const nodeProgress = scrollFactor - (idx * 0.2)
        if (nodeProgress > 0) {
          const x = node.x * width
          const y = node.y * height
          const scale = Math.min(1, nodeProgress * 2)

          // Box
          ctx.fillStyle = '#001100'
          ctx.strokeStyle = `rgba(0, 255, 0, ${scale})`
          ctx.lineWidth = 2
          ctx.fillRect(x - 40 * scale, y - 25 * scale, 80 * scale, 50 * scale)
          ctx.strokeRect(x - 40 * scale, y - 25 * scale, 80 * scale, 50 * scale)

          // Node name
          ctx.font = `bold ${14 * scale}px "Courier New", monospace`
          ctx.fillStyle = `rgba(0, 255, 0, ${scale})`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(node.name, x, y)

          // Blinking cursor
          if (Math.random() > 0.5) {
            ctx.fillRect(x + 20 * scale, y + 10 * scale, 8 * scale, 14 * scale)
          }
        }
      })

      // Draw data packets
      if (scrollFactor > 0.5) {
        connections.forEach((conn, idx) => {
          const n1 = nodes[conn[0]]
          const n2 = nodes[conn[1]]
          const x1 = n1.x * width
          const y1 = n1.y * height
          const x2 = n2.x * width
          const y2 = n2.y * height

          const t = (Date.now() * 0.001 + idx * 0.3) % 1
          const px = x1 + (x2 - x1) * t
          const py = y1 + (y2 - y1) * t

          // Packet glow
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, 15)
          gradient.addColorStop(0, 'rgba(255, 255, 0, 1)')
          gradient.addColorStop(1, 'rgba(255, 255, 0, 0)')
          ctx.beginPath()
          ctx.arc(px, py, 15, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()

          // Packet core
          ctx.beginPath()
          ctx.arc(px, py, 5, 0, Math.PI * 2)
          ctx.fillStyle = '#ffff00'
          ctx.fill()
        })
      }

      // Terminal output
      if (scrollFactor > 0.7) {
        const lines = [
          '> ATTEMPTING LOGIN...',
          '> CONNECTING TO HOST...',
          '> PACKET: 110873 OCTETS',
          '> FIRST MESSAGE: "LO"',
          '> SYSTEM: ONLINE ✓'
        ]
        
        ctx.font = '14px "Courier New", monospace'
        ctx.textAlign = 'left'
        lines.forEach((line, i) => {
          const lineProgress = (scrollFactor - 0.7) * 5 - i * 0.3
          if (lineProgress > 0) {
            ctx.fillStyle = `rgba(0, 255, 0, ${Math.min(1, lineProgress)})`
            ctx.fillText(line, 50, height - 140 + i * 25)
          }
        })
      }

      requestAnimationFrame(draw)
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

const WebCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    const websites = [
      { name: 'info.cern.ch', color: '#3b82f6' },
      { name: 'yahoo.com', color: '#8b5cf6' },
      { name: 'google.com', color: '#ef4444' },
      { name: 'amazon.com', color: '#f59e0b' },
      { name: 'ebay.com', color: '#06b6d4' },
      { name: 'wikipedia.org', color: '#6366f1' },
      { name: 'facebook.com', color: '#3b82f6' },
      { name: 'youtube.com', color: '#ef4444' },
      { name: 'twitter.com', color: '#1da1f2' },
      { name: 'reddit.com', color: '#ff4500' },
      { name: 'instagram.com', color: '#e1306c' },
      { name: 'netflix.com', color: '#e50914' }
    ]

    const nodes: Array<{ 
      x: number; y: number; z: number; 
      name: string; color: string; scale: number;
    }> = []

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const scrollTop = window.scrollY
      const sectionTop = scrollTop + rect.top
      const scrollFactor = Math.min(1, Math.max(0, (scrollTop - sectionTop + window.innerHeight * 0.3) / (window.innerHeight * 0.7)))

      // Dark blue background
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, width, height)

      // 3D grid
      const gridDepth = scrollFactor * 500
      for (let z = 0; z < gridDepth; z += 50) {
        const perspective = 1000
        const scale = perspective / (perspective + z)
        
        ctx.strokeStyle = `rgba(100, 100, 255, ${0.1 * scale})`
        ctx.lineWidth = 1

        for (let x = -width; x < width * 2; x += 100) {
          const projX = width / 2 + (x - width / 2) * scale
          const projY = height / 2 + (height / 3) * scale
          
          ctx.beginPath()
          ctx.moveTo(projX, projY)
          ctx.lineTo(projX, height)
          ctx.stroke()
        }
      }

      // Add new websites as scroll progresses
      const numWebsites = Math.min(websites.length, Math.floor(scrollFactor * websites.length * 2))
      
      while (nodes.length < numWebsites) {
        const idx = nodes.length % websites.length
        nodes.push({
          x: (Math.random() - 0.5) * window.innerWidth,
          y: (Math.random() - 0.5) * window.innerHeight,
          z: Math.random() * 300,
          name: websites[idx].name,
          color: websites[idx].color,
          scale: 0
        })
      }

      // Update and draw nodes with 3D perspective
      nodes.forEach((node, idx) => {
        const nodeProgress = (scrollFactor * 2 - idx * 0.2)
        node.scale = Math.min(1, Math.max(0, nodeProgress))

        // Rotate in 3D
        const time = Date.now() * 0.0005
        const cosT = Math.cos(time)
        const sinT = Math.sin(time)
        const rotX = node.x * cosT - node.z * sinT
        const rotZ = node.x * sinT + node.z * cosT

        const perspective = 1000
        const scale = perspective / (perspective + rotZ) * node.scale
        const projX = width / 2 + rotX * scale
        const projY = height / 2 + node.y * scale

        // Connection to center
        if (idx < 3 && scrollFactor > 0.3) {
          ctx.beginPath()
          const gradient = ctx.createLinearGradient(width / 2, height / 2, projX, projY)
          gradient.addColorStop(0, 'rgba(100, 100, 255, 0.6)')
          gradient.addColorStop(1, 'rgba(100, 100, 255, 0.1)')
          ctx.strokeStyle = gradient
          ctx.lineWidth = 1
          ctx.moveTo(width / 2, height / 2)
          ctx.lineTo(projX, projY)
          ctx.stroke()
        }

        // Node glow
        const glowRadius = 30 * scale * (0.5 + Math.sin(Date.now() * 0.003 + idx) * 0.5)
        const gradient = ctx.createRadialGradient(projX, projY, 0, projX, projY, glowRadius)
        gradient.addColorStop(0, node.color + '80')
        gradient.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(projX, projY, glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Website card
        if (node.scale > 0.3) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
          ctx.strokeStyle = node.color
          ctx.lineWidth = 2
          const cardWidth = 120 * scale
          const cardHeight = 40 * scale
          ctx.fillRect(projX - cardWidth / 2, projY - cardHeight / 2, cardWidth, cardHeight)
          ctx.strokeRect(projX - cardWidth / 2, projY - cardHeight / 2, cardWidth, cardHeight)

          // Text
          ctx.font = `bold ${12 * scale}px sans-serif`
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(node.name, projX, projY)
        }
      })

      // Draw outer links
      if (scrollFactor > 0.5) {
        for (let i = 3; i < Math.min(nodes.length, 12); i++) {
          for (let j = i + 1; j < Math.min(nodes.length, 12); j++) {
            const n1 = nodes[i]
            const n2 = nodes[j]
            const dx = n1.x - n2.x
            const dy = n1.y - n2.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < 200) {
              const time = Date.now() * 0.0005
              const cosT = Math.cos(time)
              const sinT = Math.sin(time)
              
              const r1x = n1.x * cosT - n1.z * sinT
              const r1z = n1.x * sinT + n1.z * cosT
              const r2x = n2.x * cosT - n2.z * sinT
              const r2z = n2.x * sinT + n2.z * cosT

              const perspective = 1000
              const s1 = perspective / (perspective + r1z)
              const s2 = perspective / (perspective + r2z)
              const p1x = width / 2 + r1x * s1
              const p1y = height / 2 + n1.y * s1
              const p2x = width / 2 + r2x * s2
              const p2y = height / 2 + n2.y * s2

              ctx.beginPath()
              ctx.strokeStyle = 'rgba(100, 100, 255, 0.15)'
              ctx.lineWidth = 1
              ctx.moveTo(p1x, p1y)
              ctx.lineTo(p2x, p2y)
              ctx.stroke()
            }
          }
        }
      }

      // Text overlay
      if (scrollFactor > 0.3) {
        ctx.font = 'bold 32px sans-serif'
        ctx.fillStyle = `rgba(255, 255, 255, ${scrollFactor})`
        ctx.textAlign = 'center'
        ctx.fillText('THE WEB IS BORN', width / 2, 80)
      }
      if (scrollFactor > 0.6) {
        ctx.font = '20px sans-serif'
        ctx.fillStyle = `rgba(150, 150, 255, ${scrollFactor})`
        ctx.fillText('Information flows freely around the world', width / 2, 120)
      }

      requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

const SocialCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    const emojis = ['👤', '❤️', '💬', '📸', '🎵', '🎮', '📱', '✈️', '🍕', '🌟', '🔥', '🎯', '💡', '🚀', '✨']
    const users: Array<{ 
      angle: number; radius: number; 
      speed: number; emoji: string; 
      connections: number;
    }> = []

    for (let i = 0; i < 30; i++) {
      users.push({
        angle: (Math.PI * 2 * i) / 30,
        radius: 100 + Math.random() * 200,
        speed: (Math.random() - 0.5) * 0.005,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        connections: 0
      })
    }

    let explosionSpread = 0

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const scrollTop = window.scrollY
      const sectionTop = scrollTop + rect.top
      const scrollFactor = Math.min(1, Math.max(0, (scrollTop - sectionTop + window.innerHeight * 0.3) / (window.innerHeight * 0.7)))

      // Dark gradient background
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height))
      gradient.addColorStop(0, '#1a0a14')
      gradient.addColorStop(1, '#0a0a0a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      explosionSpread = scrollFactor * 300

      // Update users
      users.forEach(user => {
        user.radius = 100 + explosionSpread + Math.sin(Date.now() * 0.001 + user.angle) * 30
        user.angle += user.speed
      })

      // Draw connections between nearby users
      users.forEach((u1, i) => {
        users.slice(i + 1).forEach((u2, j) => {
          const x1 = width / 2 + Math.cos(u1.angle) * u1.radius
          const y1 = height / 2 + Math.sin(u1.angle) * u1.radius * 0.6
          const x2 = width / 2 + Math.cos(u2.angle) * u2.radius
          const y2 = height / 2 + Math.sin(u2.angle) * u2.radius * 0.6

          const dx = x1 - x2
          const dy = y1 - y2
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150 * scrollFactor) {
            const opacity = (1 - dist / (150 * scrollFactor)) * 0.4
            ctx.beginPath()
            ctx.strokeStyle = `rgba(236, 72, 153, ${opacity})`
            ctx.lineWidth = 1
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()

            // Animated connection points
            const t = (Date.now() * 0.002 + (i + j) * 0.1) % 1
            const px = x1 + (x2 - x1) * t
            const py = y1 + (y2 - y1) * t
            ctx.beginPath()
            ctx.arc(px, py, 2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(236, 72, 153, ${opacity})`
            ctx.fill()
          }
        })
      })

      // Draw users
      const time = Date.now() * 0.001
      users.forEach((user, idx) => {
        const x = width / 2 + Math.cos(user.angle + time * 0.2) * user.radius
        const y = height / 2 + Math.sin(user.angle + time * 0.2) * user.radius * 0.6

        // Glow
        const glow = 20 + Math.sin(time * 2 + idx) * 5
        const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, glow)
        glowGrad.addColorStop(0, `rgba(236, 72, 153, ${0.5 * scrollFactor})`)
        glowGrad.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(x, y, glow, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()

        // Emoji
        if (scrollFactor > 0) {
          ctx.font = `${24 + Math.sin(time * 3 + idx) * 4}px serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(user.emoji, x, y)
        }
      })

      // Floating hearts
      for (let i = 0; i < Math.floor(scrollFactor * 20); i++) {
        const heartTime = Date.now() * 0.001 + i * 0.5
        const hx = width * 0.2 + Math.random() * width * 0.6
        const hy = height - (heartTime * 100 % height)
        const size = 10 + ((heartTime + i) % 1) * 20

        ctx.font = `${size}px serif`
        ctx.globalAlpha = 0.3 * ((heartTime + i) % 1)
        ctx.fillText('❤️', hx, hy)
        ctx.globalAlpha = 1
      }

      // Central hub
      if (scrollFactor > 0.2) {
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, 40 + scrollFactor * 20, 0, Math.PI * 2)
        const hubGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 60)
        hubGrad.addColorStop(0, '#ec4899')
        hubGrad.addColorStop(1, 'rgba(236, 72, 153, 0)')
        ctx.fillStyle = hubGrad
        ctx.fill()

        ctx.font = '30px serif'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🌐', width / 2, height / 2)
        
        // Connection counter
        if (scrollFactor > 0.5) {
          const connections = Math.floor(scrollFactor * 3000000000)
          ctx.font = 'bold 16px sans-serif'
          ctx.fillStyle = `rgba(255, 255, 255, ${scrollFactor})`
          ctx.fillText(`${(connections / 1000000000).toFixed(1)}B+`, width / 2, height / 2 + 60)
          ctx.fillText('connected', width / 2, height / 2 + 80)
        }
      }

      requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

const MobileCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    const phones: Array<{ 
      angle: number; radius: number; 
      speed: number; apps: string[];
    }> = []

    const appIcons = ['📱', '💬', '🎵', '📷', '🗺️', '🛒', '🎮', '📰']

    for (let i = 0; i < 8; i++) {
      phones.push({
        angle: (Math.PI * 2 * i) / 8,
        radius: 150 + Math.random() * 100,
        speed: (Math.random() - 0.5) * 0.003,
        apps: appIcons.sort(() => Math.random() - 0.5).slice(0, 4)
      })
    }

    let waveRadius = 0

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const scrollTop = window.scrollY
      const sectionTop = scrollTop + rect.top
      const scrollFactor = Math.min(1, Math.max(0, (scrollTop - sectionTop + window.innerHeight * 0.3) / (window.innerHeight * 0.7)))

      // Dark teal background
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height))
      gradient.addColorStop(0, '#0a1a1a')
      gradient.addColorStop(1, '#050808')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      const time = Date.now() * 0.001

      // Data waves
      for (let w = 0; w < 5; w++) {
        waveRadius = ((time * 100 + w * 100) % (Math.max(width, height) * 0.8)) * scrollFactor
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, waveRadius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(20, 184, 166, ${0.3 * (1 - waveRadius / (Math.max(width, height) * 0.4))})`
        ctx.lineWidth = 3
        ctx.stroke()
      }

      // Draw phones
      phones.forEach((phone, idx) => {
        phone.angle += phone.speed
        const orbitRadius = phone.radius + scrollFactor * 50

        const x = width / 2 + Math.cos(phone.angle + time * 0.3 * (idx % 2 ? 1 : -1)) * orbitRadius
        const y = height / 2 + Math.sin(phone.angle + time * 0.3 * (idx % 2 ? 1 : -1)) * orbitRadius * 0.5

        // Phone glow
        const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, 40)
        glowGrad.addColorStop(0, `rgba(20, 184, 166, ${0.6 * scrollFactor})`)
        glowGrad.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(x, y, 40, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()

        // Phone body
        const phoneWidth = 40
        const phoneHeight = 70
        const scale = Math.min(1, scrollFactor * 2)

        ctx.fillStyle = `rgba(30, 30, 35, ${scale})`
        ctx.strokeStyle = `rgba(20, 184, 166, ${scale})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(x - phoneWidth / 2 * scale, y - phoneHeight / 2 * scale, phoneWidth * scale, phoneHeight * scale, 5)
        ctx.fill()
        ctx.stroke()

        // Screen
        ctx.fillStyle = `rgba(10, 10, 15, ${scale})`
        ctx.beginPath()
        ctx.roundRect(x - (phoneWidth / 2 - 4) * scale, y - (phoneHeight / 2 - 8) * scale, (phoneWidth - 8) * scale, (phoneHeight - 16) * scale, 3)
        ctx.fill()

        // App icons
        if (scrollFactor > 0.3) {
          phone.apps.forEach((app, appIdx) => {
            const appX = x - 12 * scale + (appIdx % 2) * 12 * scale
            const appY = y - 20 * scale + Math.floor(appIdx / 2) * 12 * scale
            ctx.font = `${10 * scale}px serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(app, appX, appY)
          })
        }
      })

      // Central tower
      if (scrollFactor > 0.2) {
        ctx.beginPath()
        ctx.moveTo(width / 2, height / 2 - 40)
        ctx.lineTo(width / 2 - 20, height / 2)
        ctx.lineTo(width / 2, height / 2 + 40)
        ctx.lineTo(width / 2 + 20, height / 2)
        ctx.closePath()
        const towerGrad = ctx.createLinearGradient(width / 2, height / 2 - 40, width / 2, height / 2 + 40)
        towerGrad.addColorStop(0, '#14b8a6')
        towerGrad.addColorStop(1, '#0d9488')
        ctx.fillStyle = towerGrad
        ctx.fill()

        // Signal rings
        for (let s = 0; s < 3; s++) {
          const ringTime = (time * 2 + s * 0.33) % 1
          const ringRadius = 25 + ringTime * 50 * scrollFactor
          ctx.beginPath()
          ctx.arc(width / 2, height / 2, ringRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(20, 184, 166, ${0.8 - ringTime * 0.8})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      // Floating signals
      if (scrollFactor > 0.4) {
        for (let i = 0; i < 15; i++) {
          const signalTime = (time * 50 + i * 20) % height
          const sx = 100 + Math.random() * (width - 200)
          const sy = signalTime
          
          ctx.beginPath()
          ctx.arc(sx, sy, 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(20, 184, 166, ${0.5 * scrollFactor})`
          ctx.fill()
          
          ctx.beginPath()
          ctx.moveTo(sx, sy)
          ctx.lineTo(sx - 5, sy + 10)
          ctx.lineTo(sx + 5, sy + 10)
          ctx.closePath()
          ctx.fillStyle = `rgba(20, 184, 166, ${0.3 * scrollFactor})`
          ctx.fill()
        }
      }

      requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

const Web3Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    const nodes: Array<{ 
      x: number; y: number;
      active: boolean; lastActive: number;
    }> = []

    const symbols = ['₿', 'Ξ', '♦', '◎', '⬡', '⟠', '⧫', '∎']

    // Create hexagonal grid
    const hexSize = 60
    const hexHeight = hexSize * 2
    const hexWidth = Math.sqrt(3) * hexSize
    for (let row = -3; row <= 3; row++) {
      for (let col = -4; col <= 4; col++) {
        const x = width / 2 + col * hexWidth + (row % 2) * (hexWidth / 2)
        const y = height / 2 + row * hexHeight * 0.75
        if (Math.abs(row) + Math.abs(col) <= 5) {
          nodes.push({
            x, y,
            active: false,
            lastActive: 0
          })
        }
      }
    }

    let signalIndex = 0
    const signals: Array<{ from: number; to: number; progress: number }> = []

    const drawHexagon = (x: number, y: number, size: number, color: string, fill: boolean = false) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i - Math.PI / 6
        const hx = x + size * Math.cos(angle)
        const hy = y + size * Math.sin(angle)
        if (i === 0) ctx.moveTo(hx, hy)
        else ctx.lineTo(hx, hy)
      }
      ctx.closePath()
      if (fill) {
        ctx.fillStyle = color
        ctx.fill()
      } else {
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      const scrollTop = window.scrollY
      const sectionTop = scrollTop + rect.top
      const scrollFactor = Math.min(1, Math.max(0, (scrollTop - sectionTop + window.innerHeight * 0.3) / (window.innerHeight * 0.7)))

      // Dark purple background
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height))
      gradient.addColorStop(0, '#150a20')
      gradient.addColorStop(1, '#050508')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      const time = Date.now() * 0.001

      // Draw connections
      nodes.forEach((node, i) => {
        nodes.forEach((other, j) => {
          if (i < j) {
            const dx = node.x - other.x
            const dy = node.y - other.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < hexSize * 2.5) {
              const isActive = node.active || other.active
              const baseOpacity = 0.15 * scrollFactor
              const activeOpacity = 0.6 * scrollFactor

              ctx.beginPath()
              ctx.strokeStyle = isActive ? '#a855f7' : 'rgba(100, 50, 150, 0.3)'
              ctx.lineWidth = isActive ? 2 : 1
              ctx.moveTo(node.x, node.y)
              ctx.lineTo(other.x, other.y)
              ctx.stroke()
            }
          }
        })
      })

      // Draw signals
      signals.forEach((sig, idx) => {
        const from = nodes[sig.from]
        const to = nodes[sig.to]

        if (from && to) {
          sig.progress += 0.02 * scrollFactor

          const x = from.x + (to.x - from.x) * sig.progress
          const y = from.y + (to.y - from.y) * sig.progress

          // Signal glow
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15)
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)')
          gradient.addColorStop(1, 'transparent')
          ctx.beginPath()
          ctx.arc(x, y, 15, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()

          if (sig.progress >= 1) {
            to.active = true
            to.lastActive = time
            signals.splice(idx, 1)
          }
        }
      })

      // Randomly activate nodes and send signals
      if (scrollFactor > 0.3 && Math.random() < 0.02 * scrollFactor) {
        const idx = Math.floor(Math.random() * nodes.length)
        nodes[idx].active = true
        nodes[idx].lastActive = time

        // Send signals to neighbors
        nodes.forEach((node, i) => {
          const dx = nodes[idx].x - node.x
          const dy = nodes[idx].y - node.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < hexSize * 2.5 && i !== idx && Math.random() < 0.5) {
            signals.push({ from: idx, to: i, progress: 0 })
          }
        })
      }

      // Draw nodes
      nodes.forEach((node, i) => {
        // Deactivate old nodes
        if (time - node.lastActive > 2) {
          node.active = false
        }

        const isActive = node.active
        const pulse = isActive ? 0.8 + Math.sin(time * 10) * 0.2 : 0.3
        const nodeOpacity = Math.min(1, scrollFactor * 1.5)

        // Glow effect
        if (isActive) {
          const glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, hexSize * 1.5)
          glowGrad.addColorStop(0, `rgba(168, 85, 247, ${0.4 * nodeOpacity})`)
          glowGrad.addColorStop(1, 'transparent')
          ctx.beginPath()
          ctx.arc(node.x, node.y, hexSize * 1.5, 0, Math.PI * 2)
          ctx.fillStyle = glowGrad
          ctx.fill()
        }

        // Hexagon
        const color = isActive ? '#a855f7' : `rgba(100, 50, 150, ${pulse * nodeOpacity})`
        drawHexagon(node.x, node.y, hexSize * 0.4, color, isActive)

        // Symbol
        if (scrollFactor > 0.5) {
          ctx.font = `bold ${16 * pulse * nodeOpacity}px sans-serif`
          ctx.fillStyle = isActive ? '#ffffff' : `rgba(168, 85, 247, ${nodeOpacity})`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(symbols[i % symbols.length], node.x, node.y)
        }
      })

      // Block chain visualization
      if (scrollFactor > 0.4) {
        const blocks = Math.floor(scrollFactor * 8)
        for (let i = 0; i < blocks; i++) {
          const by = 60 + i * 30
          const bw = 120
          const bx = width / 2 - bw / 2

          // Block
          ctx.fillStyle = `rgba(30, 15, 50, ${0.8 + Math.sin(time * 2 + i) * 0.2})`
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.8})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.roundRect(bx, by, bw, 24, 4)
          ctx.fill()
          ctx.stroke()

          // Block number
          ctx.font = '12px monospace'
          ctx.fillStyle = 'rgba(168, 85, 247, 0.8)'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(`BLOCK #${1000 + i}`, bx + 8, by + 12)

          // Hash
          ctx.font = '10px monospace'
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.textAlign = 'right'
          ctx.fillText('0x' + Math.random().toString(16).substr(2, 8), bx + bw - 8, by + 12)

          // Link to previous
          if (i > 0) {
            ctx.beginPath()
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)'
            ctx.lineWidth = 1
            ctx.moveTo(width / 2, by)
            ctx.lineTo(width / 2, by - 6)
            ctx.stroke()
          }
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

const FutureCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    // Neural network layers
    const layers = [4, 6, 8, 6, 4]
    const neurons: Array<{ x: number; y: number; layer: number; axons: number[] }> = []

    for (let l = 0; l < layers.length; l++) {
      for (let n = 0; n < layers[l]; n++) {
        neurons.push({
          x: 0,
          y: 0,
          layer: l,
          axons: []
        })
      }
    }

    const signals: Array<{ from: number; to: number; progress: number }> = []

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      const scrollTop = window.scrollY
      const sectionTop = scrollTop + rect.top
      const scrollFactor = Math.min(1, Math.max(0, (scrollTop - sectionTop + window.innerHeight * 0.3) / (window.innerHeight * 0.7)))

      // Ethereal dark background
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height))
      gradient.addColorStop(0, '#151520')
      gradient.addColorStop(1, '#050508')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      const layerSpacing = (width * 0.6) / (layers.length + 1)

      // Update neuron positions
      let neuronIndex = 0
      for (let l = 0; l < layers.length; l++) {
        const layerX = width * 0.2 + (l + 0.5) * layerSpacing
        const neuronSpacing = (height * 0.7) / (layers[l] + 1)

        for (let n = 0; n < layers[l]; n++) {
          const neuronY = height * 0.15 + (n + 1) * neuronSpacing
          neurons[neuronIndex].x = layerX
          neurons[neuronIndex].y = neuronY
          neuronIndex++
        }
      }

      const time = Date.now() * 0.001

      // Draw axons (connections)
      let idx = 0
      for (let l = 0; l < layers.length - 1; l++) {
        const currentLayerStart = neurons.slice(0, idx + layers[l]).length - layers[l]
        const nextLayerStart = idx + layers[l]

        for (let n1 = currentLayerStart; n1 < currentLayerStart + layers[l]; n1++) {
          for (let n2 = nextLayerStart; n2 < Math.min(nextLayerStart + layers[l + 1], neurons.length); n2++) {
            const neuron1 = neurons[n1]
            const neuron2 = neurons[n2]

            // Ethereal connection
            const connectionOpacity = 0.05 + Math.sin(time + n1 + n2) * 0.03

            ctx.beginPath()
            const gradient = ctx.createLinearGradient(neuron1.x, neuron1.y, neuron2.x, neuron2.y)
            gradient.addColorStop(0, `rgba(100, 100, 150, ${connectionOpacity * scrollFactor})`)
            gradient.addColorStop(0.5, `rgba(150, 100, 200, ${connectionOpacity * scrollFactor})`)
            gradient.addColorStop(1, `rgba(100, 100, 150, ${connectionOpacity * scrollFactor})`)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1
            ctx.moveTo(neuron1.x, neuron1.y)
            ctx.lineTo(neuron2.x, neuron2.y)
            ctx.stroke()
          }
        }
        idx += layers[l]
      }

      // Draw signals
      signals.forEach((signal, sIdx) => {
        const from = neurons[signal.from]
        const to = neurons[signal.to]

        if (from && to) {
          signal.progress += 0.015 * scrollFactor

          const x = from.x + (to.x - from.x) * signal.progress
          const y = from.y + (to.y - from.y) * signal.progress

          // Ethereal glow
          const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, 20)
          glowGrad.addColorStop(0, 'rgba(200, 180, 255, 0.8)')
          glowGrad.addColorStop(0.5, 'rgba(150, 100, 255, 0.3)')
          glowGrad.addColorStop(1, 'transparent')
          ctx.beginPath()
          ctx.arc(x, y, 20, 0, Math.PI * 2)
          ctx.fillStyle = glowGrad
          ctx.fill()

          // Signal core
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()

          if (signal.progress >= 1) {
            signals.splice(sIdx, 1)
          }
        }
      })

      // Generate signals from input layer based on scroll
      if (scrollFactor > 0.2 && Math.random() < 0.05 * scrollFactor) {
        const fromNeuron = Math.floor(Math.random() * layers[0])
        const targetLayer = 1 + Math.floor(Math.random() * (layers.length - 1))
        const toNeuron = layers.slice(0, targetLayer).reduce((a, b) => a + b, 0) + Math.floor(Math.random() * layers[targetLayer])
        
        signals.push({ from: fromNeuron, to: toNeuron, progress: 0 })
      }

      // Draw neurons
      neurons.forEach((neuron, idx) => {
        const pulse = 0.5 + Math.sin(time * 2 + idx * 0.5) * 0.5
        const neuronOpacity = Math.min(1, scrollFactor * 1.5)

        // Outer glow
        const outerGrad = ctx.createRadialGradient(neuron.x, neuron.y, 0, neuron.x, neuron.y, 25)
        outerGrad.addColorStop(0, `rgba(180, 160, 255, ${0.3 * pulse * neuronOpacity})`)
        outerGrad.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(neuron.x, neuron.y, 25, 0, Math.PI * 2)
        ctx.fillStyle = outerGrad
        ctx.fill()

        // Neuron body
        const bodyGrad = ctx.createRadialGradient(neuron.x, neuron.y, 0, neuron.x, neuron.y, 10)
        bodyGrad.addColorStop(0, `rgba(200, 200, 255, ${0.9 * pulse * neuronOpacity})`)
        bodyGrad.addColorStop(1, `rgba(100, 80, 150, ${0.6 * pulse * neuronOpacity})`)
        ctx.beginPath()
        ctx.arc(neuron.x, neuron.y, 8 + pulse * 2, 0, Math.PI * 2)
        ctx.fillStyle = bodyGrad
        ctx.fill()

        // Inner light
        ctx.beginPath()
        ctx.arc(neuron.x, neuron.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * pulse * neuronOpacity})`
        ctx.fill()
      })

      // Ethereal floating particles
      for (let i = 0; i < 50; i++) {
        const px = (Math.sin(time * 0.5 + i * 0.5) * 0.5 + 0.5) * width
        const py = ((time * 30 + i * 50) % height)
        const size = 1 + Math.sin(time + i) * 1

        ctx.beginPath()
        ctx.arc(px, py, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 180, 255, ${0.2 * scrollFactor})`
        ctx.fill()
      }

      // Text overlay
      if (scrollFactor > 0.5) {
        ctx.font = 'bold 40px sans-serif'
        ctx.textAlign = 'center'
        
        // Glowing text
        ctx.shadowColor = '#a855f7'
        ctx.shadowBlur = 30
        ctx.fillStyle = `rgba(255, 255, 255, ${scrollFactor})`
        ctx.fillText('NEURAL NETWORK', width / 2, 80)
        ctx.shadowBlur = 0

        ctx.font = '24px sans-serif'
        ctx.fillStyle = `rgba(200, 180, 255, ${scrollFactor})`
        ctx.fillText('The boundary between AI and human dissolves', width / 2, 120)
      }

      if (scrollFactor > 0.8) {
        ctx.font = 'italic 32px serif'
        ctx.fillStyle = `rgba(255, 255, 255, ${(scrollFactor - 0.8) * 5})`
        ctx.fillText('"We become the network"', width / 2, height - 80)
      }

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

const Section = ({ id, title, year, theme, children, canvas }: {
  id: string
  title: string
  year: string
  theme: string
  children: React.ReactNode
  canvas: React.ReactNode
}) => {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = contentRef.current
    if (!ctx) return

    gsap.fromTo(ctx.querySelectorAll('.animate-in'),
      {
        opacity: 0,
        y: 50
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ctx,
          start: 'top 70%',
          toggleActions: 'play none none none'
        }
      }
    )
  }, [])

  const themeColors: Record<string, { bg: string; accent: string; glow: string }> = {
    cyan: { bg: 'rgba(0, 50, 50, 0.8)', accent: '#00ffcc', glow: '#00ffaa' },
    green: { bg: 'rgba(0, 40, 0, 0.85)', accent: '#00ff00', glow: '#00cc00' },
    blue: { bg: 'rgba(0, 20, 60, 0.8)', accent: '#60a5fa', glow: '#3b82f6' },
    pink: { bg: 'rgba(40, 10, 30, 0.8)', accent: '#ec4899', glow: '#f472b6' },
    teal: { bg: 'rgba(0, 40, 40, 0.85)', accent: '#14b8a6', glow: '#2dd4bf' },
    purple: { bg: 'rgba(30, 10, 50, 0.85)', accent: '#a855f7', glow: '#c084fc' },
    white: { bg: 'rgba(10, 10, 20, 0.85)', accent: '#e0e7ff', glow: '#ffffff' }
  }

  const colors = themeColors[theme] || themeColors.cyan

  return (
    <section id={id} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {canvas}
      
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
      
      <div 
        ref={contentRef}
        className="relative z-10 max-w-6xl mx-auto px-8 py-20"
      >
        {/* Header */}
        <div className="animate-in mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span 
              className="text-5xl font-bold"
              style={{ 
                color: colors.accent,
                textShadow: `0 0 40px ${colors.glow}80, 0 0 80px ${colors.glow}40`
              }}
            >
              {year}
            </span>
            <div 
              className="h-px w-20"
              style={{ backgroundColor: colors.glow }}
            />
          </div>
          <h1 
            className="text-6xl md:text-8xl font-black text-white tracking-tight"
            style={{ 
              textShadow: `0 0 60px ${colors.glow}60, 4px 4px 0 ${colors.bg}`
            }}
          >
            {title}
          </h1>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {children}
        </div>
      </div>
    </section>
  )
}

// Reusable story point component
const StoryPoint = ({ icon, title, description, theme }: {
  icon: string
  title: string
  description: string
  theme: string
}) => {
  const themeColors: Record<string, string> = {
    cyan: '#00ffcc',
    green: '#00ff00',
    blue: '#60a5fa',
    pink: '#ec4899',
    teal: '#14b8a6',
    purple: '#a855f7',
    white: '#e0e7ff'
  }

  const color = themeColors[theme] || '#00ffcc'

  return (
    <div className="animate-in bg-black/40 backdrop-blur-xl border rounded-2xl p-6 hover:bg-black/60 transition-all duration-500 hover:scale-105 hover:-translate-y-1 group"
      style={{ borderColor: `${color}40`, boxShadow: `0 0 40px ${color}10` }}
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-3" style={{ color }}>{title}</h3>
      <p className="text-gray-300 text-lg leading-relaxed">{description}</p>
    </div>
  )
}

function App() {
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    // Loading animation
    setTimeout(() => setLoading(false), 2500)

    // Track active section
    const sections = ['hero', 'arpanet', 'www', 'social', 'mobile', 'web3', 'future']
    
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 2
      sections.forEach(id => {
        const el = document.getElementById(id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id)
          }
        }
      })
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const timeline = [
    { id: 'hero', year: '1960', label: 'BIRTH' },
    { id: 'arpanet', year: '1969', label: 'ARPANET' },
    { id: 'www', year: '1991', label: 'WEB' },
    { id: 'social', year: '2004', label: 'SOCIAL' },
    { id: 'mobile', year: '2007', label: 'MOBILE' },
    { id: 'web3', year: '2020', label: 'WEB3' },
    { id: 'future', year: '2050', label: 'FUTURE' }
  ]

  return (
    <div className="bg-black text-white overflow-x-hidden">
      {/* Loading Screen */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-8 tracking-wider" style={{ color: '#00ffcc', textShadow: '0 0 40px #00ffaa' }}>
              INSIDE THE INTERNET
            </h1>
            <div className="w-64 h-1 bg-gray-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full transition-all duration-100"
                style={{ width: loading ? '0%' : '100%' }}
              />
            </div>
            <p className="mt-4 text-gray-500 text-sm font-mono">INITIALIZING...</p>
          </div>
        </div>
      )}

      {/* Timeline Sidebar */}
      <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden md:block">
        <div className="flex flex-col gap-4">
          {timeline.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="group relative text-right transition-all duration-300"
            >
              <span 
                className={`text-xs font-bold transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'text-cyan-400 scale-110' 
                    : 'text-gray-600 group-hover:text-gray-400'
                }`}
              >
                {item.year}
              </span>
              <div 
                className={`absolute right-0 top-1/2 -translate-y-1/2 -translate-x-4 w-2 h-2 rounded-full transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'bg-cyan-400 scale-150 shadow-lg shadow-cyan-400/50' 
                    : 'bg-gray-700 group-hover:bg-gray-500'
                }`}
              />
            </button>
          ))}
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-40 bg-gray-900">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-100"
          style={{
            width: `${Math.min(100, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}%`
          }}
        />
      </div>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroCanvas />
        
        <div className="relative z-10 text-center px-8">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 rounded-full border border-cyan-500/50 text-cyan-400 text-sm font-bold tracking-widest animate-pulse">
              AN IMMERSIVE JOURNEY
            </span>
          </div>
          
          <h1 
            className="text-7xl md:text-9xl font-black mb-6 tracking-tight"
            style={{ 
              color: '#ffffff',
              textShadow: '0 0 80px rgba(0, 255, 200, 0.5), 4px 4px 0 rgba(0, 50, 50, 0.5)'
            }}
          >
            INSIDE THE
            <br />
            <span style={{ color: '#00ffcc', textShadow: '0 0 80px rgba(0, 255, 200, 0.8)' }} className="block mt-2">INTERNET</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Travel through time and witness the evolution of the network that changed humanity forever
          </p>
          
          <div className="animate-bounce">
            <div className="w-8 h-12 mx-auto border-2 border-cyan-500/50 rounded-full flex justify-center pt-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ARPANET Section */}
      <Section 
        id="arpanet" 
        title="ARPANET" 
        year="1969" 
        theme="green"
        canvas={<ArpanetCanvas />}
      >
        <StoryPoint 
          icon="🖥️"
          title="First Connection"
          description="The first message sent over ARPANET was 'LO' - intended to be 'LOGIN' but the system crashed after the first two letters. A humble beginning for the greatest network ever built."
          theme="green"
        />
        <StoryPoint 
          icon="🌐"
          title="Four Nodes"
          description="UCLA, Stanford Research Institute, UC Santa Barbara, and University of Utah formed the original four nodes. They would soon expand to include MIT, BBN, and RAND."
          theme="green"
        />
        <div className="col-span-2 animate-in bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 mt-4">
          <h3 className="text-2xl font-bold text-green-400 mb-4">{'>'} SYSTEM LOG</h3>
          <div className="font-mono text-sm space-y-2">
            <p className="text-green-300">[1969-10-29 22:30:00] ATTEMPTING LOGIN...</p>
            <p className="text-green-300">[1969-10-29 22:30:15] CONNECTION ESTABLISHED</p>
            <p className="text-green-300">[1969-10-29 22:30:22] PACKET: "LO" TRANSMITTED ✓</p>
            <p className="text-green-300">[1969-10-29 22:30:30] SYSTEM CRASH - REBOOT INITIATED</p>
            <p className="text-yellow-400">[1969-10-29 22:31:00] THE INTERNET IS BORN</p>
          </div>
        </div>
      </Section>

      {/* World Wide Web Section */}
      <Section 
        id="www"
        title="WORLD WIDE WEB"
        year="1991"
        theme="blue"
        canvas={<WebCanvas />}
      >
        <StoryPoint 
          icon="🕸️"
          title="Tim Berners-Lee"
          description="At CERN, Tim Berners-Lee invented the World Wide Web, creating HTML, HTTP, and the first web browser. He gave it to the world for free."
          theme="blue"
        />
        <StoryPoint 
          icon="📄"
          title="First Website"
          description="info.cern.ch was the first website ever created. It explained what the web was and how to use it. A simple page that would change everything."
          theme="blue"
        />
        <StoryPoint 
          icon="🔍"
          title="The Search Era"
          description="Yahoo, Google, and other search engines organized the chaos of the web. Information became accessible to anyone with an internet connection."
          theme="blue"
        />
        <StoryPoint 
          icon="🛒"
          title="E-Commerce"
          description="Amazon and eBay brought commerce online. Shopping would never be the same again. The web became a marketplace, not just a library."
          theme="blue"
        />
      </Section>

      {/* Social Media Section */}
      <Section 
        id="social"
        title="SOCIAL MEDIA"
        year="2004"
        theme="pink"
        canvas={<SocialCanvas />}
      >
        <StoryPoint 
          icon="👥"
          title="Everyone Has a Voice"
          description="Facebook, Twitter, and other platforms gave every person a global microphone. Ideas could spread instantly across the planet."
          theme="pink"
        />
        <StoryPoint 
          icon="💬"
          title="Real-time Connection"
          description="Instant messaging and social feeds created a new form of communication. We could share our lives in real-time with friends everywhere."
          theme="pink"
        />
        <div className="col-span-2 animate-in bg-black/40 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-8">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 text-center">
            {['👥', '❤️', '💬', '📸', '🎵', '🎮', '📱', '✈️'].map((emoji, i) => (
              <div key={i} className="text-4xl hover:scale-150 transition-transform duration-300 cursor-pointer">{emoji}</div>
            ))}
          </div>
          <p className="text-center text-pink-400 mt-6 text-xl font-bold">3 Billion+ Connected Users</p>
        </div>
      </Section>

      {/* Mobile Internet Section */}
      <Section 
        id="mobile"
        title="MOBILE INTERNET"
        year="2007"
        theme="teal"
        canvas={<MobileCanvas />}
      >
        <StoryPoint 
          icon="📱"
          title="The iPhone"
          description="Apple's iPhone changed everything. The internet was now in our pockets, accessible anywhere, anytime. A true revolution."
          theme="teal"
        />
        <StoryPoint 
          icon="🚀"
          title="Apps Ecosystem"
          description="From social media to banking, games to productivity - apps transformed how we interact with the digital world. The app economy was born."
          theme="teal"
        />
        <div className="col-span-2 animate-in bg-black/40 backdrop-blur-xl border border-teal-500/30 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-16">
            <div className="text-center">
              <div className="text-5xl font-bold text-teal-400 mb-2">7B+</div>
              <div className="text-gray-400">Mobile Devices</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-teal-400 mb-2">5M+</div>
              <div className="text-gray-400">Apps Available</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-teal-400 mb-2">24/7</div>
              <div className="text-gray-400">Always Connected</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Web3 Section */}
      <Section 
        id="web3"
        title="WEB3"
        year="2020"
        theme="purple"
        canvas={<Web3Canvas />}
      >
        <StoryPoint 
          icon="⛓️"
          title="Decentralization"
          description="No central servers. No gatekeepers. Blockchain technology created a new internet where users own their data and transactions."
          theme="purple"
        />
        <StoryPoint 
          icon="💰"
          title="Digital Ownership"
          description="NFTs, cryptocurrency, and DAOs. True digital ownership became possible. Assets that can't be seized or censored."
          theme="purple"
        />
        <StoryPoint 
          icon="🌐"
          title="The Metaverse"
          description="Virtual worlds, digital identities, and new economies. The boundary between physical and digital reality began to blur."
          theme="purple"
        />
        <StoryPoint 
          icon="🔐"
          title="Trust Through Code"
          description="Smart contracts execute automatically without intermediaries. Code replaces institutions as the basis of trust."
          theme="purple"
        />
      </Section>

      {/* Future Section */}
      <Section 
        id="future"
        title="THE FUTURE"
        year="2050"
        theme="white"
        canvas={<FutureCanvas />}
      >
        <div className="col-span-2 animate-in text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-8" style={{ color: '#e0e7ff', textShadow: '0 0 60px rgba(200, 180, 255, 0.5)' }}>
            THE BOUNDARY DISSOLVES
          </h3>
          <p className="text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            As neural interfaces connect our minds directly to the network, 
            the line between human and machine, 
            between individual and collective, 
            between thought and action...
            <br /><br />
            <span style={{ color: '#a855f7' }}>It all disappears.</span>
          </p>
          <div className="inline-block border border-purple-500/50 rounded-2xl p-8 bg-black/40 backdrop-blur-xl">
            <p className="text-3xl italic text-purple-300">
              "We don't use the internet anymore.<br />
              We are the internet."
            </p>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="relative py-20 text-center bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-cyan-400 mb-4">INSIDE THE INTERNET</h2>
          <p className="text-gray-500 mb-8">An immersive journey through digital evolution</p>
          <div className="flex justify-center gap-4">
            <span className="text-gray-600">1969</span>
            <span className="text-cyan-500">→</span>
            <span className="text-gray-600">2050</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App