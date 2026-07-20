import { onMounted, onUnmounted, type Ref } from 'vue'

interface Particle {
  x: number; y: number; vx: number; vy: number; r: number
}

export function useParticles(canvasRef: Ref<HTMLCanvasElement | null>) {
  let animId = 0
  let particles: Particle[] = []
  let w = 0, h = 0
  const COUNT = 70
  const MAX_DIST = 160
  const SPEED = 0.4
  const MOUSE_RADIUS = 120
  const MOUSE_FORCE = 0.08

  let mouse = { x: -9999, y: -9999, active: false }

  function onMouseMove(e: MouseEvent) {
    mouse.x = e.clientX
    mouse.y = e.clientY
    mouse.active = true
  }

  function onMouseLeave() {
    mouse.active = false
  }

  function init() {
    particles = []
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: Math.random() * 2 + 1.5
      })
    }
  }

  function draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, w, h)

    // Mouse glow
    if (mouse.active) {
      const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS)
      glow.addColorStop(0, 'rgba(99,102,241,0.06)')
      glow.addColorStop(1, 'rgba(99,102,241,0)')
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()
    }

    // Update & draw particles
    for (const p of particles) {
      // Mouse repulsion
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (mouse.active && dist < MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE
        p.x += (dx / dist) * force * 2
        p.y += (dy / dist) * force * 2
      }

      // Normal velocity
      p.x += p.vx
      p.y += p.vy

      if (p.x < 0 || p.x > w) p.vx *= -1
      if (p.y < 0 || p.y > h) p.vy *= -1

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(129,140,248,0.55)'
      ctx.fill()
    }

    // Draw connecting lines between particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.18
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(99,102,241,${alpha})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      }

      // Connect to mouse
      if (mouse.active) {
        const dx = particles[i].x - mouse.x
        const dy = particles[i].y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS) {
          const alpha = (1 - dist / MOUSE_RADIUS) * 0.25
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.strokeStyle = `rgba(129,140,248,${alpha})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }
  }

  function animate(ctx: CanvasRenderingContext2D) {
    draw(ctx)
    animId = requestAnimationFrame(() => animate(ctx))
  }

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      init()
    }
    resize()
    window.addEventListener('resize', resize)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    animId = requestAnimationFrame(() => animate(ctx))
  })

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseleave', onMouseLeave)
  })
}
