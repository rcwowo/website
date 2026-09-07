import { useEffect, useRef } from 'react'

type Pt = { x: number; y: number }
type Dust = { x: number; y: number; r: number; field: number; n: number }

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function jitteredRing(cx: number, cy: number, r: number, n: number, seed: number, amp: number) {
  const rand = mulberry32(seed)
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const rr = r + (rand() - 0.5) * 2 * amp
    const wobble = (rand() - 0.5) * 0.05
    pts.push({
      x: cx + Math.cos(t + wobble) * rr,
      y: cy + Math.sin(t + wobble) * rr,
    })
  }
  return pts
}

function jitteredW(cx: number, cy: number, w: number, h: number, n: number, seed: number, amp: number) {
  const rand = mulberry32(seed)
  const pts: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const u = i / n
    const local = u < 0.5 ? u * 2 : (u - 0.5) * 2
    const dir = u < 0.5 ? -1 : 1
    const x = cx + (u - 0.5) * w
    const y = cy + 4 * local * (1 - local) * h
    const px = -4 * (1 - 2 * local) * h
    const py = dir * w
    const len = Math.hypot(px, py) || 1
    const j = (rand() - 0.5) * 2 * amp
    pts.push({
      x: x + (px / len) * j,
      y: y + (py / len) * j,
    })
  }
  return pts
}

function strokeClosed(ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, pts: Pt[]) {
  if (pts.length === 0) return
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
  ctx.closePath()
  ctx.stroke()
}

function fillClosed(ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, pts: Pt[]) {
  if (pts.length === 0) return
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
  ctx.closePath()
  ctx.fill()
}

function strokeOpen(ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, pts: Pt[]) {
  if (pts.length === 0) return
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
  ctx.stroke()
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function hash2(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

const FACE_ASPECT = 465 / 203
const FACE_STEPS = 16
const BLOOM_SCALE = 0.5

export default function OwoGrid() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const sharpRef = useRef<HTMLCanvasElement>(null)
  const bloomRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrapEl = wrapRef.current
    const sharpEl = sharpRef.current
    const bloomEl = bloomRef.current
    if (!wrapEl || !sharpEl || !bloomEl) return
    const wrap = wrapEl
    const sharp = sharpEl
    const bloom = bloomEl

    const sharpContext = sharp.getContext('2d', { alpha: true })
    const bloomContext = bloom.getContext('2d', { alpha: true })
    if (!sharpContext || !bloomContext) return
    const sharpCtx = sharpContext
    const bloomCtx = bloomContext

    const bgCanvas = document.createElement('canvas')
    const bgContext = bgCanvas.getContext('2d', { alpha: true })
    if (!bgContext) return
    const bgCtx = bgContext

    const faceOuter: string[] = []
    const faceInner: string[] = []
    for (let i = 0; i < FACE_STEPS; i++) {
      const inten = (i + 0.5) / FACE_STEPS
      faceOuter.push(`hsla(330, 72%, ${70 + inten * 18}%, ${0.38 + inten * 0.55})`)
      faceInner.push(`hsla(330, 30%, 94%, ${0.28 + inten * 0.4})`)
    }

    const leftEye = jitteredRing(0, 0, 1, 72, 1337, 0.045)
    const rightEye = jitteredRing(0, 0, 1, 70, 9001, 0.05)
    const leftPupil = jitteredRing(0, 0, 1, 28, 4242, 0.08)
    const rightPupil = jitteredRing(0, 0, 1, 26, 777, 0.09)
    const mouth = jitteredW(0, 0, 1, 1, 42, 31415, 0.035)

    let width = 0
    let height = 0
    let cell = 12
    let cols = 0
    let rows = 0
    let dpr = 1
    let rectLeft = 0
    let rectTop = 0
    let staticN = new Float32Array(0)
    let dustCells: Dust[] = []
    let source: OffscreenCanvas | HTMLCanvasElement
    let sourceCtx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
    const srcScale = 2

    try {
      source = new OffscreenCanvas(1, 1)
      sourceCtx = source.getContext('2d', {
        alpha: false,
        willReadFrequently: true,
      }) as OffscreenCanvasRenderingContext2D
    } catch {
      source = document.createElement('canvas')
      sourceCtx = source.getContext('2d', {
        alpha: false,
        willReadFrequently: true,
      }) as CanvasRenderingContext2D
    }

    if (!sourceCtx) return

    const face = {
      cx: 0,
      cy: 0,
      w: 0,
      h: 0,
    }

    let lookX = 0
    let lookY = 0.48
    let headX = 0
    let headY = 0.48
    let targetX = 0
    let targetY = 0.48
    let blink = 0
    let blinkClosing = false
    let nextBlink = 0
    let nextSaccade = 0
    let lastPointer = 0
    let pointerActive = false
    let pointerX = 0
    let pointerY = 0
    let introUntil = 0
    let visible = true
    let inView = true
    let reduced = false
    let raf = 0
    let lastT = 0

    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)')

    function syncReduced() {
      reduced = reduceMq.matches
    }
    syncReduced()

    function syncRect() {
      const r = wrap.getBoundingClientRect()
      rectLeft = r.left
      rectTop = r.top
    }

    function measureFace() {
      const maxW = width * 0.96
      const maxH = height * 0.9
      let w = maxW
      let h = w / FACE_ASPECT
      if (h > maxH) {
        h = maxH
        w = h * FACE_ASPECT
      }
      face.w = w
      face.h = h
      face.cx = width * 0.5
      face.cy = height * 0.4
    }

    function renderBgStatic() {
      bgCanvas.width = sharp.width
      bgCanvas.height = sharp.height
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bgCtx.clearRect(0, 0, width, height)
      for (let gy = 0; gy < rows; gy++) {
        const fade = clamp(1 - (gy / rows - 0.46) / 0.48, 0, 1)
        if (fade <= 0.03) continue
        for (let gx = 0; gx < cols; gx++) {
          const n = staticN[gy * cols + gx]
          if (n > 0.88) continue
          const alpha = (0.045 + n * 0.04) * fade
          if (alpha < 0.02) continue
          bgCtx.beginPath()
          bgCtx.fillStyle = `hsla(265, 28%, ${42 + n * 24}%, ${alpha})`
          bgCtx.arc((gx + 0.5) * cell, (gy + 0.5) * cell, cell * (0.12 + n * 0.09), 0, Math.PI * 2)
          bgCtx.fill()
        }
      }
    }

    function resize() {
      const rect = wrap.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      dpr = Math.min(2, window.devicePixelRatio || 1)
      cell = width < 640 ? 12 : 10
      cols = Math.max(8, Math.round(width / cell))
      rows = Math.max(8, Math.round(height / cell))
      cell = width / cols

      sharp.width = Math.floor(width * dpr)
      sharp.height = Math.floor(height * dpr)
      sharp.style.width = `${width}px`
      sharp.style.height = `${height}px`
      sharpCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

      bloom.width = Math.max(1, Math.ceil(sharp.width * BLOOM_SCALE))
      bloom.height = Math.max(1, Math.ceil(sharp.height * BLOOM_SCALE))
      bloom.style.width = `${width}px`
      bloom.style.height = `${height}px`
      bloomCtx.setTransform(1, 0, 0, 1, 0, 0)

      source.width = cols * srcScale
      source.height = rows * srcScale

      staticN = new Float32Array(cols * rows)
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          staticN[gy * cols + gx] = hash2(gx + 3, gy + 11)
        }
      }

      dustCells = []
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const n = staticN[gy * cols + gx]
          if (n <= 0.88) continue
          dustCells.push({
            x: (gx + 0.5) * cell,
            y: (gy + 0.5) * cell,
            r: cell * (0.12 + n * 0.09),
            field: 0.045 + n * 0.04,
            n,
          })
        }
      }

      renderBgStatic()
      measureFace()
      syncRect()
    }

    function screenToLook(sx: number, sy: number) {
      const x = sx - rectLeft
      const y = sy - rectTop
      targetX = clamp((x - face.cx) / (face.w * 0.42), -1.15, 1.15)
      targetY = clamp((y - face.cy) / (face.h * 0.7), -1.15, 1.15)
    }

    function pickIdleTarget() {
      const spots: Pt[] = [
        { x: window.innerWidth * 0.5, y: window.innerHeight * 0.22 },
        { x: window.innerWidth * 0.18, y: window.innerHeight * 0.3 },
        { x: window.innerWidth * 0.82, y: window.innerHeight * 0.28 },
        { x: window.innerWidth * 0.5, y: window.innerHeight * 0.55 },
        { x: window.innerWidth * 0.7, y: window.innerHeight * 0.72 },
        { x: window.innerWidth * 0.3, y: window.innerHeight * 0.68 },
      ]

      const ids = ['tagline', 'projects']
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const r = el.getBoundingClientRect()
        spots.push({ x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 })
      }

      const title = wrap.closest('section')?.querySelector('h1')
      if (title) {
        const r = title.getBoundingClientRect()
        spots.push({ x: r.left + r.width * 0.5, y: r.top + r.height * 0.45 })
      }

      const pick = spots[Math.floor(Math.random() * spots.length)]
      screenToLook(pick.x, pick.y)
    }

    function scheduleBlink(now: number) {
      nextBlink = now + 2200 + Math.random() * 3800
      if (Math.random() < 0.18) nextBlink = now + 180
    }

    function placeRing(unit: Pt[], cx: number, cy: number, r: number, sy: number) {
      const out: Pt[] = []
      for (const p of unit) {
        out.push({
          x: cx + p.x * r,
          y: cy + p.y * r * sy,
        })
      }
      return out
    }

    function placeW(unit: Pt[], cx: number, cy: number, w: number, h: number) {
      const out: Pt[] = []
      for (const p of unit) {
        out.push({
          x: cx + p.x * w,
          y: cy + p.y * h,
        })
      }
      return out
    }

    function drawFaceSource(open: number) {
      const ctx = sourceCtx
      const sw = source.width
      const sh = source.height
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, sw, sh)

      const sx = sw / width
      const sy = sh / height
      ctx.setTransform(sx, 0, 0, sy, 0, 0)
      ctx.strokeStyle = '#fff'
      ctx.fillStyle = '#fff'
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const fw = face.w
      const fh = face.h
      const leftR = fw * 0.148
      const rightR = fw * 0.141
      const stroke = fw * 0.054
      const pupilR = fw * 0.045
      const shiftX = reduced ? 0 : headX * fw * 0.022
      const shiftY = reduced ? 0 : headY * fh * 0.03
      const turn = reduced ? 0 : headX * 0.05

      ctx.translate(face.cx + shiftX, face.cy + shiftY)
      ctx.rotate(turn)

      const leftC = { x: -fw * 0.322, y: -fh * 0.055 }
      const rightC = { x: fw * 0.326, y: -fh * 0.05 }

      ctx.lineWidth = stroke

      const eyeOpen = 0.12 + open * 0.88
      strokeClosed(ctx, placeRing(leftEye, leftC.x, leftC.y, leftR, eyeOpen))
      strokeClosed(ctx, placeRing(rightEye, rightC.x, rightC.y, rightR, eyeOpen))

      if (open > 0.28) {
        const restLX = -leftR * 0.36
        const restRX = rightR * 0.36
        const restY = leftR * 0.05
        const trackX = lookX * leftR * 0.42
        const trackY = lookY * leftR * 0.38 * eyeOpen
        const t = pointerActive || performance.now() < introUntil ? 0.88 : 0.55
        const lx = restLX * (1 - t) + trackX
        const rx = restRX * (1 - t) + trackX
        const ly = restY * (1 - t) + trackY
        const ry = restY * (1 - t) + trackY

        fillClosed(ctx, placeRing(leftPupil, leftC.x + lx, leftC.y + ly, pupilR, 1))
        fillClosed(ctx, placeRing(rightPupil, rightC.x + rx, rightC.y + ry, pupilR * 0.96, 1))
      }

      ctx.lineWidth = stroke * 0.94
      strokeOpen(ctx, placeW(mouth, fw * 0.006, fh * 0.02, fw * 0.22, fh * 0.4))
    }

    function paintDots() {
      drawFaceSource(1 - blink)

      const img = sourceCtx.getImageData(0, 0, source.width, source.height)
      const data = img.data
      const time = performance.now() * 0.001

      sharpCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sharpCtx.clearRect(0, 0, width, height)
      sharpCtx.drawImage(bgCanvas, 0, 0, width, height)

      for (let gy = 0; gy < rows; gy++) {
        const fade = clamp(1 - (gy / rows - 0.48) / 0.46, 0, 1)
        if (fade <= 0.02) continue

        for (let gx = 0; gx < cols; gx++) {
          let sum = 0
          const x0 = gx * srcScale
          const y0 = gy * srcScale
          for (let oy = 0; oy < srcScale; oy++) {
            for (let ox = 0; ox < srcScale; ox++) {
              const i = ((y0 + oy) * source.width + (x0 + ox)) * 4
              sum += data[i]
            }
          }
          const cover = sum / (255 * srcScale * srcScale)
          if (cover < 0.04) continue

          const flicker = reduced ? 1 : 0.95 + 0.05 * Math.sin(time * 2.4 + gx * 0.63 + gy * 1.07)
          const intensity = cover * fade * flicker
          if (intensity < 0.05) continue

          const x = (gx + 0.5) * cell
          const y = (gy + 0.5) * cell
          const radius = cell * (0.22 + intensity * 0.2)
          const idx = intensity >= 1 ? FACE_STEPS - 1 : Math.floor(intensity * FACE_STEPS)

          sharpCtx.beginPath()
          sharpCtx.fillStyle = faceOuter[idx]
          sharpCtx.arc(x, y, radius, 0, Math.PI * 2)
          sharpCtx.fill()

          if (intensity > 0.35) {
            sharpCtx.beginPath()
            sharpCtx.fillStyle = faceInner[idx]
            sharpCtx.arc(x, y, radius * 0.45, 0, Math.PI * 2)
            sharpCtx.fill()
          }
        }
      }

      for (const d of dustCells) {
        const gy = Math.floor(d.y / cell)
        const fade = clamp(1 - (gy / rows - 0.46) / 0.48, 0, 1)
        if (fade <= 0.03) continue
        const shimmer = reduced ? 1 : 0.72 + 0.28 * Math.sin(time * 1.35 + d.n * 9.4)
        const alpha = (d.field + 0.08 * shimmer) * fade
        if (alpha < 0.02) continue
        sharpCtx.beginPath()
        sharpCtx.fillStyle = `hsla(265, 28%, ${42 + d.n * 24}%, ${alpha})`
        sharpCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        sharpCtx.fill()
      }

      bloomCtx.setTransform(1, 0, 0, 1, 0, 0)
      bloomCtx.clearRect(0, 0, bloom.width, bloom.height)
      bloomCtx.drawImage(sharp, 0, 0, sharp.width, sharp.height, 0, 0, bloom.width, bloom.height)
    }

    function startLoop() {
      if (reduced || !visible || !inView || raf) return
      lastT = 0
      raf = requestAnimationFrame(step)
    }

    function stopLoop() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    function step(now: number) {
      const dt = lastT ? clamp((now - lastT) / 1000, 0.001, 0.034) : 0.016
      lastT = now

      if (pointerActive && now - lastPointer > 2200) {
        pointerActive = false
        nextSaccade = now + 400
      }

      if (pointerActive) {
        screenToLook(pointerX, pointerY)
      } else if (!reduced && now > introUntil && now > nextSaccade) {
        if (Math.random() < 0.28) {
          targetX = 0
          targetY = 0
        } else {
          pickIdleTarget()
        }
        nextSaccade = now + 900 + Math.random() * 2600
      }

      const dist = Math.hypot(targetX - lookX, targetY - lookY)
      const eyeK = 1 - Math.exp(-dt * (dist > 0.4 ? 16 : 7))
      lookX += (targetX - lookX) * eyeK
      lookY += (targetY - lookY) * eyeK

      const headK = 1 - Math.exp(-dt * (dist > 0.4 ? 7 : 3.4))
      headX += (targetX - headX) * headK
      headY += (targetY - headY) * headK

      if (!reduced) {
        if (now > nextBlink && blink === 0 && !blinkClosing) {
          blinkClosing = true
        }
        if (blinkClosing) {
          blink = clamp(blink + dt * 13, 0, 1)
          if (blink >= 1) {
            blinkClosing = false
            scheduleBlink(now)
          }
        } else if (blink > 0) {
          blink = clamp(blink - dt * 9, 0, 1)
        }
      }

      paintDots()

      if (!reduced && visible && inView) {
        raf = requestAnimationFrame(step)
      } else {
        raf = 0
      }
    }

    function onPointer(e: PointerEvent) {
      if (e.pointerType === 'touch') return
      pointerX = e.clientX
      pointerY = e.clientY
      lastPointer = performance.now()
      pointerActive = true
      introUntil = 0
    }

    function onVisibility() {
      visible = document.visibilityState === 'visible'
      if (visible) startLoop()
      else stopLoop()
    }

    function onReduceChange() {
      syncReduced()
      if (reduced) {
        stopLoop()
        blink = 0
        lookX = 0
        lookY = 0
        headX = 0
        headY = 0
        targetX = 0
        targetY = 0
        paintDots()
      } else if (visible && inView) {
        startLoop()
      }
    }

    function onScroll() {
      syncRect()
    }

    function onIntersect(entries: IntersectionObserverEntry[]) {
      inView = entries[0].isIntersecting
      if (inView) {
        syncRect()
        if (!reduced) paintDots()
        startLoop()
      } else {
        stopLoop()
      }
    }

    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) paintDots()
    })
    ro.observe(wrap)

    const io = new IntersectionObserver(onIntersect, { threshold: 0 })
    io.observe(wrap)

    resize()
    scheduleBlink(performance.now() + 800)
    nextSaccade = performance.now() + 1400
    introUntil = reduced ? 0 : performance.now() + 1100

    let introTimer = 0
    if (!reduced) {
      introTimer = window.setTimeout(() => {
        if (!pointerActive) {
          targetX = 0
          targetY = -0.16
        }
      }, 420)
    } else {
      lookX = 0
      lookY = 0
      headX = 0
      headY = 0
    }

    paintDots()

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    reduceMq.addEventListener('change', onReduceChange)

    if (!reduced) raf = requestAnimationFrame(step)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      if (introTimer) window.clearTimeout(introTimer)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      reduceMq.removeEventListener('change', onReduceChange)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="owo-grid pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={sharpRef} className="owo-grid-sharp absolute inset-0 size-full" />
      <canvas ref={bloomRef} className="owo-grid-bloom absolute inset-0 size-full" />
    </div>
  )
}
