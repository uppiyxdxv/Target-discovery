import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function normalizeJob(item: any, source: 'Indeed' | 'Wellfound' | 'Glassdoor'): any {
  const title = item.title || item.position || 'Open role'
  const company = item.company_name || item.company || item.companyName || 'Unknown company'
  const location = item.location || item.candidate_required_location || 'Remote'
  const applyUrl = item.url || item.job_url || item.link || '#'
  return {
    title,
    company,
    location,
    source,
    match: 82,
    trust: 'Review',
    posted: item.publication_date ? new Date(item.publication_date).toLocaleDateString() : 'Recently',
    tags: Array.isArray(item.tags) ? item.tags.slice(0, 3) : [],
    applyUrl,
  }
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q') || 'product designer'
  const encoded = encodeURIComponent(query)
  const results: any[] = []

  const sources = await Promise.allSettled([
    fetch(`https://remotive.com/api/remote-jobs?search=${encoded}`, { next: { revalidate: 300 } }).then((response) => response.ok ? response.json() : null),
    fetch(`https://arbeitnow.com/api/job-board-api`, { next: { revalidate: 300 } }).then((response) => response.ok ? response.json() : null),
    fetch(`https://jobicy.com/api/v2/remote-jobs?count=20`, { next: { revalidate: 300 } }).then((response) => response.ok ? response.json() : null),
  ])

  const remotive = sources[0].status === 'fulfilled' ? sources[0].value?.jobs || [] : []
  const arbeitnow = sources[1].status === 'fulfilled' ? sources[1].value?.data || [] : []
  const jobicy = sources[2].status === 'fulfilled' ? sources[2].value?.jobs || [] : []

  results.push(...remotive.slice(0, 10).map((job: any) => normalizeJob(job, 'Indeed')))
  results.push(...arbeitnow.slice(0, 10).map((job: any) => normalizeJob(job, 'Wellfound')))
  results.push(...jobicy.slice(0, 10).map((job: any) => normalizeJob(job, 'Glassdoor')))

  return NextResponse.json({ jobs: results, sources: { remotive: remotive.length > 0, arbeitnow: arbeitnow.length > 0, jobicy: jobicy.length > 0 } })
}
