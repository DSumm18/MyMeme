// Background Animation Job Queue - persists to localStorage
export interface AnimationJob {
  id: string
  taskUUID: string
  sourceImageUrl: string
  thumbnailUrl: string // small preview of what's being animated
  style: string
  status: 'processing' | 'complete' | 'error'
  videoUrl?: string
  error?: string
  startedAt: number
  completedAt?: number
}

const STORAGE_KEY = 'mymeme_animation_jobs'

export function getJobs(): AnimationJob[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveJobs(jobs: AnimationJob[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
}

export function addJob(job: AnimationJob) {
  const jobs = getJobs()
  jobs.unshift(job) // newest first
  // Keep max 20 jobs
  if (jobs.length > 20) jobs.pop()
  saveJobs(jobs)
  window.dispatchEvent(new CustomEvent('jobqueue-updated'))
}

export function updateJob(id: string, updates: Partial<AnimationJob>) {
  const jobs = getJobs()
  const idx = jobs.findIndex(j => j.id === id)
  if (idx >= 0) {
    jobs[idx] = { ...jobs[idx], ...updates }
    saveJobs(jobs)
    window.dispatchEvent(new CustomEvent('jobqueue-updated'))
  }
}

export function removeJob(id: string) {
  const jobs = getJobs().filter(j => j.id !== id)
  saveJobs(jobs)
  window.dispatchEvent(new CustomEvent('jobqueue-updated'))
}

export function getProcessingJobs(): AnimationJob[] {
  return getJobs().filter(j => j.status === 'processing')
}

export function getCompletedJobs(): AnimationJob[] {
  return getJobs().filter(j => j.status === 'complete')
}

export function clearCompletedJobs() {
  const jobs = getJobs().filter(j => j.status === 'processing')
  saveJobs(jobs)
  window.dispatchEvent(new CustomEvent('jobqueue-updated'))
}
