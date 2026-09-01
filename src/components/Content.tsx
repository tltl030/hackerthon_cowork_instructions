import { useState, type ReactNode } from 'react'

export function PageIntro({ kicker, title, description, aside }: { kicker: string; title: string; description: string; aside?: ReactNode }) {
  return (
    <header className="page-intro">
      <div><p className="eyebrow"><span />{kicker}</p><h1>{title}</h1><p className="lead">{description}</p></div>
      {aside && <aside className="intro-aside">{aside}</aside>}
    </header>
  )
}

export function CopyBlock({ value, label = '複製' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return <div className="copy-block"><button type="button" onClick={copy} aria-label={`${label}內容`}>{copied ? '已複製 ✓' : label}</button><pre><code>{value}</code></pre></div>
}

export function List({ items, tone = 'default' }: { items: string[]; tone?: 'default' | 'safe' | 'danger' }) {
  return <ul className={`content-list ${tone}`}>{items.map((item) => <li key={item}>{item}</li>)}</ul>
}

export function Notice({ tone = 'info', title, children }: { tone?: 'info' | 'warning' | 'safe'; title: string; children: ReactNode }) {
  return <aside className={`notice ${tone}`}><span aria-hidden="true">{tone === 'warning' ? '!' : tone === 'safe' ? '✓' : 'i'}</span><div><strong>{title}</strong><div>{children}</div></div></aside>
}

export function SectionTitle({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return <div className="section-heading"><div><p className="eyebrow">{kicker}</p><h2>{title}</h2></div>{description && <p>{description}</p>}</div>
}
