'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView, useMotionValue, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  ArrowRight, 
  Menu, 
  X, 
  ChevronDown, 
  Target, 
  Zap, 
  Globe, 
  Rocket,
  CheckCircle,
  ArrowUpRight,
  Quote,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Linkedin,
  Twitter,
  Instagram,
  Send,
  Sparkles,
  Crown,
  Gem,
  Star,
  Leaf,
  MessageCircle,
  ChevronRight,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Heart,
  Plus,
  Minus
} from 'lucide-react'

// Logo URL
const LOGO_URL = "https://customer-assets.emergentagent.com/job_strategy-hub-121/artifacts/4s9xy1pp_image.png"

// ─── 1. Custom Gold Cursor + Sound ───
function CustomCursor({ muted }) {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const lastPos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const audioCtxRef = useRef(null)
  const lastSoundTime = useRef(0)
  const mutedRef = useRef(false)

  // Keep mutedRef in sync with prop
  useEffect(() => { mutedRef.current = muted }, [muted])

  // ── Web Audio helpers ──────────────────────────────────
  const getCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtxRef.current
  }

  // Soft tick on movement (very quiet, high-freq click)
  const playMoveTick = () => {
    if (mutedRef.current) return
    const now = performance.now()
    if (now - lastSoundTime.current < 80) return   // throttle: max ~12× per sec
    lastSoundTime.current = now
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.025)
      gain.gain.setValueAtTime(0.018, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.03)
    } catch (_) {}
  }

  // Crisp click on mousedown
  const playClickDown = () => {
    if (mutedRef.current) return
    try {
      const ctx = getCtx()
      // Noise burst for mechanical click feel
      const bufferSize = ctx.sampleRate * 0.04
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1)
      const source = ctx.createBufferSource()
      source.buffer = buffer
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 2400
      filter.Q.value = 0.8
      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      gain.gain.setValueAtTime(0.22, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04)
      source.start(ctx.currentTime)
      source.stop(ctx.currentTime + 0.04)
    } catch (_) {}
  }

  // Soft release on mouseup
  const playClickUp = () => {
    if (mutedRef.current) return
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05)
      gain.gain.setValueAtTime(0.07, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.05)
    } catch (_) {}
  }

  // ── Cursor movement & animation loop ──────────────────
  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const move = (e) => {
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      const speed = Math.sqrt(dx * dx + dy * dy)
      pos.current = { x: e.clientX, y: e.clientY }
      if (speed > 4) {          // only sound on meaningful movement
        playMoveTick()
      }
      lastPos.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mousedown', playClickDown)
    window.addEventListener('mouseup', playClickUp)

    const animate = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12
      dot.style.left = pos.current.x + 'px'
      dot.style.top = pos.current.y + 'px'
      ring.style.left = ringPos.current.x + 'px'
      ring.style.top = ringPos.current.y + 'px'
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    const enter = () => ring.classList.add('cursor-hover')
    const leave = () => ring.classList.remove('cursor-hover')
    document.querySelectorAll('a,button,[role=button]').forEach(el => {
      el.addEventListener('mouseenter', enter)
      el.addEventListener('mouseleave', leave)
    })

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', playClickDown)
      window.removeEventListener('mouseup', playClickUp)
      cancelAnimationFrame(rafRef.current)
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}

// ─── Background Ambient Music (Web Audio API — no files needed) ───
function BackgroundMusic({ cursorMuted, setCursorMuted }) {
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.18)
  const [showVolume, setShowVolume] = useState(false)
  const [initiated, setInitiated] = useState(false)
  const ctxRef = useRef(null)
  const masterRef = useRef(null)
  const nodesRef = useRef([])
  const schedulerRef = useRef(null)
  const nextNoteRef = useRef(0)
  const noteIndexRef = useRef(0)
  const volRef = useRef(0.18)
  const playingRef = useRef(false)

  // Keep volRef/playingRef in sync
  useEffect(() => { volRef.current = volume }, [volume])
  useEffect(() => { playingRef.current = playing }, [playing])

  // D pentatonic scale — elegant, calming, luxury feel
  const NOTES = [293.66, 329.63, 369.99, 415.3, 493.88, 587.33, 659.25, 739.99, 880]
  // Chord pads in D
  const PAD_FREQS = [73.42, 110, 146.83, 185, 220]

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      // Master gain
      const master = ctxRef.current.createGain()
      master.gain.setValueAtTime(0, ctxRef.current.currentTime)
      master.connect(ctxRef.current.destination)
      masterRef.current = master

      // ── Ambient Pad (warm drone) ──
      PAD_FREQS.forEach((freq, i) => {
        const ctx = ctxRef.current
        const osc = ctx.createOscillator()
        const padGain = ctx.createGain()
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        osc.type = i === 0 ? 'triangle' : 'sine'
        osc.frequency.value = freq
        lfo.frequency.value = 0.08 + i * 0.03
        lfoGain.gain.value = freq * 0.003
        lfo.connect(lfoGain)
        lfoGain.connect(osc.frequency)
        padGain.gain.value = i === 0 ? 0.08 : 0.04 - i * 0.006
        osc.connect(padGain)
        padGain.connect(master)
        lfo.start()
        osc.start()
        nodesRef.current.push(osc, lfo)
      })

      // Set initial time for scheduler
      nextNoteRef.current = ctxRef.current.currentTime + 0.5
    }
    return ctxRef.current
  }

  // Play a single piano-like note
  const scheduleNote = (ctx, freq, time) => {
    const osc = ctx.createOscillator()
    const envGain = ctx.createGain()
    // Sine + a bit of triangle for warmth
    osc.type = 'sine'
    osc.frequency.value = freq
    envGain.gain.setValueAtTime(0, time)
    envGain.gain.linearRampToValueAtTime(0.12, time + 0.02)   // attack
    envGain.gain.exponentialRampToValueAtTime(0.04, time + 0.4) // decay
    envGain.gain.exponentialRampToValueAtTime(0.0001, time + 2.2) // release
    osc.connect(envGain)
    envGain.connect(masterRef.current)
    osc.start(time)
    osc.stop(time + 2.2)
  }

  // Melody patterns — arpeggiated slowly
  const PATTERNS = [
    [0, 2, 4, 6, 4, 2],
    [1, 3, 5, 7, 5, 3],
    [0, 4, 6, 8, 6, 4],
    [2, 4, 6, 4, 2, 0],
  ]
  const patRef = useRef(0)
  const patStepRef = useRef(0)

  const scheduler = () => {
    if (!playingRef.current) return
    const ctx = ctxRef.current
    if (!ctx) return
    const lookahead = 0.12      // seconds ahead to schedule
    const scheduleAhead = 0.25

    while (nextNoteRef.current < ctx.currentTime + scheduleAhead) {
      const pat = PATTERNS[patRef.current % PATTERNS.length]
      const noteIdx = pat[patStepRef.current % pat.length]
      scheduleNote(ctx, NOTES[noteIdx], nextNoteRef.current)
      patStepRef.current++
      if (patStepRef.current >= pat.length) {
        patStepRef.current = 0
        patRef.current++
      }
      nextNoteRef.current += 1.6   // interval between notes (1.6s)
    }
    schedulerRef.current = setTimeout(scheduler, lookahead * 1000)
  }

  const startMusic = () => {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    masterRef.current.gain.cancelScheduledValues(ctx.currentTime)
    masterRef.current.gain.linearRampToValueAtTime(volRef.current, ctx.currentTime + 1.5)
    setPlaying(true)
    playingRef.current = true
    nextNoteRef.current = ctx.currentTime + 0.3
    scheduler()
  }

  const stopMusic = () => {
    clearTimeout(schedulerRef.current)
    const ctx = ctxRef.current
    if (ctx && masterRef.current) {
      masterRef.current.gain.cancelScheduledValues(ctx.currentTime)
      masterRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2)
    }
    setPlaying(false)
    playingRef.current = false
  }

  const togglePlay = () => {
    if (!initiated) {
      setInitiated(true)
      startMusic()
    } else if (playing) {
      stopMusic()
    } else {
      startMusic()
    }
  }

  // Volume change handler
  useEffect(() => {
    if (ctxRef.current && masterRef.current && playing) {
      masterRef.current.gain.linearRampToValueAtTime(volume, ctxRef.current.currentTime + 0.3)
    }
  }, [volume])

  // Auto-start on first interaction with page
  useEffect(() => {
    const tryAutoStart = () => {
      if (!initiated) {
        setInitiated(true)
        // Small delay to feel natural
        setTimeout(startMusic, 800)
      }
      window.removeEventListener('click', tryAutoStart)
      window.removeEventListener('keydown', tryAutoStart)
    }
    window.addEventListener('click', tryAutoStart)
    window.addEventListener('keydown', tryAutoStart)
    return () => {
      window.removeEventListener('click', tryAutoStart)
      window.removeEventListener('keydown', tryAutoStart)
      clearTimeout(schedulerRef.current)
    }
  }, [])

  return (
    <div className="fixed bottom-[90px] md:bottom-10 left-6 z-[99985] flex flex-row items-end gap-2 md:gap-3">
      {/* Volume Slider (shown on hover) */}
      <AnimatePresence>
        {showVolume && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 h-[100px] flex flex-col items-center gap-1 glass-premium border border-[#c9a86c]/15 p-3"
          >
            <span className="text-[#c9a86c]/40 text-[9px] tracking-widest uppercase mb-1">Vol</span>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{
                writingMode: 'vertical-lr',
                direction: 'rtl',
                width: '4px',
                height: '70px',
                cursor: 'none',
                accentColor: '#c9a86c',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Music Controls (Ambient) ─── */}
      <div className="relative group">
        {playing && (
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full border border-[#c9a86c]/30"
            style={{ pointerEvents: 'none' }}
          />
        )}
        <button
          onClick={togglePlay}
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
          style={{ cursor: 'none' }}
          title={playing ? 'Pause music' : 'Play ambient music'}
          className={`relative w-9 h-9 md:w-11 md:h-11 flex flex-col items-center justify-center border transition-all duration-500 backdrop-blur-sm ${
            playing
              ? 'border-[#c9a86c]/60 bg-[#c9a86c]/10 text-[#c9a86c]'
              : 'border-[#c9a86c]/20 bg-[#0a0908]/80 text-[#c9a86c]/50 hover:border-[#c9a86c]/40 hover:text-[#c9a86c]/80'
          }`}
        >
          {playing ? (
            <div className="flex items-end gap-[1.5px] h-3 md:h-4">
              {[1, 1.8, 1.2, 2, 0.8].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [1, h, 0.5, h, 1] }}
                  transition={{ duration: 0.8 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-[1.5px] md:w-[2px] bg-[#c9a86c] origin-bottom"
                  style={{ height: '10px' }}
                />
              ))}
            </div>
          ) : (
            <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 2l10 5-10 5V2z" />
            </svg>
          )}
        </button>
      </div>

      {/* ─── Cursor Sound Toggle (Integrated) ─── */}
      <button
        onClick={() => setCursorMuted(m => !m)}
        title={cursorMuted ? 'Unmute cursor' : 'Mute cursor'}
        style={{ cursor: 'none' }}
        className={`w-9 h-9 md:w-11 md:h-11 flex items-center justify-center border backdrop-blur-sm transition-all duration-500 ${
          !cursorMuted 
            ? 'border-[#c9a86c]/40 bg-[#c9a86c]/5 text-[#c9a86c]'
            : 'border-[#c9a86c]/20 bg-[#0a0908]/80 text-[#c9a86c]/40 hover:border-[#c9a86c]/40'
        }`}
      >
        <span className="text-[12px] md:text-[14px]">{cursorMuted ? '🔇' : '🖱️'}</span>
      </button>
    </div>
  )
}

// ─── 2. Scroll Progress Bar ───
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      className="scroll-progress-bar"
      style={{ scaleX, width: '100%' }}
    />
  )
}

// ─── 3. Particle Background (Canvas-based floating gold dust) ───
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -Math.random() * 0.4 - 0.1,
      opacity: Math.random() * 0.4 + 0.1,
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,108,${p.opacity})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.y < -5) p.y = height + 5
        if (p.x < -5) p.x = width + 5
        if (p.x > width + 5) p.x = -5
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="particle-canvas" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

// ─── 15. WhatsApp Floating Button ───
function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919999999999?text=Hi%20House%20of%20Persis%2C%20I%20would%20like%20to%20book%20a%20free%20consultation."
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float fixed bottom-[90px] right-6 w-[52px] h-[52px] bg-[#25D366] rounded-full flex items-center justify-center z-[9990] text-white"
      style={{ boxShadow: '0 4px 20px rgba(37,211,102,0.45)' }}
      title="Chat on WhatsApp"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  )
}

// ─── 10. Mobile Sticky CTA ───
function MobileStickyCTA() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.3 }}
          className="mobile-sticky-cta"
        >
          <div>
            <p className="text-[#f5f0e8] text-xs font-medium tracking-wider">Ready to grow?</p>
            <p className="text-[#c9a86c]/60 text-[10px] uppercase tracking-widest">First session free</p>
          </div>
          <a
            href="#contact"
            onClick={e => { e.preventDefault(); document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }) }}
            className="flex-shrink-0 bg-[#c9a86c] text-[#0a0908] text-xs tracking-widest uppercase px-5 py-3 font-medium"
          >
            Book Now
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── 8. Numbers Banner ───
function NumbersBanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const numbers = [
    { value: 42, suffix: '+', label: 'Success Stories' },
    { value: 94, suffix: '%', label: 'Client Satisfaction' },
    { value: 2, suffix: 'x', label: 'Average Profit Growth' },
    { value: 5, suffix: 'yrs', label: 'Proven Track Record' },
  ]
  return (
    <section ref={ref} className="numbers-banner py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {numbers.map((n, i) => (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <p className="text-4xl md:text-5xl font-light text-[#c9a86c] mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                <AnimatedCounter end={n.value} suffix={n.suffix} />
              </p>
              <p className="text-[#e8dcc8]/40 text-xs tracking-[0.2em] uppercase">{n.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── 9. Social Proof Logos ───
function SocialProofSection() {
  const logos = [
    'Brand Partner', 'StartUp India', 'MSME Certified', 'ISO Aligned', 'Google Verified', 'Meta Partner'
  ]
  return (
    <section className="py-12 border-t border-[#c9a86c]/8 overflow-hidden">
      <div className="container mx-auto px-6 text-center mb-6">
        <p className="text-[#e8dcc8]/25 text-xs tracking-[0.3em] uppercase">Trusted & Recognised By</p>
      </div>
      <div className="flex overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="flex gap-16 items-center whitespace-nowrap"
        >
          {[...logos, ...logos].map((logo, i) => (
            <div key={i} className="flex items-center gap-3 opacity-25 hover:opacity-50 transition-opacity duration-300">
              <div className="w-5 h-5 border border-[#c9a86c]/40 flex items-center justify-center">
                <Award size={10} className="text-[#c9a86c]" />
              </div>
              <span className="text-[#e8dcc8] text-xs tracking-[0.2em] uppercase">{logo}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── 5. Meet the Founder ───
function FounderSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <section id="founder" className="py-32 md:py-40 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a86c]/20 to-transparent" />
      <div className="container mx-auto px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-20 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] overflow-hidden max-w-md">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600"
                alt="Founder of House of Persis"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-transparent opacity-60" />
              <div className="absolute inset-4 border border-[#c9a86c]/20 pointer-events-none" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute -bottom-6 -right-0 glass-premium p-6 max-w-[200px]"
            >
              <p className="text-[#c9a86c] text-xs tracking-widest uppercase mb-1">Founded</p>
              <p className="text-2xl text-[#f5f0e8] font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>2025</p>
              <p className="text-[#e8dcc8]/40 text-xs mt-1">Pune, India</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1 }}
          >
            <span className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-6 block">Meet the Founder</span>
            <h2 className="text-4xl md:text-5xl text-[#f5f0e8] mb-6 font-light leading-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Built on Belief,
              <span className="block italic text-[#c9a86c]/80">Driven by Purpose</span>
            </h2>
            <p className="text-[#e8dcc8]/60 text-lg mb-6 leading-relaxed font-light">
              House of Persis was born from a deep conviction — that every business, no matter its size or stage, 
              deserves world-class strategic guidance. Our founder built this firm on the belief that 
              real growth comes from real partnership.
            </p>
            <p className="text-[#e8dcc8]/50 mb-8 leading-relaxed">
              With years of hands-on experience across industries, our team doesn't just advise — 
              we walk beside you, turning your vision into a blueprint, your blueprint into action, 
              and your action into a legacy that outlasts you.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#c9a86c]/10">
              {[
                { v: '5+', l: 'Years Experience' },
                { v: '42', l: 'Businesses Transformed' },
                { v: '3', l: 'Industries Served' },
              ].map(s => (
                <div key={s.l} className="text-center">
                  <p className="text-2xl text-[#c9a86c] font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{s.v}</p>
                  <p className="text-[#e8dcc8]/40 text-[10px] tracking-wider uppercase">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── 6. FAQ Section ───
function FAQSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [open, setOpen] = useState(null)
  const faqs = [
    { q: 'Is the first consultation really free?', a: 'Yes — absolutely free, no strings attached. The first session is simply an honest conversation about where your business is and where it could go. We believe in earning your trust before you invest a rupee.' },
    { q: 'Do you work with startups or only established businesses?', a: 'Both. We work with businesses at every stage — from those registering for the first time to well-established brands looking to scale. Our approach is always tailored to where you are right now.' },
    { q: 'How long does a strategy engagement take?', a: 'It depends on the scope. A single consultation is 60–90 minutes. A full transformation programme typically runs 3–6 months, with ongoing support as needed. We never rush the process.' },
    { q: 'What industries do you specialise in?', a: 'We have worked across retail, F&B, professional services, e-commerce, and beyond. Our frameworks are industry-agnostic, but we always research your specific market deeply before advising.' },
    { q: 'What makes House of Persis different from other consultants?', a: 'We stay. Most consultants hand you a report and walk away. We implement alongside you, refine as we go, and measure outcomes that actually matter — profit growth and customer satisfaction, not vanity metrics.' },
    { q: 'Can I have an offline consultation if I am not in Pune?', a: 'Offline sessions are currently available for clients based in Pune. For clients outside Pune, we offer equally effective online consultations via video call.' },
  ]
  return (
    <section id="faq" className="py-32 md:py-40 relative" ref={ref}>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a86c]/15 to-transparent" />
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.span variants={fadeInUp} className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-6 block">Questions</motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl text-[#f5f0e8] mb-6 font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Everything You <span className="italic text-[#c9a86c]">Need to Know</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-[#e8dcc8]/50 max-w-xl mx-auto font-light">
            Clear answers to the questions we hear most often.
          </motion.p>
        </motion.div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className="border border-[#c9a86c]/10 overflow-hidden hover:border-[#c9a86c]/25 transition-colors duration-300"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-[#f5f0e8] font-light pr-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }}>
                  <Plus size={16} className="text-[#c9a86c] flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="px-6 pb-6 text-[#e8dcc8]/55 font-light leading-relaxed text-sm border-t border-[#c9a86c]/8 pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── 15. Instagram Feed Section ───
function InstagramSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const posts = [
    { img: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&q=80&w=400', likes: '284' },
    { img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400', likes: '431' },
    { img: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&q=80&w=400', likes: '192' },
    { img: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=400', likes: '378' },
    { img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400', likes: '521' },
    { img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', likes: '267' },
  ]
  return (
    <section className="py-24 relative" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.span variants={fadeInUp} className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-4 block">Follow our journey</motion.span>
          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-3 mb-2">
            <Instagram size={20} className="text-[#c9a86c]" />
            <h2 className="text-2xl text-[#f5f0e8] font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>@houseofpersis</h2>
          </motion.div>
          <motion.p variants={fadeInUp} className="text-[#e8dcc8]/40 text-sm font-light">Strategy insights, business tips & behind the scenes</motion.p>
        </motion.div>
        <div className="instagram-grid max-w-3xl mx-auto">
          {posts.map((p, i) => (
            <motion.a
              key={i}
              href="https://instagram.com/houseofpersis"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-item"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.07, duration: 0.5 }}
            >
              <img src={p.img} alt="Instagram" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              <div className="instagram-overlay">
                <div className="flex items-center gap-2 text-white">
                  <Heart size={16} />
                  <span className="text-sm">{p.likes}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="text-center mt-8">
          <a href="https://instagram.com/houseofpersis" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-[#c9a86c]/20 text-[#c9a86c] hover:bg-[#c9a86c]/10 rounded-none group text-xs tracking-widest uppercase">
              <Instagram size={14} className="mr-2" /> View on Instagram
              <ArrowUpRight size={12} className="ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
}

// 3D Tilt Card Component
function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`perspective-1000 ${className}`}
    >
      <div style={{ transform: "translateZ(50px)" }}>
        {children}
      </div>
    </motion.div>
  )
}

// Animated Counter Component
function AnimatedCounter({ end, suffix = '', duration = 2 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let start = 0
      const increment = end / (duration * 60)
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 1000 / 60)
      return () => clearInterval(timer)
    }
  }, [isInView, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// Parallax Section Component
function ParallaxSection({ children, className = '', speed = 0.5 }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed])

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

// Intro Animation Component
function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState(0)
  
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 300)
    const timer2 = setTimeout(() => setPhase(2), 1200)
    const timer3 = setTimeout(() => setPhase(3), 2200)
    const timer4 = setTimeout(() => setPhase(4), 3000)
    const timer5 = setTimeout(() => onComplete(), 3800)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0908] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase >= 4 ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{ pointerEvents: phase >= 4 ? 'none' : 'auto' }}
    >
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,108,0.08) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Decorative lines */}
      <motion.div
        className="absolute left-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#c9a86c]/30 to-transparent"
        initial={{ width: 0 }}
        animate={{ width: phase >= 2 ? '100%' : 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* Logo and Text Container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Main Logo - H | O with floral elements */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: phase >= 1 ? 1 : 0,
            scale: phase >= 1 ? 1 : 0.8,
          }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.img
            src={LOGO_URL}
            alt="House of Persis"
            className="w-48 h-48 md:w-64 md:h-64 object-contain"
            style={{ filter: 'invert(1) brightness(0.9) sepia(0.3)' }}
            animate={{
              filter: phase >= 2 ? 'invert(1) brightness(1) sepia(0.2)' : 'invert(1) brightness(0.9) sepia(0.3)',
            }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 blur-2xl opacity-20"
            style={{ background: 'radial-gradient(circle, #c9a86c 0%, transparent 70%)' }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Brand Name */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: phase >= 2 ? 1 : 0,
            y: phase >= 2 ? 0 : 30,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-3xl md:text-4xl tracking-[0.4em] text-[#f5f0e8] font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            HOUSE OF PERSIS
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="mt-6 text-[#c9a86c]/70 text-sm tracking-[0.3em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          Strategy & Excellence
        </motion.p>
      </div>

      {/* Loading line */}
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 w-32 h-px bg-[#c9a86c]/20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-[#c9a86c] to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: phase >= 3 ? '100%' : '-100%' }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  )
}

// Navigation Component
function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Legacy', href: '#cases' },
    { name: 'Process', href: '#process' },
    { name: 'Contact', href: '#contact' }
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-card py-3' : 'py-6 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <img 
            src={LOGO_URL} 
            alt="House of Persis" 
            className="h-10 w-10 object-contain"
            style={{ filter: 'invert(1) brightness(0.95) sepia(0.15)' }}
          />
          <span className="text-lg tracking-[0.2em] text-[#f5f0e8] font-light hidden sm:block" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            HOUSE OF PERSIS
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="relative text-[#e8dcc8]/70 hover:text-[#f5f0e8] transition-colors duration-300 text-xs tracking-[0.15em] uppercase line-animation"
            >
              {link.name}
            </a>
          ))}
          <Button 
            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            className="bg-transparent border border-[#c9a86c]/40 text-[#c9a86c] hover:bg-[#c9a86c]/10 hover:border-[#c9a86c] rounded-none px-6 py-5 text-xs tracking-[0.1em] uppercase transition-all duration-300"
          >
            Book Free Consultation
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-[#f5f0e8]"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-card mt-2 mx-4 overflow-hidden border border-[#c9a86c]/10"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-[#e8dcc8]/70 hover:text-[#f5f0e8] transition-colors py-2 text-sm tracking-[0.1em] uppercase"
                >
                  {link.name}
                </a>
              ))}
              <Button className="bg-[#c9a86c]/10 border border-[#c9a86c]/40 text-[#c9a86c] hover:bg-[#c9a86c]/20 rounded-none mt-2">
                Book Consultation
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

// Hero Section
function HeroSection() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.25], [1, 0.9])
  const y = useTransform(scrollYProgress, [0, 0.25], [0, 100])

  return (
    <motion.section
      style={{ opacity }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Elegant Background */}
      <div className="absolute inset-0 bg-[#0a0908]">
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,108,0.05)_0%,transparent_70%)]"></div>
        
        {/* Decorative pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(201,168,108,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,108,0.02)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
        
        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 border border-[#c9a86c]/10 rounded-full"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/4 w-96 h-96 border border-[#c9a86c]/5 rounded-full"
        />
      </div>

      <motion.div style={{ y, scale }} className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Decorative element */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-[#c9a86c]/50 to-transparent"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="inline-flex items-center gap-3 border border-[#c9a86c]/20 px-6 py-3 mb-10"
          >
            <Sparkles size={14} className="text-[#c9a86c]" />
            <span className="text-xs tracking-[0.2em] text-[#c9a86c]/80 uppercase">Elevating Business Excellence</span>
            <Sparkles size={14} className="text-[#c9a86c]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl mb-8 leading-[1.1] font-light"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            <span className="text-[#f5f0e8]">Transforming</span>
            <br />
            <span className="gradient-text italic">Businesses</span>
            <span className="text-[#f5f0e8]"> into</span>
            <br />
            <span className="text-[#f5f0e8]">Legacy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-base md:text-lg text-[#e8dcc8]/60 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            Where strategic excellence meets timeless elegance. We craft bespoke business 
            strategies that elevate brands, inspire growth, and create enduring success.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Button 
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              size="lg" 
              className="bg-[#c9a86c] hover:bg-[#b8956d] text-[#0a0908] rounded-none px-10 py-7 text-xs tracking-[0.15em] uppercase font-medium group"
            >
              Book a Free consultation
              <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={16} />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-[10px] tracking-[0.3em] text-[#c9a86c]/50 uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#c9a86c]/50 to-transparent"></div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

// About Section
function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const stats = [
    { value: 5, suffix: ' ', label: 'Years of Experience' },
    { value: 42, suffix: ' ', label: 'Success Stories' },
    { value: 94, suffix: '%', label: 'Client Satisfaction' },
    { value: 2, suffix: 'x', label: 'Increase in Profit' }
  ]

  return (
    <section id="about" className="py-32 md:py-40 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a86c]/20 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c9a86c]/[0.02] to-transparent"></div>
      
      <div className="container mx-auto px-6">
        {/* PART 1: Introduction */}
        <div ref={ref} className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          {/* Primary Image */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <TiltCard>
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800"
                  alt="House of Persis Consultant"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-transparent opacity-60"></div>
                <div className="absolute inset-4 border border-[#c9a86c]/20 pointer-events-none"></div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Content side 1 */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-6 block">What we do at house of persis?</span>
            <h2 className="text-4xl md:text-5xl text-[#f5f0e8] mb-8 leading-tight font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Closing the gap between
              <span className="block text-[#c9a86c]/80 italic">Ambition & Roadmap</span>
            </h2>
            <p className="text-[#e8dcc8]/60 text-lg mb-6 leading-relaxed font-light">
              Most businesses have ambition to grow. Few have a roadmap. At House of Persis, we close that gap - 
              walking alongside you from your very first step to the moment your business becomes a name that outlasts you.
            </p>
            <p className="text-[#e8dcc8]/50 mb-10 leading-relaxed">
              Whether you're starting from scratch or scaling an established brand, we bring structure to your 
              vision and strategy to your growth. From company registration and brand positioning to digital 
              marketing, franchise expansion, and financial clarity - we handle the full spectrum of your 
              business transformation.
            </p>
          </motion.div>
        </div>

        {/* PART 2: Why Choose & Our Story with Second Image */}
        <div className="grid lg:grid-cols-2 gap-20 items-start mb-32 border-t border-[#c9a86c]/5 pt-32">
          {/* Content Side 2 (Why Choose & Our Story) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-2 lg:order-1"
          >
            <span className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-6 block">Why choose house of persis?</span>
            <p className="text-[#e8dcc8]/60 text-lg mb-6 leading-relaxed font-light font-bold">
              Because good advice is common. A growth partner is rare.
            </p>
            <p className="text-[#e8dcc8]/50 mb-10 leading-relaxed">
              In a world full of consultants who hand you a report and walk away, House of Persis is different. 
              We stay. We strategise, implement, refine, and grow - with you, not just for you. 
              We work with you from end to end. From day one of your business to the day it runs without you. 
              We tailor every strategy according to your business needs, not just copy pasting what works 
              for other businesses. We measure what matters. Not the likes on your social media post, 
              but the profit growth and customer satisfaction.
            </p>

            <span className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-6 block">Our Story</span>
            <p className="text-[#e8dcc8]/50 mb-10 leading-relaxed">
              House of Persis was founded in 2025 with a single, unwavering belief - that every business, regardless of size or stage, deserves the kind of strategic guidance once reserved for the elite. We help businesses start from scratch, right from registration to turning it into a legacy that runs for generations. We don’t just advise - we walk the path of business with you as your growth partner. Our approach is unique. We combine years of knowledge, expertise and experience to fulfill your business expectations.
            </p>
          </motion.div>

          {/* Secondary Visual Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="order-1 lg:order-2"
          >
            <TiltCard>
              <div className="relative aspect-[3/2] overflow-hidden grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-1000">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                  alt="Premium Strategy Meeting"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#0a0908]/20 group-hover:bg-transparent transition-colors duration-700"></div>
                <div className="absolute inset-0 border border-[#c9a86c]/10 m-3"></div>
              </div>
            </TiltCard>
          </motion.div>
        </div>

        {/* PART 3: Conclusion with Our Goal & Badge */}
        <div className="max-w-4xl mx-auto border-t border-[#c9a86c]/10 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-12 p-10 border border-[#c9a86c]/20 bg-[#c9a86c]/5 relative group">
                <div className="absolute -top-3 -left-3 w-6 h-6 border-t border-l border-[#c9a86c]"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b border-r border-[#c9a86c]"></div>
                
                <span className="text-[#c9a86c] text-xs tracking-[0.4em] uppercase mb-6 block">Our Ultimate Goal</span>
                <p className="text-3xl md:text-5xl text-[#f5f0e8] font-light italic mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    "Top 1% global consultants in the next 10 years"
                </p>

                {/* Final seal of quality */}
                <div className="flex flex-col items-center gap-4 mt-10">
                  <div className="w-16 h-16 border border-[#c9a86c]/30 rounded-full flex items-center justify-center p-3">
                    <Crown className="text-[#c9a86c]" size={32} />
                  </div>
                  <div>
                    <p className="text-2xl font-light text-[#f5f0e8]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Top 1%</p>
                    <p className="text-[#c9a86c]/60 text-[10px] tracking-widest uppercase">Global Consultants</p>
                  </div>
                </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

// Services Section
function ServicesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const services = [
    {
      icon: Target,
      title: 'Digital Marketing',
      description: "We build data-led digital marketing strategies that don't just drive traffic - they drive the right people to your brand, at the right moment, with the right message.",
      features: ['SEO & SEM', 'Social Strategy', 'Content Performance', 'Data Analytics']
    },
    {
      icon: Gem,
      title: 'Brand Elevation',
      description: 'Transform your brand presence with sophisticated positioning that commands attention and builds legacy.',
      features: ['Brand Identity', 'Premium Positioning', 'Visual Storytelling', 'Market Authority']
    },
    {
      icon: Globe,
      title: 'Franchise Module',
      description: 'Ready to grow beyond your first location? We help you navigate Indian markets with confidence through our battle-tested expansion strategies.',
      features: ['Scalability Audit', 'Market Entry', 'Franchise Operations', 'Growth roadmap']
    },
    {
      icon: Star,
      title: 'Offline Marketing',
      description: 'Because the real world still matters. We design and execute offline marketing strategies that create genuine human connection and lasting brand recall.',
      features: ['Event Activation', 'Print Media', 'Community Engagement', 'Physical Presence']
    },
    {
      icon: MessageCircle,
      title: 'Website/Social Media Management',
      customContent: (
        <div className="space-y-6 text-[#e8dcc8]/50 font-light mt-4">
          <div>
            <h4 className="text-[#c9a86c] text-lg mb-2 font-medium flex items-center gap-2">
              Create your own website 
              <span className="text-[10px] uppercase tracking-wider opacity-60 cursor-pointer hover:underline mb-0">View more</span>
            </h4>
            <p className="mb-3 text-sm">Your website is the first handshake your business makes. We make sure it leaves a lasting impression — beautifully designed, strategically built, and impossible to forget.</p>
            <div className="bg-[#c9a86c]/5 border border-[#c9a86c]/20 p-4 mt-2 mb-4">
              <p className="mb-2 italic text-[#f5f0e8] text-sm">Get your website custom made starting from 6999</p>
              <button 
                onClick={(e) => { e.stopPropagation(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }} 
                className="text-xs tracking-wider text-[#c9a86c] hover:text-[#f5f0e8] uppercase underline underline-offset-4"
              >
                Book your free consultation
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-[#c9a86c] text-lg mb-2 font-medium">Social Media Management</h4>
            <p className="text-sm">In a world that never stops scrolling, consistency is everything. We craft content, manage communities, and build social strategies that keep your brand at the top of every feed.</p>
          </div>
        </div>
      )
    },
    {
      icon: TrendingUp,
      title: 'Elevated Marketing',
      customContent: (
        <div className="space-y-6 text-[#e8dcc8]/50 font-light mt-4">
          <div>
            <h4 className="text-[#c9a86c] text-lg mb-2 font-medium flex items-center gap-2">
              Performance Marketing 
              <span className="text-[10px] uppercase tracking-wider opacity-60 cursor-pointer hover:underline mb-0">View more</span>
            </h4>
            <p className="text-sm">Social media gets you the views and makes you visible but if you want those views to turn into leads, then choose performance marketing.</p>
          </div>
          <div>
            <h4 className="text-[#c9a86c] text-lg mb-2 font-medium flex items-center gap-2">
              Guerilla Marketing 
              <span className="text-[10px] uppercase tracking-wider opacity-60 cursor-pointer hover:underline mb-0">View more</span>
            </h4>
            <p className="text-sm">The most effective way for customers to interact with your business and turn customers into lifelong advocates.</p>
          </div>
        </div>
      )
    },
    {
      icon: Award,
      title: 'One step solution for your business',
      fullWidth: true,
      centered: true,
      customContent: (
        <div className="text-center space-y-4 py-6 mt-4 flex flex-col items-center">
          <p className="text-xl md:text-2xl text-[#c9a86c] italic font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Right from registering your business</p>
          <div className="w-px h-8 bg-gradient-to-b from-[#c9a86c]/50 to-transparent my-2"></div>
          <p className="text-xl md:text-2xl text-[#f5f0e8] font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>To making your business grow</p>
          <div className="w-px h-8 bg-gradient-to-b from-[#c9a86c]/50 to-transparent my-2"></div>
          <p className="text-xl md:text-2xl text-[#c9a86c] italic font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>To execute all the plans</p>
          <div className="w-px h-8 bg-gradient-to-b from-[#c9a86c]/50 to-transparent my-2"></div>
          <p className="text-xl md:text-2xl text-[#f5f0e8] font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Turning your dreams into reality</p>
        </div>
      )
    }
  ]

  return (
    <section id="services" className="py-32 md:py-40 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a86c]/20 to-transparent"></div>
      
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center mb-20"
        >
          <motion.span variants={fadeInUp} className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-6 block">Services</motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl text-[#f5f0e8] mb-6 font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Crafted for <span className="italic text-[#c9a86c]">Excellence</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-[#e8dcc8]/50 max-w-2xl mx-auto text-lg font-light">
            Exclusive consulting services designed for discerning leaders
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              variants={fadeInUp}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={service.fullWidth ? "md:col-span-2 flex justify-center" : ""}
            >
              <TiltCard className={`h-full ${service.fullWidth ? 'w-full lg:w-3/4' : 'w-full'}`}>
                <Card className="bg-transparent border-[#c9a86c]/10 hover:border-[#c9a86c]/30 transition-all duration-700 h-full overflow-hidden group">
                  <CardContent className="p-10">
                    <div className={`flex ${service.centered ? 'flex-col items-center text-center' : 'items-start'} gap-6`}>
                      <motion.div
                        animate={{ rotate: hoveredIndex === index ? 360 : 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="w-16 h-16 border border-[#c9a86c]/30 flex items-center justify-center flex-shrink-0 group-hover:bg-[#c9a86c]/10 transition-colors duration-500"
                      >
                        <service.icon className="text-[#c9a86c]" size={28} />
                      </motion.div>
                      <div className={`flex-1 ${service.centered ? 'w-full flex flex-col items-center' : ''}`}>
                        <h3 className="text-2xl text-[#f5f0e8] mb-4 font-light group-hover:text-[#c9a86c] transition-colors duration-500" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                          {service.title}
                        </h3>
                        {service.customContent ? service.customContent : (
                          <>
                            <p className="text-[#e8dcc8]/50 mb-6 font-light">
                              {service.description}
                            </p>
                            
                            <AnimatePresence>
                              {hoveredIndex === index && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.4 }}
                                >
                                  <div className="grid grid-cols-2 gap-3 pt-6 border-t border-[#c9a86c]/10">
                                    {service.features?.map((feature) => (
                                      <div key={feature} className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-[#c9a86c]"></div>
                                        <span className="text-xs text-[#e8dcc8]/60 tracking-wide">{feature}</span>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Case Studies Section
function CaseStudiesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const [selectedCase, setSelectedCase] = useState(null)
  const cases = [
    {
      title: 'Company Registration & Start-up',
      category: 'Foundation',
      result: 'Legal Compliance',
      description: 'Navigating the legal intricacies to set your business on firm ground from day one.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
      metrics: [{ label: 'Speed to Market', value: '3 Weeks' }, { label: 'Risk Protection', value: '100%' }],
      fullStory: "Starting a brand is more than just an idea; it’s a legal and structural commitment. For this legacy client, we navigated the entire registration process in just 3 weeks. From securing intellectual property rights to setting up a robust tax framework, we ensured they were protected from future liabilities. Our 'Foundation' module isn't just paperwork—it’s the architectural blueprint for a business that never collapses. We handle the complexity so you can focus on the vision."
    },
    {
      title: 'Franchise Expansion Model',
      category: 'Growth',
      result: 'Scalable Growth',
      description: 'Developing battle-tested franchise modules to expand your presence across the nation.',
      image: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&q=80&w=800',
      metrics: [{ label: 'Potential Locations', value: '50+' }, { label: 'Revenue/Unit', value: '+35%' }],
      fullStory: "Scaling a business requires a repeatable, profitable formula. We developed a comprehensive Franchise expansion module that standardized operations, branding, and customer experience. By optimizing unit economics, we increased individual outlet revenue by 35% while mapping out a roadmap for 50+ locations nationwide. We turn local success stories into national legacies through rigorous systems and unwavering brand standards."
    },
    {
      title: 'Financial Management Fix',
      category: 'Core',
      result: 'Precision Insight',
      description: "Bringing clarity to your numbers so decisions are grounded in insight, not just instinct.",
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
      metrics: [{ label: 'Profit Growth', value: '2x' }, { label: 'Customer Satt.', value: '94%' }],
      fullStory: "Clarity is the ultimate competitive advantage. Many businesses grow based on instinct, which eventually leads to stagnation. We implemented a data-driven financial management system that analyzed cash flow, overheads, and profit margins with surgical precision. We identified hidden 'leaks' that were draining resources and redirected them toward high-ROI initiatives. The result was a 100% (2x) profit growth within 12 months, achieved through clarity and calculated strategy."
    }
  ]

  return (
    <section id="cases" className="py-32 md:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c9a86c]/[0.02] to-transparent"></div>
      
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center mb-20"
        >
          <motion.span variants={fadeInUp} className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-6 block">Legacy</motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl text-[#f5f0e8] mb-6 font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Built to <span className="italic text-[#c9a86c]">Outlast</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-[#e8dcc8]/50 max-w-2xl mx-auto text-lg font-light">
            We handle the full spectrum of your business transformation
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="space-y-12"
        >
          {cases.map((caseStudy, index) => (
            <motion.div
              key={caseStudy.title}
              variants={fadeInUp}
              className="group"
            >
              <Card className="bg-transparent border-[#c9a86c]/10 hover:border-[#c9a86c]/20 transition-all duration-700 overflow-hidden">
                <CardContent className="p-0">
                  <div className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                    <div className={`relative aspect-video lg:aspect-auto overflow-hidden ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                      <ParallaxSection speed={0.2}>
                        <img
                          src={caseStudy.image}
                          alt={caseStudy.title}
                          className="w-full h-[120%] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                        />
                      </ParallaxSection>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0908]/80 to-transparent lg:bg-gradient-to-t"></div>
                      <div className="absolute top-8 left-8">
                        <span className="border border-[#c9a86c]/30 px-4 py-2 text-xs tracking-wider text-[#c9a86c] uppercase">
                          {caseStudy.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-10 lg:p-16 flex flex-col justify-center">
                      <div className="mb-6">
                        <span className="text-[#c9a86c] text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{caseStudy.result}</span>
                      </div>
                      <h3 className="text-3xl text-[#f5f0e8] mb-4 font-light group-hover:text-[#c9a86c] transition-colors duration-500" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        {caseStudy.title}
                      </h3>
                      <p className="text-[#e8dcc8]/50 mb-8 font-light">{caseStudy.description}</p>
                      
                      <div className="flex gap-12 mb-8">
                        {caseStudy.metrics.map((metric) => (
                          <div key={metric.label}>
                            <p className="text-2xl text-[#f5f0e8] font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{metric.value}</p>
                            <p className="text-[#c9a86c]/50 text-xs tracking-wider uppercase">{metric.label}</p>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={() => setSelectedCase(caseStudy)}
                        variant="outline" 
                        className="border-[#c9a86c]/30 text-[#c9a86c] hover:bg-[#c9a86c]/10 rounded-none w-fit group/btn text-xs tracking-wider uppercase"
                      >
                        View Full Story
                        <ArrowUpRight className="ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Full Story Modal / Overlay */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-6 md:p-12 lg:p-24"
            style={{ cursor: 'none' }}
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a0908]/95 backdrop-blur-xl"
              onClick={() => setSelectedCase(null)}
            />
            
            <motion.div
              layoutId={`case-${selectedCase.title}`}
              className="relative w-full max-w-5xl bg-[#0a0908] border border-[#c9a86c]/20 shadow-2xl overflow-hidden flex flex-col lg:flex-row h-full max-h-[85vh] lg:h-auto"
            >
              <button 
                onClick={() => setSelectedCase(null)}
                className="absolute top-6 right-6 z-10 w-10 h-10 border border-[#c9a86c]/20 flex items-center justify-center text-[#c9a86c] hover:bg-[#c9a86c]/10 transition-all"
              >
                <X size={20} />
              </button>

              {/* Image Side */}
              <div className="lg:w-1/2 relative h-64 lg:h-auto overflow-hidden">
                <img 
                  src={selectedCase.image} 
                  alt={selectedCase.title}
                  className="w-full h-full object-cover grayscale active-glow"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-transparent" />
              </div>

              {/* Content Side */}
              <div className="lg:w-1/2 p-10 md:p-14 overflow-y-auto bg-gradient-to-br from-[#0a0908] to-[#151210]">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-4 block"
                >
                  Legacy | {selectedCase.category}
                </motion.span>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-5xl text-[#f5f0e8] mb-8 font-light leading-tight" 
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  {selectedCase.title}
                </motion.h2>

                <motion.div 
                   initial={{ opacity: 0, scaleX: 0 }}
                   animate={{ opacity: 1, scaleX: 1 }}
                   transition={{ delay: 0.4, duration: 0.6 }}
                   className="w-16 h-px bg-[#c9a86c] mb-8 origin-left"
                />

                <motion.p 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-[#f5f0e8] text-xl mb-10 font-light italic"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  {selectedCase.result}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-6"
                >
                  <p className="text-[#e8dcc8]/70 leading-relaxed font-light text-lg">
                    {selectedCase.fullStory}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-8 pt-10 border-t border-[#c9a86c]/10">
                    {selectedCase.metrics.map((metric, i) => (
                      <div key={i}>
                        <p className="text-3xl text-[#c9a86c] font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{metric.value}</p>
                        <p className="text-[#e8dcc8]/40 text-[10px] tracking-widest uppercase">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-12"
                >
                  <Button 
                    onClick={() => setSelectedCase(null)}
                    className="bg-[#c9a86c] hover:bg-[#b8956d] text-[#0a0908] rounded-none px-8 py-6 h-auto tracking-[0.2em] uppercase text-xs"
                  >
                    Close Story
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// Process Section
function ProcessSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      number: '01',
      title: '7Ps of marketing',
      icon: Sparkles,
      description: 'We audit and optimise every dimension of your marketing mix to ensure your business is built for growth from the inside out.',
      details: ['Product', 'Promotion', 'Price', 'Place', 'People', 'Process', 'Physical Evidence']
    },
    {
      number: '02',
      title: '7 Keys of Business',
      icon: Target,
      description: "We strengthen each pillar so your business isn't just growing - it's built to last.",
      details: ['Strategic planning', 'Marketing & CRM', 'Change & Risk management', 'Market trends & Competitor Analysis', 'Financial management', 'Leadership & Decision Making', 'Organizational structure']
    },
    {
      number: '03',
      title: 'Business Management',
      icon: Leaf,
      description: 'We bring precision and structure to your business fundamentals, so every decision is grounded in insight, not instinct.',
      details: ['Executive summary', 'Company description', 'Product & Services', 'Market Analysis', 'Operations & Strategy', 'Management team', 'Finances']
    },
    {
      number: '04',
      title: 'House of Persis way',
      icon: Crown,
      description: 'Our proprietary approach to transform your brand into a legacy that goes beyond advice.',
      details: ['Research', 'Business Module', 'Marketing Analysis', 'Process', 'Trends & Competitor Analysis', 'Towards the goal']
    }
  ]

  return (
    <section id="process" className="py-32 md:py-40 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a86c]/20 to-transparent"></div>
      
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center mb-20"
        >
          <motion.span variants={fadeInUp} className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-6 block">Process</motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl text-[#f5f0e8] mb-6 font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            The Art of <span className="italic text-[#c9a86c]">Transformation</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-[#e8dcc8]/50 max-w-2xl mx-auto text-lg font-light">
            A refined methodology cultivated through years of excellence
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a86c]/20 to-transparent transform -translate-y-1/2"></div>
          
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={scaleIn}
                onMouseEnter={() => setActiveStep(index)}
                className="relative group"
              >
                <TiltCard>
                  <Card className={`bg-transparent border-[#c9a86c]/10 transition-all duration-700 h-full ${
                    activeStep === index ? 'border-[#c9a86c]/40 glow-gold' : 'hover:border-[#c9a86c]/20'
                  }`}>
                    <CardContent className="p-8">
                      <div className="relative z-10">
                        <span className="text-6xl font-light text-[#c9a86c]/5 absolute -top-4 -left-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                          {step.number}
                        </span>
                        <div className={`w-14 h-14 border flex items-center justify-center mb-6 transition-all duration-500 ${
                          activeStep === index ? 'border-[#c9a86c] bg-[#c9a86c]/10' : 'border-[#c9a86c]/20 group-hover:border-[#c9a86c]/40'
                        }`}>
                          <step.icon className={`${
                            activeStep === index ? 'text-[#c9a86c]' : 'text-[#c9a86c]/60'
                          }`} size={24} />
                        </div>
                        <h3 className="text-xl text-[#f5f0e8] mb-3 font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{step.title}</h3>
                        <p className="text-[#e8dcc8]/50 text-sm mb-6 font-light">{step.description}</p>
                        
                        <AnimatePresence>
                          {activeStep === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.4 }}
                              className="space-y-2"
                            >
                              {step.details.map((detail) => (
                                <div key={detail} className="flex items-center gap-3">
                                  <div className="w-1 h-1 bg-[#c9a86c]"></div>
                                  <span className="text-xs text-[#e8dcc8]/60">{detail}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </TiltCard>
                
                {/* Connection dot */}
                <div className="hidden lg:block absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                    activeStep === index ? 'bg-[#c9a86c]' : 'bg-[#c9a86c]/20'
                  }`}></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Testimonials Section
function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials = [
    {
      quote: "House of Persis brought an elegance to strategy that I'd never experienced. Their approach transformed not just our business, but our entire perspective on what's possible.",
      author: "Victoria Chen",
      role: "Chairman, Chen Holdings",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
    },
    {
      quote: "Working with them felt like engaging with true artisans of business. Every recommendation was thoughtful, precise, and delivered with remarkable care.",
      author: "Sebastian Laurent",
      role: "CEO, Laurent Enterprises",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200"
    },
    {
      quote: "They understood our family's legacy and crafted a future that honors our past while embracing tomorrow. Truly exceptional partners.",
      author: "Isabella Rothwell",
      role: "Principal, Rothwell Family Office",
      image: "https://images.unsplash.com/photo-1585846328761-acbf5a12beea?auto=format&fit=crop&q=80&w=200"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-32 md:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#c9a86c]/[0.02] via-transparent to-[#c9a86c]/[0.02]"></div>
      
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.span variants={fadeInUp} className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-6 block">Testimonials</motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl text-[#f5f0e8] mb-6 font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Words of <span className="italic text-[#c9a86c]">Trust</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative">
            <Quote className="absolute -top-8 left-1/2 -translate-x-1/2 text-[#c9a86c]/10" size={100} />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16"
              >
                <p className="text-2xl md:text-3xl text-[#f5f0e8] font-light leading-relaxed mb-10 italic" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  "{testimonials[activeIndex].quote}"
                </p>
                <div className="flex items-center justify-center gap-5">
                  <img
                    src={testimonials[activeIndex].image}
                    alt={testimonials[activeIndex].author}
                    className="w-14 h-14 object-cover grayscale border border-[#c9a86c]/30"
                  />
                  <div className="text-left">
                    <p className="text-[#f5f0e8] font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{testimonials[activeIndex].author}</p>
                    <p className="text-[#c9a86c]/60 text-xs tracking-wider uppercase">{testimonials[activeIndex].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-4 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-px transition-all duration-500 ${
                  index === activeIndex ? 'w-12 bg-[#c9a86c]' : 'w-6 bg-[#c9a86c]/20 hover:bg-[#c9a86c]/40'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Insights Section
function InsightsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const articles = [
    {
      title: 'The Renaissance of Timeless Business Principles',
      category: 'Strategy',
      date: 'June 12, 2025',
      readTime: '8 min read',
      excerpt: 'How enduring wisdom shapes modern excellence in an ever-evolving marketplace.'
    },
    {
      title: 'Crafting Legacy: Beyond Generational Wealth',
      category: 'Legacy',
      date: 'June 8, 2025',
      readTime: '6 min read',
      excerpt: 'Building enterprises that transcend time through purpose-driven leadership.'
    },
    {
      title: 'The Art of Strategic Patience',
      category: 'Leadership',
      date: 'June 1, 2025',
      readTime: '10 min read',
      excerpt: 'Why the most successful leaders embrace measured progress over hurried growth.'
    }
  ]

  return (
    <section id="insights" className="py-32 md:py-40 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a86c]/20 to-transparent"></div>
      
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-8"
        >
          <div>
            <motion.span variants={fadeInUp} className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-6 block">Insights</motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl text-[#f5f0e8] font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Thoughts & <span className="italic text-[#c9a86c]">Perspectives</span>
            </motion.h2>
          </div>
          <motion.div variants={fadeInUp}>
            <Button variant="outline" className="border-[#c9a86c]/30 text-[#c9a86c] hover:bg-[#c9a86c]/10 rounded-none group text-xs tracking-wider uppercase">
              All Articles
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={14} />
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {articles.map((article) => (
            <motion.article
              key={article.title}
              variants={fadeInUp}
              className="group cursor-pointer"
            >
              <TiltCard className="h-full">
                <Card className="bg-transparent border-[#c9a86c]/10 hover:border-[#c9a86c]/30 transition-all duration-700 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-[#c9a86c] text-xs tracking-wider uppercase">{article.category}</span>
                      <span className="text-[#c9a86c]/30">|</span>
                      <span className="text-[#e8dcc8]/40 text-xs">{article.readTime}</span>
                    </div>
                    <h3 className="text-xl text-[#f5f0e8] mb-4 font-light group-hover:text-[#c9a86c] transition-colors duration-500 line-clamp-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      {article.title}
                    </h3>
                    <p className="text-[#e8dcc8]/50 mb-6 line-clamp-3 font-light text-sm">{article.excerpt}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-[#c9a86c]/10">
                      <span className="text-[#e8dcc8]/40 text-xs">{article.date}</span>
                      <ArrowUpRight className="text-[#c9a86c] opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                    </div>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Contact Section
function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', problems: '', servicesLookingFor: '', timeSlot: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [mode, setMode] = useState('online') // online or offline
  const [inPune, setInPune] = useState(true)
  const [timeSlot, setTimeSlot] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, mode, inPune, timeSlot })
      })
      
      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', phone: '', company: '', problems: '', servicesLookingFor: '', timeSlot: '' })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-32 md:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#c9a86c]/[0.03] via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.span variants={fadeInUp} className="text-[#c9a86c] text-xs tracking-[0.3em] uppercase mb-6 block">Book a consultation</motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl text-[#f5f0e8] mb-6 font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Your First Step Toward <span className="italic text-[#c9a86c]">Legacy Starts Here</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-[#e8dcc8]/50 max-w-2xl mx-auto text-lg font-light mb-8">
            Your first consultation is completely free. Just an honest conversation about where your business is and where it could go.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="p-4 border border-[#c9a86c]/20 bg-[#0a0908] min-w-[200px]">
                <p className="text-[#c9a86c] text-xs uppercase tracking-widest mb-1">1st Consultation</p>
                <p className="text-2xl text-[#f5f0e8] font-light">FREE</p>
            </div>
            <div className="p-4 border border-[#c9a86c]/10 bg-[#0a0908] min-w-[200px]">
                <p className="text-[#c9a86c]/60 text-xs uppercase tracking-widest mb-1">2nd Online</p>
                <p className="text-2xl text-[#f5f0e8] font-light">₹999</p>
            </div>
            <div className="p-4 border border-[#c9a86c]/10 bg-[#0a0908] min-w-[200px]">
                <p className="text-[#c9a86c]/60 text-xs uppercase tracking-widest mb-1">2nd Offline</p>
                <p className="text-2xl text-[#f5f0e8] font-light">₹1799</p>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="flex gap-4 mb-8">
                <button 
                    onClick={() => setMode('online')}
                    className={`flex-1 py-4 text-xs tracking-[0.2em] uppercase border transition-all ${mode === 'online' ? 'bg-[#c9a86c] text-[#0a0908] border-[#c9a86c]' : 'text-[#c9a86c] border-[#c9a86c]/20 hover:border-[#c9a86c]/40'}`}
                >
                    Online
                </button>
                <button 
                    onClick={() => setMode('offline')}
                    className={`flex-1 py-4 text-xs tracking-[0.2em] uppercase border transition-all ${mode === 'offline' ? 'bg-[#c9a86c] text-[#0a0908] border-[#c9a86c]' : 'text-[#c9a86c] border-[#c9a86c]/20 hover:border-[#c9a86c]/40'}`}
                >
                    Offline
                </button>
            </div>

            <Card className="bg-transparent border-[#c9a86c]/10">
              <CardContent className="p-10">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-16 h-16 border border-[#c9a86c]/30 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="text-[#c9a86c]" size={32} />
                    </div>
                    <h3 className="text-2xl text-[#f5f0e8] mb-3 font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Request Sent</h3>
                    <p className="text-[#e8dcc8]/50 font-light">
                        {mode === 'online' 
                            ? "We’ll be in touch with you in the next few hours to confirm your slot via email."
                            : "We’ll be in touch with you in the next few hours to confirm your slot via phone call."}
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <p className="text-[#c9a86c] text-sm italic mb-6">
                        {mode === 'online' ? "Let's have a virtual coffee chat" : "Meet us in person. Let's talk strategy over a coffee"}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-[#e8dcc8]/60 text-xs tracking-wider uppercase">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="bg-transparent border-[#c9a86c]/20 text-[#f5f0e8] placeholder:text-[#e8dcc8]/30 focus:border-[#c9a86c] rounded-none h-12"
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[#e8dcc8]/60 text-xs tracking-wider uppercase">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="bg-transparent border-[#c9a86c]/20 text-[#f5f0e8] placeholder:text-[#e8dcc8]/30 focus:border-[#c9a86c] rounded-none h-12"
                          placeholder="Your phone"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-[#e8dcc8]/60 text-xs tracking-wider uppercase">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="bg-transparent border-[#c9a86c]/20 text-[#f5f0e8] placeholder:text-[#e8dcc8]/30 focus:border-[#c9a86c] rounded-none h-12"
                        placeholder="Your organization"
                      />
                    </div>

                    {mode === 'offline' && (
                        <div className="flex items-center gap-4 p-4 border border-[#c9a86c]/10 bg-[#c9a86c]/5">
                            <Label className="text-[#e8dcc8]/60 text-xs tracking-wider uppercase">Are you based in पुणे (Pune)?</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="pune" 
                                        onChange={() => setInPune(true)} 
                                        checked={inPune}
                                        className="accent-[#c9a86c]"
                                    />
                                    <span className="text-xs text-[#f5f0e8]">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="pune" 
                                        onChange={() => {
                                            setInPune(false);
                                            setMode('online');
                                        }} 
                                        checked={!inPune}
                                        className="accent-[#c9a86c]"
                                    />
                                    <span className="text-xs text-[#f5f0e8]">No</span>
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="problems" className="text-[#e8dcc8]/60 text-xs tracking-wider uppercase">What problems are you facing?</Label>
                      <Textarea
                        id="problems"
                        value={formData.problems || ''}
                        onChange={(e) => setFormData({ ...formData, problems: e.target.value })}
                        required
                        className="bg-transparent border-[#c9a86c]/20 text-[#f5f0e8] placeholder:text-[#e8dcc8]/30 focus:border-[#c9a86c] rounded-none resize-none"
                        placeholder="Describe your challenges"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="services" className="text-[#e8dcc8]/60 text-xs tracking-wider uppercase">What services are you looking for?</Label>
                      <Input
                        id="services"
                        value={formData.servicesLookingFor || ''}
                        onChange={(e) => setFormData({ ...formData, servicesLookingFor: e.target.value })}
                        required
                        className="bg-transparent border-[#c9a86c]/20 text-[#f5f0e8] placeholder:text-[#e8dcc8]/30 focus:border-[#c9a86c] rounded-none h-12"
                        placeholder="e.g. Digital Marketing, Franchise"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[#e8dcc8]/60 text-xs tracking-wider uppercase">Select a time when you are available:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mode === 'online' ? (
                            <button 
                                type="button"
                                onClick={() => setTimeSlot('10.30am-5pm')}
                                className={`p-4 text-xs tracking-widest border transition-all ${timeSlot === '10.30am-5pm' ? 'bg-[#c9a86c]/20 border-[#c9a86c] text-[#f5f0e8]' : 'border-[#c9a86c]/10 text-[#e8dcc8]/40 hover:border-[#c9a86c]/30'}`}
                            >
                                Morning 10.30 am - 5 pm
                            </button>
                        ) : (
                            <>
                                {['10am-1pm', '2pm-5pm', '7pm-9pm'].map((slot) => (
                                    <button 
                                        key={slot}
                                        type="button"
                                        onClick={() => setTimeSlot(slot)}
                                        className={`p-4 text-xs tracking-widest border transition-all ${timeSlot === slot ? 'bg-[#c9a86c]/20 border-[#c9a86c] text-[#f5f0e8]' : 'border-[#c9a86c]/10 text-[#e8dcc8]/40 hover:border-[#c9a86c]/30'}`}
                                    >
                                        {slot === '10am-1pm' ? 'Morning 10 am - 1 pm' : slot === '2pm-5pm' ? 'Afternoon 2 pm - 5 pm' : 'Evening 7 pm - 9 pm'}
                                    </button>
                                ))}
                            </>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || (mode === 'offline' && !inPune)}
                      className="w-full bg-[#c9a86c] hover:bg-[#b8956d] text-[#0a0908] rounded-none py-6 group text-xs tracking-wider uppercase"
                    >
                      {isSubmitting ? 'Scheduling...' : 'Book My Free Consultation'}
                      <Send className="ml-2 group-hover:translate-x-1 transition-transform" size={14} />
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl text-[#f5f0e8] mb-4 font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Let's Talk Strategy</h3>
                <p className="text-[#e8dcc8]/50 leading-relaxed font-light">
                  Whether you're contemplating transformation or ready to begin, 
                  we welcome the opportunity to understand your aspirations and 
                  explore how we might serve your journey.
                </p>
              </div>

              <div className="space-y-6">
                <a href="mailto:hello@houseofpersis.com" className="flex items-center gap-5 text-[#e8dcc8]/60 hover:text-[#f5f0e8] transition-colors group">
                  <div className="w-14 h-14 border border-[#c9a86c]/20 flex items-center justify-center group-hover:border-[#c9a86c]/40 group-hover:bg-[#c9a86c]/5 transition-all">
                    <Mail className="text-[#c9a86c]" size={20} />
                  </div>
                  <span className="font-light">hello@houseofpersis.com</span>
                </a>
                <div className="flex items-center gap-5 text-[#e8dcc8]/60">
                  <div className="w-14 h-14 border border-[#c9a86c]/20 flex items-center justify-center">
                    <MapPin className="text-[#c9a86c]" size={20} />
                  </div>
                  <span className="font-light">Pune (HQ) | Global Coverage</span>
                </div>
              </div>

              <div className="pt-8 border-t border-[#c9a86c]/10">
                <p className="text-[#e8dcc8]/40 mb-4 text-sm font-light italic">
                    "Strategy is not just about making choices; it's about making choices that outlast you."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      setSubscribed(true)
      setEmail('')
    } catch (error) {
      console.error('Error subscribing:', error)
    }
  }

  return (
    <footer className="py-20 border-t border-[#c9a86c]/10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-3 mb-6">
              <img 
                src={LOGO_URL} 
                alt="House of Persis" 
                className="h-12 w-12 object-contain"
                style={{ filter: 'invert(1) brightness(0.95) sepia(0.15)' }}
              />
            </a>
            <p className="text-xl text-[#f5f0e8] mb-2 font-light tracking-wider" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              HOUSE OF PERSIS
            </p>
            <p className="text-[#e8dcc8]/40 mb-8 font-light text-sm">
              Elevating business excellence through timeless strategy.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-[#c9a86c]/20 flex items-center justify-center hover:border-[#c9a86c]/40 hover:bg-[#c9a86c]/5 transition-all">
                <Linkedin className="text-[#c9a86c]/60 hover:text-[#c9a86c]" size={16} />
              </a>
              <a href="#" className="w-10 h-10 border border-[#c9a86c]/20 flex items-center justify-center hover:border-[#c9a86c]/40 hover:bg-[#c9a86c]/5 transition-all">
                <Twitter className="text-[#c9a86c]/60 hover:text-[#c9a86c]" size={16} />
              </a>
              <a href="#" className="w-10 h-10 border border-[#c9a86c]/20 flex items-center justify-center hover:border-[#c9a86c]/40 hover:bg-[#c9a86c]/5 transition-all">
                <Instagram className="text-[#c9a86c]/60 hover:text-[#c9a86c]" size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#f5f0e8] mb-6 text-xs tracking-[0.2em] uppercase">Navigation</h4>
            <ul className="space-y-4">
              {['About', 'Services', 'Legacy', 'Process', 'Contact'].map((link) => (
                <li key={link}>
                  <a href={`#${link === 'Legacy' ? 'cases' : link.toLowerCase()}`} className="text-[#e8dcc8]/50 hover:text-[#c9a86c] transition-colors font-light text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[#f5f0e8] mb-6 text-xs tracking-[0.2em] uppercase">Services</h4>
            <ul className="space-y-4">
              {['Digital Marketing', 'Brand Elevation', 'Franchise Module', 'Offline Marketing'].map((service) => (
                <li key={service}>
                  <a href="#services" className="text-[#e8dcc8]/50 hover:text-[#c9a86c] transition-colors font-light text-sm">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[#f5f0e8] mb-6 text-xs tracking-[0.2em] uppercase">Insights</h4>
            <p className="text-[#e8dcc8]/50 mb-6 font-light text-sm">Receive exclusive strategic insights.</p>
            {subscribed ? (
              <p className="text-[#c9a86c] flex items-center gap-2 text-sm">
                <CheckCircle size={16} /> Subscribed
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="bg-transparent border-[#c9a86c]/20 text-[#f5f0e8] placeholder:text-[#e8dcc8]/30 focus:border-[#c9a86c] rounded-none h-10 text-sm"
                />
                <Button type="submit" className="bg-[#c9a86c] hover:bg-[#b8956d] text-[#0a0908] rounded-none px-4">
                  <ArrowRight size={14} />
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-10 border-t border-[#c9a86c]/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[#e8dcc8]/30 text-xs">
            © 2025 House of Persis. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[#e8dcc8]/30 hover:text-[#c9a86c] text-xs transition-colors">Privacy</a>
            <a href="#" className="text-[#e8dcc8]/30 hover:text-[#c9a86c] text-xs transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main App
export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [contentReady, setContentReady] = useState(false)
  const [cursorMuted, setCursorMuted] = useState(false)

  useEffect(() => {
    const introShown = sessionStorage.getItem('hopIntroShown')
    if (introShown) {
      setShowIntro(false)
      setContentReady(true)
    }
  }, [])

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
    setContentReady(true)
    sessionStorage.setItem('hopIntroShown', 'true')
  }, [])

  return (
    <main className="min-h-screen bg-[#0a0908]" style={{ cursor: 'none' }}>
      {/* Global UX Overlays */}
      <CustomCursor muted={cursorMuted} />
      <ScrollProgressBar />
      <ParticleCanvas />
      <BackgroundMusic cursorMuted={cursorMuted} setCursorMuted={setCursorMuted} />
      <WhatsAppButton />
      <MobileStickyCTA />

      {/* Intro Animation */}
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: contentReady ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <Navigation />
        <HeroSection />
        <SocialProofSection />
        <AboutSection />
        <NumbersBanner />
        <ServicesSection />
        <CaseStudiesSection />
        <FounderSection />
        <ProcessSection />
        <TestimonialsSection />
        <FAQSection />
        <InsightsSection />
        <InstagramSection />
        <ContactSection />
        <Footer />
      </motion.div>
    </main>
  )
}
