'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Bookmark,
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
  source: 'LinkedIn' | 'Naukri' | 'Indeed' | 'Wellfound' | 'Glassdoor'
  match: number
  trust: 'Verified' | 'Review'
  posted: string
  tags: string[]
  applyUrl: string
  warning?: string
}

const jobTemplates: Job[] = [
  { title: 'Product Designer', company: 'Razorpay', location: 'Bengaluru · Hybrid', source: 'LinkedIn', match: 96, trust: 'Verified', posted: '2h ago', tags: ['Figma', 'UX Research'], applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=Product%20Designer%20Razorpay' },
  { title: 'Frontend Engineer', company: 'Myntra', location: 'Bengaluru · On-site', source: 'Naukri', match: 91, trust: 'Verified', posted: '5h ago', tags: ['React', 'TypeScript'], applyUrl: 'https://www.naukri.com/frontend-engineer-jobs-in-bengaluru' },
  { title: 'UX Research Intern', company: 'Growth Labs', location: 'Remote · India', source: 'LinkedIn', match: 84, trust: 'Review', posted: '1d ago', tags: ['User interviews', 'Internship'], applyUrl: 'https://www.linkedin.com/jobs/search/?keywords=UX%20Research%20Intern%20Growth%20Labs', warning: 'Requests payment for onboarding' },
  { title: 'Associate Product Manager', company: 'Zepto', location: 'Mumbai · Hybrid', source: 'Naukri', match: 78, trust: 'Verified', posted: '1d ago', tags: ['Product', 'Analytics'], applyUrl: 'https://www.naukri.com/associate-product-manager-jobs' },
  { title: 'Product Operations Associate', company: 'Atlassian', location: 'Remote · India', source: 'Indeed', match: 88, trust: 'Verified', posted: '3h ago', tags: ['Operations', 'SQL'], applyUrl: 'https://in.indeed.com/jobs?q=Product+Operations+Associate' },
  { title: 'Founding Product Designer', company: 'Nova Labs', location: 'Remote · India', source: 'Wellfound', match: 86, trust: 'Review', posted: '8h ago', tags: ['Figma', 'Startups'], applyUrl: 'https://wellfound.com/jobs' },
  { title: 'Senior UX Designer', company: 'Adobe', location: 'Noida · Hybrid', source: 'Glassdoor', match: 83, trust: 'Verified', posted: '2d ago', tags: ['Design systems', 'Research'], applyUrl: 'https://www.glassdoor.co.in/Job/index.htm' },
]

function getAccountJobs(email: string): Job[] {
  const seed = Array.from(email).reduce((total, character) => total + character.charCodeAt(0), 0)
  const rotation = seed % jobTemplates.length
  return [...jobTemplates.slice(rotation), ...jobTemplates.slice(0, rotation)].map((job, index) => ({
    ...job,
    match: Math.max(68, Math.min(98, job.match - ((seed + index * 3) % 8))),
  }))
}

function getSourceStats(accountJobs: Job[]) {
  return [
    { name: 'LinkedIn agent', detail: 'Scanning recommendations', icon: Link, color: 'blue', count: `${accountJobs.filter((job) => job.source === 'LinkedIn').length} found` },
    { name: 'Naukri agent', detail: 'Checking new listings', icon: BriefcaseBusiness, color: 'orange', count: `${accountJobs.filter((job) => job.source === 'Naukri').length} found` },
    { name: 'Indeed agent', detail: 'Searching global roles', icon: Search, color: 'green', count: `${accountJobs.filter((job) => job.source === 'Indeed').length} found` },
    { name: 'Wellfound agent', detail: 'Watching startup roles', icon: Sparkles, color: 'purple', count: `${accountJobs.filter((job) => job.source === 'Wellfound').length} found` },
    { name: 'Glassdoor agent', detail: 'Checking company signals', icon: ShieldCheck, color: 'pink', count: `${accountJobs.filter((job) => job.source === 'Glassdoor').length} found` },
  ]
}

export default function Page() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const profile = useMemo(() => {
    const localPart = userEmail?.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || 'Your profile'
    const name = localPart.replace(/\b\w/g, (letter) => letter.toUpperCase())
    const initials = localPart.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'YU'
    return { name, initials }
  }, [userEmail])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [registrationSent, setRegistrationSent] = useState(false)
  const [authSubmitting, setAuthSubmitting] = useState(false)

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

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError('')
    setRegistrationSent(false)

    if (!email.trim() || password.length < 6) {
      setLoginError('Enter a valid email and a password with at least 6 characters.')
      return
    }

    setAuthSubmitting(true)
    const supabase = createClient()
    if (authMode === 'register') {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        },
      })
      setAuthSubmitting(false)
      if (error) {
        setLoginError(error.message.toLowerCase().includes('password')
          ? 'Choose a stronger password with at least 6 characters.'
          : 'We could not create that account. Check the email and try again.')
      } else {
        setRegistrationSent(true)
      }
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setAuthSubmitting(false)
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
  const accountJobs = useMemo(() => userEmail ? getAccountJobs(userEmail) : [], [userEmail])
  const [savedJobs, setSavedJobs] = useState<Job[]>([])

  useEffect(() => {
    if (!userEmail) {
      setSavedJobs([])
      return
    }
    const savedKey = `scoutly-saved:${userEmail.toLowerCase()}`
    const savedTitles = window.sessionStorage.getItem(savedKey)
    const saved = savedTitles ? accountJobs.filter((job) => savedTitles.split('|').includes(`${job.title}|${job.company}`)) : []
    setSavedJobs(saved)
  }, [userEmail, accountJobs])

  function toggleSavedJob(job: Job) {
    if (!userEmail) return
    const next = savedJobs.some((saved) => saved.title === job.title && saved.company === job.company)
      ? savedJobs.filter((saved) => saved.title !== job.title || saved.company !== job.company)
      : [...savedJobs, job]
    setSavedJobs(next)
    window.sessionStorage.setItem(`scoutly-saved:${userEmail.toLowerCase()}`, next.map((saved) => `${saved.title}|${saved.company}`).join('|'))
  }

  const sourceStats = useMemo(() => getSourceStats(accountJobs), [accountJobs])
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

  const filteredJobs = useMemo(() => accountJobs.filter((job) => {
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
          <h1 id="login-title">{authMode === 'login' ? 'Sign in to your workspace' : 'Create your workspace'}</h1>
          <p className="auth-copy">{authMode === 'login' ? 'Use your email credentials to access your matches, agent progress, and fraud checks.' : 'Register with your email to save your job matches and agent progress securely.'}</p>
          {registrationSent ? <p className="auth-success" role="status">Check your inbox to confirm your email, then come back and sign in.</p> : null}
          <form onSubmit={handleAuth}>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" minLength={6} required />
            {loginError && <p className="auth-error" role="alert">{loginError}</p>}
            <button className="auth-submit" type="submit" disabled={authSubmitting}>{authSubmitting ? 'Please wait...' : authMode === 'login' ? 'Continue to Scoutly' : 'Create account'} <ArrowUpRight size={15} /></button>
          </form>
          <button className="auth-switch" type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setLoginError(''); setRegistrationSent(false) }}>
            {authMode === 'login' ? 'New here? Create an account' : 'Already registered? Sign in'}
          </button>
          <p className="auth-note"><ShieldCheck size={14} /> Your workspace data is scoped to this signed-in email.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>Scoutly</span></div>
        <div className="workspace"><div className="avatar">{profile.initials}</div><div><strong>{profile.name}&apos;s workspace</strong><span>Personal workspace</span></div><ChevronDown size={15} /></div>
        <nav className="nav-list" aria-label="Primary navigation">
          <a className="nav-item active" href="#overview"><Target size={17} /> Overview</a>
          <a className="nav-item" href="#matches"><BriefcaseBusiness size={17} /> Job matches <span className="nav-count">73</span></a>
          <a className="nav-item" href="#agents"><Bot size={17} /> Agents <span className="live-dot" /></a>
          <a className="nav-item" href="#saved"><Check size={17} /> Saved jobs <span className="nav-count">{savedJobs.length}</span></a>
        </nav>
        <div className="side-label">Your profile</div>
        <a className="nav-item" href="#profile"><UserRound size={17} /> {profile.name}&apos;s profile <span className="profile-score">82%</span></a>
        <div className="sidebar-bottom"><div className="side-label">Connected sources</div><div className="connected"><Link size={15} /> LinkedIn <span>Connected</span></div><div className="connected"><BriefcaseBusiness size={15} /> Naukri <span>Connected</span></div><div className="connected"><Search size={15} /> Indeed <span>Connected</span></div><div className="connected"><Sparkles size={15} /> Wellfound <span>Connected</span></div><div className="connected"><ShieldCheck size={15} /> Glassdoor <span>Connected</span></div><button className="help-link">? <span>Help center</span></button></div>
      </aside>

      <section className="content">
        <header className="topbar"><div><p className="eyebrow">TUESDAY, OCTOBER 28, 2026</p><h1>Good morning, {profile.name} <span className="wave">✦</span></h1><p className="signed-in-as">Signed in as {userEmail}</p></div><div className="top-actions"><button className="icon-btn" aria-label="Refresh jobs" onClick={() => { setProgress(0); setRunning(true) }}><RefreshCw size={17} /></button><button className="user-button" onClick={handleLogout} aria-label={`Sign out ${profile.name}`}><span className="avatar small">{profile.initials}</span><ChevronDown size={14} /></button><button className="logout-button" onClick={handleLogout}>Log out</button></div></header>

        <div className="hero-row"><div><h2>Your job search, on autopilot.</h2><p>Scoutly&apos;s agents are finding roles that fit your goals and keeping the noise out.</p><p className="account-context"><UserRound size={14} /> Personalised for <strong>{userEmail}</strong></p></div><div className="hero-actions"><button className="saved-jobs-button" onClick={() => document.getElementById('saved')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><Bookmark size={15} /> Saved jobs <span>{savedJobs.length}</span></button><button className={`run-button ${running ? 'is-running' : ''}`} onClick={() => { setProgress(0); setRunning(true) }}><Play size={15} fill="currentColor" /> {running ? 'Agents running...' : 'Run agents now'}</button></div></div>

        <section className="agent-panel" id="agents"><div className="panel-heading"><div><div className="heading-with-icon"><span className="spark-icon"><Zap size={16} fill="currentColor" /></span><h3>Agent activity</h3><span className="status-pill"><span className="status-dot" /> {running ? 'Running now' : 'Last run 8m ago'}</span></div><p>One main agent coordinating five specialist agents across your connected job platforms.</p></div><button className="more-button">•••</button></div><div className="agent-grid"><div className="main-agent"><div className="agent-icon main"><Bot size={22} /></div><div className="agent-copy"><strong>Scoutly main agent</strong><span>Coordinating search and evaluating matches</span><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div><div className="progress-meta"><span>{progress === 100 ? 'Completed just now' : `${progress}% complete`}</span><span>{progress === 100 ? '73 roles reviewed' : 'Reviewing 73 roles'}</span></div></div></div><div className="source-agents">{sourceStats.map(({ name, detail, icon: Icon, color, count }) => <div className="source-agent" key={name}><div className={`agent-icon ${color}`}><Icon size={18} /></div><div className="agent-copy"><strong>{name}</strong><span>{detail}</span><b>{count}</b></div><Check className="done-check" size={16} /></div>)}</div></div></section>

        <div className="section-title" id="matches"><div><h2>Top matches <span className="result-count">73 results</span></h2><p>Ranked by fit, freshness, and trust signals for <strong>{userEmail}</strong>.</p></div><button className="filter-button"><Filter size={15} /> Filters <span className="filter-number">2</span></button></div>
        <div className="toolbar"><div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles, companies, skills..." aria-label="Search jobs" /></div><div className="tabs" role="tablist"><button className={activeTab === 'all' ? 'selected' : ''} onClick={() => setActiveTab('all')}>All jobs</button><button className={activeTab === 'verified' ? 'selected' : ''} onClick={() => setActiveTab('verified')}><ShieldCheck size={14} /> Verified <span>68</span></button><button className={activeTab === 'review' ? 'selected' : ''} onClick={() => setActiveTab('review')}><AlertTriangle size={14} /> Needs review <span>5</span></button></div><button className="sort-button"><ListFilter size={15} /> Best match <ChevronDown size={14} /></button></div>

        <div className="job-list">{filteredJobs.map((job) => <article className="job-card" key={`${job.title}-${job.company}`} onClick={() => setSelectedJob(job)}><div className="company-logo" aria-label={`${job.company} logo`} title={`${job.company} logo`}>{job.company.slice(0, 1)}</div><div className="job-main"><div className="job-title-row"><div><h3>{job.title}</h3><p>{job.company} <span>·</span> {job.location}</p></div><span className={`match-score ${job.match < 80 ? 'yellow' : ''}`}>{job.match}% fit</span></div><div className="job-tags">{job.tags.map((tag) => <span key={tag}>{tag}</span>)}<span className={`source-tag ${job.source === 'LinkedIn' ? 'linkedin-tag' : 'naukri-tag'}`}>{job.source === 'LinkedIn' ? <Link size={12} /> : <BriefcaseBusiness size={12} />} {job.source}</span></div></div><div className="job-side"><button className={`save-job ${savedJobs.some((saved) => saved.title === job.title && saved.company === job.company) ? 'saved' : ''}`} onClick={(event) => { event.stopPropagation(); toggleSavedJob(job) }} aria-label={`${savedJobs.some((saved) => saved.title === job.title && saved.company === job.company) ? 'Remove' : 'Save'} ${job.title}`}>{savedJobs.some((saved) => saved.title === job.title && saved.company === job.company) ? 'Saved' : 'Save'}</button><span className={`trust ${job.trust === 'Review' ? 'review' : ''}`}>{job.trust === 'Verified' ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />} {job.trust}</span><span className="posted"><Clock3 size={13} /> {job.posted}</span><a className="apply-link" href={job.applyUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>Apply on {job.source} <ArrowUpRight size={14} /></a><ArrowUpRight size={17} className="open-arrow" /></div></article>)}</div>\n\n        <section className="saved-panel" id="saved" aria-labelledby="saved-title"><div className="section-title"><div><h2 id="saved-title">Saved jobs <span className="result-count">{savedJobs.length}</span></h2><p>Saved for {userEmail}. These are scoped to this signed-in workspace.</p></div></div>{savedJobs.length ? <div className="job-list saved-list">{savedJobs.map((job) => <article className="job-card" key={`saved-${job.title}-${job.company}`} onClick={() => setSelectedJob(job)}><div className="company-logo">{job.company.slice(0, 1)}</div><div className="job-main"><div className="job-title-row"><div><h3>{job.title}</h3><p>{job.company} <span>·</span> {job.location}</p></div><span className="source-tag">{job.source}</span></div></div><button className="save-job saved" onClick={(event) => { event.stopPropagation(); toggleSavedJob(job) }}>Saved</button></article>)}</div> : <div className="empty-state"><div className="empty-state-icon"><Link size={19} /></div><div><strong>No saved jobs in this workspace yet</strong><p>Save a job from the matches above. LinkedIn and Naukri saved items cannot be read from email login alone without their approved API connection.</p></div></div>}</section>\n\n        <footer className="footer-note"><ShieldCheck size={15} /> Trust scores are signals, not guarantees. Always verify details on the original posting.</footer>
      </section>

      {selectedJob && <div className="dialog-backdrop" onClick={() => setSelectedJob(null)}><div className="job-dialog" onClick={(event) => event.stopPropagation()}><button className="close-dialog" onClick={() => setSelectedJob(null)} aria-label="Close"><X size={18} /></button><div className="dialog-logo">{selectedJob.company.slice(0, 1)}</div><span className="dialog-source">{selectedJob.source} listing</span><h2>{selectedJob.title}</h2><p className="dialog-company">{selectedJob.company} · {selectedJob.location}</p><div className="dialog-score"><strong>{selectedJob.match}%</strong><span>profile fit</span></div><div className="dialog-section"><strong>Why it matches</strong><p>Your profile aligns with the key skills and role level. The agent found strong signals across the job description.</p></div><div className={`dialog-warning ${selectedJob.warning ? '' : 'safe'}`}><span>{selectedJob.warning ? <AlertTriangle size={17} /> : <ShieldCheck size={17} />}</span><div><strong>{selectedJob.warning ? 'Review before applying' : 'Trust signals look good'}</strong><p>{selectedJob.warning || 'Company and listing details match trusted source signals.'}</p></div></div><a className="apply-button" href={selectedJob.applyUrl} target="_blank" rel="noreferrer">View on {selectedJob.source} <ArrowUpRight size={15} /></a></div></div>}
    </main>
  )
}
