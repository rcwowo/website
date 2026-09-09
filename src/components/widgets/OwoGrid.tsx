import { useEffect, useRef } from 'react'

type Pt = { x: number; y: number }
type Dot = { x: number; y: number; r: number }
type Grain = { x: number; y: number; r: number; field: number; n: number; fade: number; dust: boolean }

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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOutCubic(t: number) {
  const x = clamp(t, 0, 1)
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

function easeInCubic(t: number) {
  const x = clamp(t, 0, 1)
  return x * x * x
}

function easeOutQuart(t: number) {
  const x = 1 - clamp(t, 0, 1)
  return 1 - x * x * x * x
}

function wrapAngle(d: number) {
  if (d > Math.PI) return d - Math.PI * 2
  if (d < -Math.PI) return d + Math.PI * 2
  return d
}

function jitteredSpiral(turns: number, n: number, seed: number, amp: number) {
  const rand = mulberry32(seed)
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1)
    const a = u * turns * Math.PI * 2
    const rr = 0.14 + u * 0.86
    const j = (rand() - 0.5) * 2 * amp
    pts.push({
      x: Math.cos(a) * (rr + j),
      y: Math.sin(a) * (rr + j),
    })
  }
  return pts
}

function hash2(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

const FACE_ASPECT = 465 / 203
const FACE_STEPS = 16
const BLOOM_SCALE = 0.32
const MAX_RENDER_W = 1440
const MAX_RENDER_H = 900
const MAX_COLS = 144
const MAX_ROWS = 90
const STAGE_CELL = 10
const STAGE_FACE_H = 460
const STAGE_FACE_W = STAGE_FACE_H * FACE_ASPECT

type OwoGridMode = 'hero' | 'stage'

export default function OwoGrid({ mode = 'hero' }: { mode?: OwoGridMode }) {
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
    const leftSpiral = jitteredSpiral(2.15, 48, 2718, 0.04)
    const rightSpiral = jitteredSpiral(2.05, 46, 1618, 0.045)
    const mouth = jitteredW(0, 0, 1, 1, 42, 31415, 0.035)

    let width = 0
    let height = 0
    let displayW = 1
    let displayH = 1
    let cell = 12
    let cols = 0
    let rows = 0
    let dpr = 1
    let rectLeft = 0
    let rectTop = 0
    let staticN = new Float32Array(0)
    let grainCells: Grain[] = []
    let source: OffscreenCanvas | HTMLCanvasElement
    let sourceCtx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
    const srcScale = 2
    const grain = document.createElement('canvas')
    const grainContext = grain.getContext('2d', { alpha: true })
    if (!grainContext) return
    const grainCtx = grainContext
    const outerBuckets: Dot[][] = Array.from({ length: FACE_STEPS }, () => [])
    const innerBuckets: Dot[][] = Array.from({ length: FACE_STEPS }, () => [])
    const outerLen = new Uint16Array(FACE_STEPS)
    const innerLen = new Uint16Array(FACE_STEPS)

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

    const stage = mode === 'stage'

    const face = {
      cx: 0,
      cy: 0,
      w: 0,
      h: 0,
    }

    let lookLX = 0
    let lookLY = 0.48
    let lookRX = 0
    let lookRY = 0.48
    let headX = 0
    let headY = 0.48
    let targetLX = 0
    let targetLY = 0.48
    let targetRX = 0
    let targetRY = 0.48
    let blink = 0
    let blinkClosing = false
    let nextBlink = Number.POSITIVE_INFINITY
    let nextSaccade = 0
    let lastPointer = 0
    let pointerActive = false
    let pointerArmed = false
    let pointerOriginX = NaN
    let pointerOriginY = NaN
    let pointerX = 0
    let pointerY = 0
    let introUntil = 0
    let wakeOpen = 0
    let wakeOpenR = 0
    let wakeStage = 0
    let wakeHold = 0
    let wakeFrom = 0
    let wakeGoal = 0
    let wakeDur = 1
    let wakeT0 = 0
    let startedAt = 0
    let dizzyAmt = 0
    let dizzyUntil = 0
    let dizzyCoolUntil = 0
    let dizzyRecover = 0
    let recoverHold = 0
    let pendingRX = 0
    let pendingRY = 0
    let pendingRAt = 0
    let lastSpinAngle = NaN
    let lastSpinAt = 0
    let spinTurns = 0
    let spinSign = 0
    let visible = true
    let inView = true
    let reduced = false
    let raf = 0
    let fallback = 0
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

    function stageScale() {
      return Math.min((width * 0.7) / STAGE_FACE_W, (height * 0.7) / STAGE_FACE_H)
    }

    function screenToSimX(sx: number) {
      return (sx - rectLeft) * (width / displayW)
    }

    function screenToSimY(sy: number) {
      return (sy - rectTop) * (height / displayH)
    }

    function measureFace() {
      if (stage) {
        const scale = stageScale()
        face.w = STAGE_FACE_W * scale
        face.h = STAGE_FACE_H * scale
        face.cx = width * 0.5
        face.cy = height * 0.5
        return
      }

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

    function resize() {
      const rect = wrap.getBoundingClientRect()
      displayW = Math.max(1, rect.width)
      displayH = Math.max(1, rect.height)
      const cap = Math.min(1, MAX_RENDER_W / displayW, MAX_RENDER_H / displayH)
      width = displayW * cap
      height = displayH * cap
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      if (stage) {
        cell = Math.max(0.5, STAGE_CELL * stageScale())
        cols = Math.max(8, Math.ceil(width / cell))
        rows = Math.max(8, Math.ceil(height / cell))
      } else {
        cell = width < 640 ? 12 : 10
        cols = Math.max(8, Math.round(width / cell))
        rows = Math.max(8, Math.round(height / cell))
        cell = width / cols
      }
      if (cols > MAX_COLS) {
        cols = MAX_COLS
        cell = width / cols
        rows = Math.max(8, Math.ceil(height / cell))
      }
      if (rows > MAX_ROWS) {
        rows = MAX_ROWS
        cell = height / rows
        cols = Math.max(8, Math.ceil(width / cell))
      }

      sharp.width = Math.floor(width * dpr)
      sharp.height = Math.floor(height * dpr)
      sharp.style.width = `${displayW}px`
      sharp.style.height = `${displayH}px`
      sharpCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

      bloom.width = Math.max(1, Math.ceil(sharp.width * BLOOM_SCALE))
      bloom.height = Math.max(1, Math.ceil(sharp.height * BLOOM_SCALE))
      bloom.style.width = `${displayW}px`
      bloom.style.height = `${displayH}px`
      bloomCtx.setTransform(1, 0, 0, 1, 0, 0)

      source.width = cols * srcScale
      source.height = rows * srcScale

      staticN = new Float32Array(cols * rows)
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          staticN[gy * cols + gx] = hash2(gx + 3, gy + 11)
        }
      }

      grainCells = []
      for (let gy = 0; gy < rows; gy++) {
        const fade = stage ? 1 : clamp(1 - (gy / rows - 0.46) / 0.48, 0, 1)
        if (fade <= 0.03) continue
        for (let gx = 0; gx < cols; gx++) {
          const n = staticN[gy * cols + gx]
          const field = 0.045 + n * 0.04
          const dust = n > 0.88
          if (!dust && field * fade < 0.02) continue
          grainCells.push({
            x: (gx + 0.5) * cell,
            y: (gy + 0.5) * cell,
            r: cell * (0.12 + n * 0.09),
            field,
            n,
            fade,
            dust,
          })
        }
      }

      grain.width = Math.max(1, Math.floor(width * dpr))
      grain.height = Math.max(1, Math.floor(height * dpr))
      grainCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      grainCtx.clearRect(0, 0, width, height)
      for (const g of grainCells) {
        const extra = g.dust ? 0.058 : 0
        const alpha = (g.field + extra) * g.fade
        if (alpha < 0.018) continue
        grainCtx.beginPath()
        grainCtx.fillStyle = `hsla(265, 28%, ${42 + g.n * 24}%, ${alpha})`
        grainCtx.arc(g.x, g.y, g.r, 0, Math.PI * 2)
        grainCtx.fill()
      }

      measureFace()
      syncRect()
    }

    function aimFromLocal(x: number, y: number) {
      const sharedX = clamp((x - face.cx) / (face.w * 0.42), -1.15, 1.15)
      const sharedY = clamp((y - face.cy) / (face.h * 0.7), -1.15, 1.15)
      const dist = Math.hypot(x - face.cx, y - face.cy)
      const near = clamp(1 - dist / (face.w * 1.15), 0, 1)
      const conv = 0.07 + near * 0.18
      return {
        lx: clamp(sharedX + conv, -1.15, 1.15),
        ly: sharedY,
        rx: clamp(sharedX - conv, -1.15, 1.15),
        ry: sharedY,
      }
    }

    function lookAtLocal(x: number, y: number) {
      const aim = aimFromLocal(x, y)
      targetLX = aim.lx
      targetLY = aim.ly
      if (pointerActive || dizzyRecover === 4) {
        targetRX = aim.rx
        targetRY = aim.ry
        pendingRAt = 0
      } else {
        pendingRX = aim.rx
        pendingRY = aim.ry
        pendingRAt = performance.now() + 28 + Math.random() * 42
      }
    }

    function lookAtScreen(sx: number, sy: number) {
      lookAtLocal(screenToSimX(sx), screenToSimY(sy))
    }

    function setLogoLook() {
      targetLX = -1
      targetLY = 0.06
      targetRX = 1
      targetRY = 0.06
      pendingRAt = 0
    }

    function snapLook() {
      lookLX = targetLX
      lookLY = targetLY
      lookRX = targetRX
      lookRY = targetRY
    }

    function beginWake(now: number, stage: number, from: number, to: number, dur: number) {
      wakeStage = stage
      wakeFrom = from
      wakeGoal = to
      wakeDur = dur
      wakeT0 = now
      wakeOpen = from
    }

    function pickIdleTarget() {
      if (stage) {
        if (Math.random() < 0.45) {
          lookAtScreen(
            window.innerWidth * (0.14 + Math.random() * 0.72),
            window.innerHeight * (0.16 + Math.random() * 0.66),
          )
          return
        }
        const spots: Pt[] = [
          { x: face.cx, y: face.cy + face.h * 0.22 },
          { x: face.cx - face.w * 0.28, y: face.cy - face.h * 0.12 },
          { x: face.cx + face.w * 0.28, y: face.cy - face.h * 0.12 },
        ]
        const pick = spots[Math.floor(Math.random() * spots.length)]
        lookAtLocal(pick.x, pick.y)
        return
      }

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
      lookAtScreen(pick.x, pick.y)
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

    function placeSpiral(unit: Pt[], cx: number, cy: number, r: number, rot: number) {
      const c = Math.cos(rot)
      const s = Math.sin(rot)
      const out: Pt[] = []
      for (const p of unit) {
        out.push({
          x: cx + (p.x * c - p.y * s) * r,
          y: cy + (p.x * s + p.y * c) * r,
        })
      }
      return out
    }

    function startDizzy(now: number) {
      dizzyUntil = now + 3600
      dizzyCoolUntil = now + 11000
      dizzyRecover = 0
      spinTurns = 0
      spinSign = 0
      lastSpinAngle = NaN
      pointerActive = false
    }

    function noteSpin(now: number) {
      if (reduced || wakeStage < 5 || now < dizzyCoolUntil || dizzyAmt > 0.2 || dizzyRecover > 0) return

      const localX = screenToSimX(pointerX)
      const localY = screenToSimY(pointerY)
      const dx = localX - face.cx
      const dy = localY - face.cy
      const dist = Math.hypot(dx, dy)
      const maxDist = Math.max(face.w * 1.4, 260 * (width / displayW))
      if (dist < face.w * 0.1 || dist > maxDist) {
        lastSpinAngle = NaN
        return
      }

      const angle = Math.atan2(dy, dx)
      if (Number.isNaN(lastSpinAngle)) {
        lastSpinAngle = angle
        lastSpinAt = now
        return
      }

      const d = wrapAngle(angle - lastSpinAngle)
      lastSpinAngle = angle
      const gap = now - lastSpinAt
      lastSpinAt = now
      if (gap > 420) {
        spinTurns = 0
        spinSign = 0
        return
      }

      spinTurns *= Math.exp(-gap * 0.00065)
      const sign = d < 0 ? -1 : 1
      if (spinSign !== 0 && sign !== spinSign && Math.abs(d) > 0.14) {
        spinTurns *= 0.2
      }
      if (Math.abs(d) > 0.08) spinSign = sign
      spinTurns += d / (Math.PI * 2)

      if (Math.abs(spinTurns) >= 2.7) startDizzy(now)
    }

    function drawFaceSource() {
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
      const now = performance.now()
      const dizz = reduced ? 0 : dizzyAmt
      const avgLookX = (lookLX + lookRX) * 0.5
      const shiftX = reduced ? 0 : headX * fw * 0.022 + dizz * Math.sin(now * 0.01) * fw * 0.012
      const shiftY = reduced ? 0 : headY * fh * 0.03
      const turn = reduced ? 0 : avgLookX * 0.05 + dizz * Math.sin(now * 0.013) * 0.07

      ctx.translate(face.cx + shiftX, face.cy + shiftY)
      ctx.rotate(turn)

      const leftC = { x: -fw * 0.322, y: -fh * 0.055 }
      const rightC = { x: fw * 0.326, y: -fh * 0.05 }

      ctx.lineWidth = stroke

      const leftAmt = wakeOpen * (1 - blink)
      const rightAmt = wakeOpenR * (1 - blink)
      const leftEyeOpen = 0.07 + leftAmt * (0.93 - dizz * 0.14)
      const rightEyeOpen = 0.07 + rightAmt * (0.93 - dizz * 0.14)
      strokeClosed(ctx, placeRing(leftEye, leftC.x, leftC.y, leftR, leftEyeOpen))
      strokeClosed(ctx, placeRing(rightEye, rightC.x, rightC.y, rightR, rightEyeOpen))

      let lx = lookLX * leftR * 0.48
      let ly = lookLY * leftR * 0.38 * leftEyeOpen
      let rx = lookRX * rightR * 0.48
      let ry = lookRY * rightR * 0.38 * rightEyeOpen

      if (dizz > 0.08) {
        const spin = now * 0.0088 * (0.5 + dizz)
        const rad = leftR * (0.16 + dizz * 0.2)
        lx = Math.cos(spin) * rad
        ly = Math.sin(spin) * rad * leftEyeOpen
        rx = Math.cos(-spin + 0.85) * rad
        ry = Math.sin(-spin + 0.85) * rad * rightEyeOpen
      }

      if (dizz > 0.28 && leftAmt > 0.22) {
        const rot = now * 0.013
        const sr = pupilR * (1.2 + dizz * 0.28)
        ctx.lineWidth = stroke * 0.4
        strokeOpen(ctx, placeSpiral(leftSpiral, leftC.x + lx, leftC.y + ly, sr, rot))
        ctx.lineWidth = stroke
      } else if (leftAmt > 0.28) {
        fillClosed(ctx, placeRing(leftPupil, leftC.x + lx, leftC.y + ly, pupilR, 1))
      }

      if (dizz > 0.28 && rightAmt > 0.22) {
        const rot = now * 0.013
        const sr = pupilR * (1.2 + dizz * 0.28)
        ctx.lineWidth = stroke * 0.4
        strokeOpen(ctx, placeSpiral(rightSpiral, rightC.x + rx, rightC.y + ry, sr * 0.96, -rot + 0.7))
        ctx.lineWidth = stroke
      } else if (rightAmt > 0.28) {
        fillClosed(ctx, placeRing(rightPupil, rightC.x + rx, rightC.y + ry, pupilR * 0.96, 1))
      }

      ctx.lineWidth = stroke * 0.94
      strokeOpen(ctx, placeW(mouth, fw * 0.006, fh * 0.02, fw * 0.22, fh * 0.4))
    }

    function addDot(buckets: Dot[][], counts: Uint16Array, idx: number, x: number, y: number, r: number) {
      const bucket = buckets[idx]
      const i = counts[idx]
      if (i < bucket.length) {
        const d = bucket[i]
        d.x = x
        d.y = y
        d.r = r
      } else {
        bucket.push({ x, y, r })
      }
      counts[idx] = i + 1
    }

    function fillDots(buckets: Dot[][], counts: Uint16Array, colors: string[]) {
      for (let i = 0; i < FACE_STEPS; i++) {
        const n = counts[i]
        if (!n) continue
        const bucket = buckets[i]
        sharpCtx.fillStyle = colors[i]
        sharpCtx.beginPath()
        for (let j = 0; j < n; j++) {
          const d = bucket[j]
          sharpCtx.moveTo(d.x + d.r, d.y)
          sharpCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        }
        sharpCtx.fill()
      }
    }

    function paintDots() {
      drawFaceSource()

      const img = sourceCtx.getImageData(0, 0, source.width, source.height)
      const data = img.data
      const time = performance.now() * 0.001

      sharpCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sharpCtx.clearRect(0, 0, width, height)
      sharpCtx.drawImage(grain, 0, 0, width, height)

      outerLen.fill(0)
      innerLen.fill(0)

      for (let gy = 0; gy < rows; gy++) {
        const fade = stage ? 1 : clamp(1 - (gy / rows - 0.48) / 0.46, 0, 1)
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

          addDot(outerBuckets, outerLen, idx, x, y, radius)
          if (intensity > 0.35) {
            addDot(innerBuckets, innerLen, idx, x, y, radius * 0.45)
          }
        }
      }

      fillDots(outerBuckets, outerLen, faceOuter)
      fillDots(innerBuckets, innerLen, faceInner)

      bloomCtx.setTransform(1, 0, 0, 1, 0, 0)
      bloomCtx.clearRect(0, 0, bloom.width, bloom.height)
      bloomCtx.filter = 'blur(8px)'
      bloomCtx.drawImage(sharp, 0, 0, sharp.width, sharp.height, 0, 0, bloom.width, bloom.height)
      bloomCtx.filter = 'none'
    }

    function wrapOnScreen() {
      const r = wrap.getBoundingClientRect()
      return r.width > 1 && r.height > 1 && r.bottom > 8 && r.top < window.innerHeight - 8
    }

    function clearSchedule() {
      if (raf) cancelAnimationFrame(raf)
      if (fallback) window.clearTimeout(fallback)
      raf = 0
      fallback = 0
    }

    function schedule() {
      raf = requestAnimationFrame(step)
      fallback = window.setTimeout(() => {
        fallback = 0
        if (!raf) return
        cancelAnimationFrame(raf)
        raf = 0
        step(performance.now())
      }, 28)
    }

    function startLoop() {
      if (reduced || !visible || !inView || raf || fallback) return
      lastT = 0
      schedule()
    }

    function stopLoop() {
      clearSchedule()
    }

    function step(now: number) {
      if (fallback) {
        window.clearTimeout(fallback)
        fallback = 0
      }
      raf = 0
      const dt = lastT ? clamp((now - lastT) / 1000, 0.001, 0.034) : 0.016
      lastT = now

      if (!reduced && wakeStage < 5) {
        if (wakeStage === 0) {
          if (now - startedAt > 580) beginWake(now, 1, 0, 0.52, 720)
        } else if (wakeStage === 1) {
          const u = easeInOutCubic((now - wakeT0) / wakeDur)
          wakeOpen = lerp(wakeFrom, wakeGoal, u)
          if (now - wakeT0 >= wakeDur) {
            wakeOpen = wakeGoal
            wakeStage = 2
            wakeHold = now
          }
        } else if (wakeStage === 2) {
          if (now - wakeHold > 170) beginWake(now, 3, wakeOpen, 0.12, 280)
        } else if (wakeStage === 3) {
          const u = easeInCubic((now - wakeT0) / wakeDur)
          wakeOpen = lerp(wakeFrom, wakeGoal, u)
          if (now - wakeT0 >= wakeDur) {
            wakeOpen = wakeGoal
            beginWake(now, 4, wakeOpen, 1, 700)
          }
        } else if (wakeStage === 4) {
          const u = easeOutQuart((now - wakeT0) / wakeDur)
          wakeOpen = lerp(wakeFrom, wakeGoal, u)
          if (now - wakeT0 >= wakeDur) {
            wakeOpen = 1
            wakeStage = 5
            wakeOpenR = 1
            scheduleBlink(now + 400 + Math.random() * 800)
            nextSaccade = now + 720
            introUntil = now + 180
          }
        }
      }

      if (wakeStage < 5) {
        wakeOpenR += (wakeOpen - wakeOpenR) * (1 - Math.exp(-dt * 7.2))
      } else if (dizzyRecover === 0) {
        wakeOpenR += (wakeOpen - wakeOpenR) * (1 - Math.exp(-dt * 18))
      }

      if (pointerActive && now - lastPointer > 2200) {
        pointerActive = false
        nextSaccade = now + 400
      }

      if (now >= dizzyUntil && dizzyAmt > 0.45 && dizzyRecover === 0) {
        dizzyRecover = 1
        blinkClosing = false
        nextBlink = Number.POSITIVE_INFINITY
      }

      if (dizzyRecover === 0 && now < dizzyUntil) {
        dizzyAmt += (1 - dizzyAmt) * (1 - Math.exp(-dt * 5))
      }

      if (dizzyRecover === 1) {
        blink = clamp(blink + dt * 7.2, 0, 1)
        if (blink >= 1) {
          blink = 1
          dizzyAmt = 0
          dizzyRecover = 2
          recoverHold = now
          lookLX = -0.35 + Math.random() * 0.3
          lookLY = 0.15 + Math.random() * 0.25
          lookRX = 0.2 + Math.random() * 0.45
          lookRY = -0.1 + Math.random() * 0.35
          targetLX = lookLX
          targetLY = lookLY
          targetRX = lookRX
          targetRY = lookRY
        }
      } else if (dizzyRecover === 2) {
        if (now - recoverHold > 100) dizzyRecover = 3
      } else if (dizzyRecover === 3) {
        blink = clamp(blink - dt * 5.2, 0, 1)
        if (blink <= 0) {
          blink = 0
          dizzyRecover = 4
          recoverHold = now
          if (pointerArmed && now - lastPointer < 2800) lookAtScreen(pointerX, pointerY)
          else lookAtLocal(face.cx, face.cy + face.h * 0.18)
          scheduleBlink(now + 700)
        }
      } else if (dizzyRecover === 4) {
        if (now - recoverHold > 680) {
          dizzyRecover = 0
          nextSaccade = now + 900
        }
      }

      if (pendingRAt && now >= pendingRAt) {
        targetRX = pendingRX
        targetRY = pendingRY
        pendingRAt = 0
      }

      if (dizzyRecover === 0 && pointerActive && dizzyAmt < 0.2) {
        lookAtScreen(pointerX, pointerY)
      } else if (
        dizzyRecover === 0 &&
        !reduced &&
        dizzyAmt < 0.15 &&
        now > introUntil &&
        now > nextSaccade
      ) {
        if (!stage && Math.random() < 0.48) {
          setLogoLook()
          nextSaccade = now + 2400 + Math.random() * 2800
        } else {
          pickIdleTarget()
          nextSaccade = now + 900 + Math.random() * 2600
        }
      }

      const lDist = Math.hypot(targetLX - lookLX, targetLY - lookLY)
      const rDist = Math.hypot(targetRX - lookRX, targetRY - lookRY)
      const orientSlow = dizzyRecover === 4 ? 0.55 : 1
      const lK = 1 - Math.exp(-dt * (lDist > 0.4 ? 15 : 6.4) * orientSlow)
      const rK = 1 - Math.exp(-dt * (rDist > 0.4 ? 12.5 : 5.4) * orientSlow)
      lookLX += (targetLX - lookLX) * lK
      lookLY += (targetLY - lookLY) * lK
      lookRX += (targetRX - lookRX) * rK
      lookRY += (targetRY - lookRY) * rK

      const avgTX = (targetLX + targetRX) * 0.5
      const avgTY = (targetLY + targetRY) * 0.5
      const headDist = Math.hypot(avgTX - headX, avgTY - headY)
      const headK = 1 - Math.exp(-dt * (headDist > 0.4 ? 7 : 3.4))
      headX += (avgTX - headX) * headK
      headY += (avgTY - headY) * headK

      if (!reduced && wakeStage >= 5 && dizzyRecover === 0) {
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
        schedule()
      } else {
        clearSchedule()
      }
    }

    function onPointer(e: PointerEvent) {
      if (e.pointerType === 'touch') return
      pointerX = e.clientX
      pointerY = e.clientY
      if (!pointerArmed) {
        if (Number.isNaN(pointerOriginX)) {
          pointerOriginX = pointerX
          pointerOriginY = pointerY
          return
        }
        if (Math.hypot(pointerX - pointerOriginX, pointerY - pointerOriginY) < 8) return
        pointerArmed = true
      }
      const now = performance.now()
      lastPointer = now
      if (wakeStage < 4) beginWake(now, 4, wakeOpen, 1, 500)
      if (dizzyRecover === 0 && dizzyAmt < 0.35) {
        pointerActive = true
        introUntil = 0
      }
      noteSpin(now)
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
        wakeOpen = 1
        wakeOpenR = 1
        wakeStage = 5
        setLogoLook()
        snapLook()
        headX = 0
        headY = 0
        dizzyAmt = 0
        dizzyRecover = 0
        paintDots()
      } else if (visible && inView) {
        startLoop()
      }
    }

    function onScroll() {
      syncRect()
    }

    function onIntersect(entries: IntersectionObserverEntry[]) {
      inView = entries[0].isIntersecting || wrapOnScreen()
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
      if (reduced) {
        paintDots()
        return
      }
      if (visible && wrapOnScreen()) {
        inView = true
        startLoop()
      }
    })
    ro.observe(wrap)

    const io = new IntersectionObserver(onIntersect, { threshold: 0 })
    io.observe(wrap)

    resize()
    startedAt = performance.now()
    nextSaccade = performance.now() + 2800
    introUntil = reduced ? 0 : performance.now() + 2400

    let introTimer = 0
    if (!reduced) {
      const startAim = aimFromLocal(face.cx, face.cy + face.h * 0.28)
      targetLX = startAim.lx
      targetLY = startAim.ly
      targetRX = startAim.rx
      targetRY = startAim.ry
      snapLook()
      introTimer = window.setTimeout(() => {
        if (!pointerActive && wakeStage >= 4) {
          lookAtLocal(face.cx, face.cy - face.h * 0.18)
        }
      }, 1480)
    } else {
      wakeOpen = 1
      wakeOpenR = 1
      wakeStage = 5
      setLogoLook()
      snapLook()
      headX = 0
      headY = 0
    }

    paintDots()
    inView = wrapOnScreen()

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    reduceMq.addEventListener('change', onReduceChange)

    if (!reduced) schedule()

    return () => {
      clearSchedule()
      if (introTimer) window.clearTimeout(introTimer)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      reduceMq.removeEventListener('change', onReduceChange)
    }
  }, [mode])

  return (
    <div
      ref={wrapRef}
      className={
        mode === 'stage'
          ? 'owo-grid owo-grid-stage pointer-events-none absolute inset-0 z-0 overflow-hidden'
          : 'owo-grid pointer-events-none absolute inset-0 z-0 overflow-hidden'
      }
      aria-hidden="true"
    >
      <canvas ref={sharpRef} className="owo-grid-sharp absolute inset-0 size-full" />
      <canvas ref={bloomRef} className="owo-grid-bloom absolute inset-0 size-full" />
    </div>
  )
}
