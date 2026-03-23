import { useState, useRef, useEffect } from 'react'

const DAMAGE_INFO = {
  F_Breakage: { label: 'Front Breakage',  position: 'Front', type: 'Breakage', severity: 'High',     severityLevel: 0.80, description: 'Structural breakage at the front — likely involves headlights, hood, or front bumper integrity.', color: '#ef4444', glow: 'rgba(239,68,68,0.25)' },
  F_Crushed:  { label: 'Front Crushed',   position: 'Front', type: 'Crushed',  severity: 'Critical', severityLevel: 1.00, description: 'Severe front-end crushing from high-impact collision. Major structural deformation detected.',     color: '#f97316', glow: 'rgba(249,115,22,0.25)' },
  F_Normal:   { label: 'Front Normal',    position: 'Front', type: 'None',     severity: 'None',     severityLevel: 0.00, description: 'No visible front-end damage. Vehicle front appears structurally sound and undamaged.',           color: '#22c55e', glow: 'rgba(34,197,94,0.25)'  },
  R_Breakage: { label: 'Rear Breakage',   position: 'Rear',  type: 'Breakage', severity: 'High',     severityLevel: 0.80, description: 'Structural breakage at the rear — tail lights, trunk lid, or rear bumper may be compromised.',   color: '#ef4444', glow: 'rgba(239,68,68,0.25)' },
  R_Crushed:  { label: 'Rear Crushed',    position: 'Rear',  type: 'Crushed',  severity: 'Critical', severityLevel: 1.00, description: 'Severe rear-end crush damage detected. Trunk, frame rails, and rear assembly likely compromised.', color: '#f97316', glow: 'rgba(249,115,22,0.25)' },
  R_Normal:   { label: 'Rear Normal',     position: 'Rear',  type: 'None',     severity: 'None',     severityLevel: 0.00, description: 'No visible rear-end damage. Vehicle rear appears structurally sound and undamaged.',             color: '#22c55e', glow: 'rgba(34,197,94,0.25)'  },
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function ScanOverlay() {
  return (
    <div className="scan-overlay">
      <div className="scan-corner tl" /><div className="scan-corner tr" />
      <div className="scan-corner bl" /><div className="scan-corner br" />
      <div className="scan-line" />
      <div className="scan-grid">
        {Array.from({ length: 24 }).map((_, i) => <span key={i} className="scan-dot" />)}
      </div>
      <span className="scan-text">ANALYSING</span>
    </div>
  )
}

function CarSchematic({ position, color, type }) {
  const frontColor = position === 'Front' ? color : (type === 'None' ? '#22c55e' : 'rgba(255,255,255,0.05)')
  const rearColor  = position === 'Rear'  ? color : (type === 'None' ? '#22c55e' : 'rgba(255,255,255,0.05)')
  const frontGlow  = position === 'Front' ? `0 0 18px ${color}55` : 'none'
  const rearGlow   = position === 'Rear'  ? `0 0 18px ${color}55` : 'none'

  return (
    <div className="schematic">
      <div className="schematic-label-top">
        <span>FRONT</span><span>REAR</span>
      </div>
      <div className="schematic-car">
        {/* Wheels */}
        <div className="wheel wfl" /><div className="wheel wfr" />
        <div className="wheel wrl" /><div className="wheel wrr" />

        {/* Front half */}
        <div className="car-half car-front" style={{ background: frontColor + '22', borderColor: frontColor + '66', boxShadow: frontGlow }}>
          {position === 'Front' && type !== 'None' && <span className="damage-dot" style={{ background: color }} />}
        </div>

        {/* Divider */}
        <div className="car-divider" />

        {/* Rear half */}
        <div className="car-half car-rear" style={{ background: rearColor + '22', borderColor: rearColor + '66', boxShadow: rearGlow }}>
          {position === 'Rear' && type !== 'None' && <span className="damage-dot" style={{ background: color }} />}
        </div>
      </div>
    </div>
  )
}

function SeverityGauge({ level, color }) {
  const r = 40, cx = 50, cy = 56
  const circ = Math.PI * r
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ * (1 - level)), 120)
    return () => clearTimeout(t)
  }, [level, circ])

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 12 100 48" className="gauge-svg">
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 0 ${cx+r} ${cy}`}
          stroke="rgba(255,255,255,0.07)" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 0 ${cx+r} ${cy}`}
          stroke={color} strokeWidth="7" fill="none" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
        <text x="50" y="52" textAnchor="middle" fill={color} fontSize="13" fontWeight="800" fontFamily="Inter,sans-serif">
          {Math.round(level * 100)}%
        </text>
      </svg>
    </div>
  )
}

function StatChip({ label, value }) {
  return (
    <div className="stat-chip">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

/* ── Icons ─────────────────────────────────────────────────────────────── */
const ScanIcon    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>
const ShieldOk    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
const AlertTriangle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const ImageIcon   = () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
const SpinnerIcon = () => <span className="spinner-ring" />

/* ── Main App ────────────────────────────────────────────────────────────── */
export default function App() {
  const [image,    setImage]   = useState(null)
  const [file,     setFile]    = useState(null)
  const [result,   setResult]  = useState(null)
  const [loading,  setLoading] = useState(false)
  const [dragging, setDragging]= useState(false)
  const inputRef = useRef()

  function handleFile(f) {
    if (!f) return
    setFile(f); setImage(URL.createObjectURL(f)); setResult(null)
  }

  function onDrop(e) { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }

  async function predict() {
    if (!file) return
    setLoading(true); setResult(null)
    const form = new FormData(); form.append('file', file)
    try {
      const res = await fetch('/api/predict', { method: 'POST', body: form })
      setResult(await res.json())
    } catch { setResult({ error: 'Could not reach the server.' }) }
    finally { setLoading(false) }
  }

  const info = result?.prediction ? DAMAGE_INFO[result.prediction] : null

  return (
    <div className="page">
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      {/* ── Header ── */}
      <header className="hero">
        <div className="badge-row">
          <span className="live-dot" /><span className="badge">Model Active</span>
        </div>
        <h1>Car Damage <span className="grad">Detection</span></h1>
        <p className="hero-sub">Upload a front or rear car photo — ResNet50 classifies damage in seconds.</p>
      </header>

      {/* ── Stat Chips ── */}
      <div className="stat-row">
        <StatChip value="6"           label="Damage Classes"   />
        <StatChip value="ResNet50"    label="Architecture"     />
        <StatChip value="Transfer"    label="Learning"         />
        <StatChip value="PyTorch"     label="Framework"        />
      </div>

      <main>
        {/* ── Upload Card ── */}
        <div
          className={`upload-card ${dragging ? 'dragging' : ''} ${image ? 'has-image' : ''} ${loading ? 'scanning' : ''}`}
          onClick={() => !image && inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {image ? (
            <div className="preview-wrap">
              <img src={image} alt="car" className="preview-img" />
              {/* Targeting brackets always visible when image is loaded */}
              <div className="corner tl" /><div className="corner tr" />
              <div className="corner bl" /><div className="corner br" />
              {loading && <ScanOverlay />}
            </div>
          ) : (
            <div className="empty-state">
              <div className="upload-icon-ring">
                <ImageIcon />
              </div>
              <p className="upload-title">Drop your car image here</p>
              <p className="upload-sub">or <span className="link-text">click to browse</span></p>
              <div className="upload-formats">
                <span>JPG</span><span>PNG</span><span>WEBP</span>
              </div>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />
        </div>

        {/* ── File info strip ── */}
        {file && !loading && (
          <div className="file-strip">
            <span className="file-name">{file.name}</span>
            <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            <button className="file-change" onClick={() => inputRef.current.click()}>Change</button>
          </div>
        )}

        {/* ── Analyze button ── */}
        <button className="analyze-btn" onClick={predict} disabled={!file || loading}>
          {loading ? <><SpinnerIcon />Analysing image…</> : <><ScanIcon />Scan for Damage</>}
        </button>

        {/* ── Result ── */}
        {result && (
          <div className="result-card" style={info ? { '--accent': info.color, '--glow': info.glow, borderColor: info.color + '44' } : {}}>
            {info ? (
              <>
                {/* Header row */}
                <div className="result-header">
                  <div className="result-icon-wrap" style={{ background: info.color + '18', color: info.color }}>
                    {info.type === 'None' ? <ShieldOk /> : <AlertTriangle />}
                  </div>
                  <div className="result-meta">
                    <p className="result-label" style={{ color: info.color }}>{info.label}</p>
                    <p className="result-sub">
                      <span className="result-badge" style={{ background: info.color + '22', color: info.color }}>
                        {info.severity === 'None' ? 'No Damage' : info.severity}
                      </span>
                      <code>{result.prediction}</code>
                    </p>
                  </div>
                </div>

                {/* Car schematic + gauge side by side */}
                <div className="viz-row">
                  <div className="viz-block">
                    <p className="viz-title">Damage Location</p>
                    <CarSchematic position={info.position} color={info.color} type={info.type} />
                  </div>
                  <div className="viz-block">
                    <p className="viz-title">Severity Index</p>
                    <SeverityGauge level={info.severityLevel} color={info.color} />
                    <p className="gauge-caption" style={{ color: info.color }}>{info.severity}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="result-desc">{info.description}</p>
              </>
            ) : (
              <p className="result-error"><AlertTriangle /> {result.error}</p>
            )}
          </div>
        )}
      </main>

      <footer className="footer">Powered by ResNet50 · Transfer Learning · PyTorch</footer>
    </div>
  )
}
