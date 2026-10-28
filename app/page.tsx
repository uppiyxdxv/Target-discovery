'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  Filter,
  Globe2,
  Link,
  ListFilter,
  MapPin,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
  X,
  Zap,
} from 'lucide-react'

type Job = {
  title: string
  company: string
  location: string
  source: 'LinkedIn' | 'Naukri'
  match: number
  trust: 'Verified' | 'Review'
  posted: string
  tags: string[]
  warning?: string
}

const jobs: Job[] = [
  { title: 'Product Designer', company: 'Razorpay', location: 'Bengaluru · Hybrid', source: 'LinkedIn', match: 96, trust: 'Verified', posted: '2h ago', tags: ['Figma', 'UX Research'] },
  { title: 'Frontend Engineer', company: 'Myntra', location: 'Bengaluru · On-site', source: 'Naukri', match: 91, trust: 'Verified', posted: '5h ago', tags: ['React', 'TypeScript'] },
  { title: 'UX Research Intern', company: 'Growth Labs', location: 'Remote · India', source: 'LinkedIn', match: 84, trust: 'Review', posted: '1d ago', tags: ['User interviews', 'Internship'], warning: 'Requests payment for onboarding' },
  { title: 'Associate Product Manager', company: 'Zepto', location: 'Mumbai · Hybrid', source: 'Naukri', match: 78, trust: 'Verified', posted: '1d ago', tags: ['Product', 'Analytics'] },
]

const sourceStats = [
  { name: 'LinkedIn agent', detail: 'Scanning recommendations', icon: Link, color: 'blue', count: '42 found' },
  { name: 'Naukri agent', detail: 'Checking new listings', icon: BriefcaseBusiness, color: 'orange', count: '31 found' },
]

export default function Page() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUserEmail(data.user?.email ?? null)
        setAuthLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUserEmail(session?.user?.email ?? null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError('')

    if (!email.trim() || password.length < 6) {
      setLoginError('Enter a valid email and a password with at least 6 characters.')
      return
    }

    const { error } = await createClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setLoginError(error.message.toLowerCase().includes('confirm')
        ? 'Check your inbox and confirm your email before signing in.'
        : 'Invalid email or password.')
    }
  }

  async function handleLogout() {
    await createClient().auth.signOut()
    setUserEmail(null)
  }
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(72)
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'review'>('all')
  const [query, setQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          setRunning(false)
          return 100
        }
        return value + 7
      })
    }, 650)
    return () => window.clearInterval(timer)
  }, [running])

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const matchesTab = activeTab === 'all' || (activeTab === 'verified' ? job.trust === 'Verified' : job.trust === 'Review')
    const haystack = `${job.title} ${job.company} ${job.tags.join(' ')}`.toLowerCase()
    return matchesTab && haystack.includes(query.toLowerCase())
  }), [activeTab, query])

  if (authLoading) {
    return <main className="auth-shell"><section className="auth-card auth-loading" aria-label="Loading workspace">Loading your workspace...</section></main>
  }

  if (!userEmail) {
    return (
      <main className="auth-shell">
        <section className="auth-card" aria-labelledby="login-title">
          <div className="brand auth-brand"><span className="brand-mark"><Sparkles size={17} /></span><span>Scoutly</span></div>
          <div className="auth-icon"><ShieldCheck size={24} /></div>
          <p className="eyebrow">PRIVATE JOB SEARCH</p>
          <h1 id="login-title">Sign in to your workspace</h1>
          <p className="auth-copy">Use your email credentials to access your matches, agent progress, and fraud checks.</p>
          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" minLength={6} required />
            {loginError && <p className="auth-error" role="alert">{loginError}</p>}
            <button className="auth-submit" type="submit">Continue to Scoutly <ArrowUpRight size={15} /></button>
          </form>
          <p className="auth-note"><ShieldCheck size={14} /> Your workspace data is scoped to this signed-in email.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>Scoutly</span></div>
        <div className="workspace"><div className="avatar">AR</div><div><strong>Arjun&apos;s workspace</strong><span>Personal workspace</span></div><ChevronDown size={15} /></div>
        <nav className="nav-list" aria-label="Primary navigation">
          <a className="nav-item active" href="#overview"><Target size={17} /> Overview</a>
          <a className="nav-item" href="#matches"><BriefcaseBusiness size={17} /> Job matches <span className="nav-count">73</span></a>
          <a className="nav-item" href="#agents"><Bot size={17} /> Agents <span className="live-dot" /></a>
          <a className="nav-item" href="#saved"><Check size={17} /> Saved jobs</a>
        </nav>
        <div className="side-label">Your profile</div>
        <a className="nav-item" href="#profile"><UserRound size={17} /> Profile strength <span className="profile-score">82%</span></a>
        <div className="sidebar-bottom"><div className="side-label">Connected sources</div><div className="connected"><Link size={15} /> LinkedIn <span>Connected</span></div><div className="connected"><BriefcaseBusiness size={15} /> Naukri <span>Connected</span></div><button className="help-link">? <span>Help center</span></button></div>
      </aside>

      <section className="content">
        <header className="topbar"><div><p className="eyebrow">TUESDAY, OCTOBER 28, 2026</p><h1>Good morning, Arjun <span className="wave">✦</span></h1><p className="signed-in-as">Signed in as {userEmail}</p></div><div className="top-actions"><button className="icon-btn" aria-label="Refresh jobs"><RefreshCw size={17} /></button><button className="user-button" onClick={handleLogout} aria-label="Sign out"><span className="avatar small">AR</span><ChevronDown size={14} /></button></div></header>

        <div className="hero-row"><div><h2>Your job search, on autopilot.</h2><p>Scoutly&apos;s agents are finding roles that fit your goals and keeping the noise out.</p></div><button className={`run-button ${running ? 'is-running' : ''}`} onClick={() => { setProgress(0); setRunning(true) }}><Play size={15} fill="currentColor" /> {running ? 'Agents running...' : 'Run agents now'}</button></div>

        <section className="agent-panel" id="agents"><div className="panel-heading"><div><div className="heading-with-icon"><span className="spark-icon"><Zap size={16} fill="currentColor" /></span><h3>Agent activity</h3><span className="status-pill"><span className="status-dot" /> {running ? 'Running now' : 'Last run 8m ago'}</span></div><p>One main agent coordinating your search across 2 sources.</p></div><button className="more-button">•••</button></div><div className="agent-grid"><div className="main-agent"><div className="agent-icon main"><Bot size={22} /></div><div className="agent-copy"><strong>Scoutly main agent</strong><span>Coordinating search and evaluating matches</span><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div><div className="progress-meta"><span>{progress === 100 ? 'Completed just now' : `${progress}% complete`}</span><span>{progress === 100 ? '73 roles reviewed' : 'Reviewing 73 roles'}</span></div></div></div><div className="source-agents">{sourceStats.map(({ name, detail, icon: Icon, color, count }) => <div className="source-agent" key={name}><div className={`agent-icon ${color}`}><Icon size={18} /></div><div className="agent-copy"><strong>{name}</strong><span>{detail}</span><b>{count}</b></div><Check className="done-check" size={16} /></div>)}</div></div></section>

        <div className="section-title" id="matches"><div><h2>Top matches <span className="result-count">73 results</span></h2><p>Ranked by fit, freshness, and trust signals.</p></div><button className="filter-button"><Filter size={15} /> Filters <span className="filter-number">2</span></button></div>
        <div className="toolbar"><div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles, companies, skills..." aria-label="Search jobs" /></div><div className="tabs" role="tablist"><button className={activeTab === 'all' ? 'selected' : ''} onClick={() => setActiveTab('all')}>All jobs</button><button className={activeTab === 'verified' ? 'selected' : ''} onClick={() => setActiveTab('verified')}><ShieldCheck size={14} /> Verified <span>68</span></button><button className={activeTab === 'review' ? 'selected' : ''} onClick={() => setActiveTab('review')}><AlertTriangle size={14} /> Needs review <span>5</span></button></div><button className="sort-button"><ListFilter size={15} /> Best match <ChevronDown size={14} /></button></div>

        <div className="job-list">{filteredJobs.map((job) => <article className="job-card" key={`${job.title}-${job.company}`} onClick={() => setSelectedJob(job)}><div className="company-logo">{job.company.slice(0, 1)}</div><div className="job-main"><div className="job-title-row"><div><h3>{job.title}</h3><p>{job.company} <span>·</span> {job.location}</p></div><span className={`match-score ${job.match < 80 ? 'yellow' : ''}`}>{job.match}% fit</span></div><div className="job-tags">{job.tags.map((tag) => <span key={tag}>{tag}</span>)}<span className="source-tag">{job.source === 'LinkedIn' ? <Link size={12} /> : <BriefcaseBusiness size={12} />} {job.source}</span></div></div><div className="job-side"><span className={`trust ${job.trust === 'Review' ? 'review' : ''}`}>{job.trust === 'Verified' ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />} {job.trust}</span><span className="posted"><Clock3 size={13} /> {job.posted}</span><ArrowUpRight size={17} className="open-arrow" /></div></article>)}</div>

        <footer className="footer-note"><ShieldCheck size={15} /> Trust scores are signals, not guarantees. Always verify details on the original posting.</footer>
      </section>

      {selectedJob && <div className="dialog-backdrop" onClick={() => setSelectedJob(null)}><div className="job-dialog" onClick={(event) => event.stopPropagation()}><button className="close-dialog" onClick={() => setSelectedJob(null)} aria-label="Close"><X size={18} /></button><div className="dialog-logo">{selectedJob.company.slice(0, 1)}</div><span className="dialog-source">{selectedJob.source} listing</span><h2>{selectedJob.title}</h2><p className="dialog-company">{selectedJob.company} · {selectedJob.location}</p><div className="dialog-score"><strong>{selectedJob.match}%</strong><span>profile fit</span></div><div className="dialog-section"><strong>Why it matches</strong><p>Your profile aligns with the key skills and role level. The agent found strong signals across the job description.</p></div><div className={`dialog-warning ${selectedJob.warning ? '' : 'safe'}`}><span>{selectedJob.warning ? <AlertTriangle size={17} /> : <ShieldCheck size={17} />}</span><div><strong>{selectedJob.warning ? 'Review before applying' : 'Trust signals look good'}</strong><p>{selectedJob.warning || 'Company and listing details match trusted source signals.'}</p></div></div><button className="apply-button">View original posting <ArrowUpRight size={15} /></button></div></div>}
    </main>
  )
}
