'use client'

import { useState, useEffect } from 'react'
import { getJobs, removeJob, clearCompletedJobs, type AnimationJob } from '@/lib/job-queue'

export default function JobTray() {
  const [jobs, setJobs] = useState<AnimationJob[]>([])
  const [open, setOpen] = useState(false)
  const [hasNewComplete, setHasNewComplete] = useState(false)

  useEffect(() => {
    const refresh = () => {
      const allJobs = getJobs()
      setJobs(allJobs)
      // Check for newly completed jobs
      const completed = allJobs.filter(j => j.status === 'complete' && j.completedAt && Date.now() - j.completedAt < 5000)
      if (completed.length > 0) {
        setHasNewComplete(true)
        setOpen(true) // auto-open when job completes
      }
    }
    refresh()
    window.addEventListener('jobqueue-updated', refresh)
    // Also poll for UI refresh during processing
    const interval = setInterval(refresh, 3000)
    return () => {
      window.removeEventListener('jobqueue-updated', refresh)
      clearInterval(interval)
    }
  }, [])

  const processing = jobs.filter(j => j.status === 'processing')
  const completed = jobs.filter(j => j.status === 'complete')
  const errors = jobs.filter(j => j.status === 'error')

  // Don't show if no jobs at all
  if (jobs.length === 0) return null

  const badgeCount = processing.length + (hasNewComplete ? completed.length : 0)

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(!open); setHasNewComplete(false) }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110 ${
          processing.length > 0
            ? 'bg-gradient-to-r from-[#9B59B6] to-[#FF6B9D] animate-pulse'
            : completed.length > 0
              ? 'bg-[#6BCB77]'
              : 'bg-gray-400'
        }`}
      >
        🎬
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
            {badgeCount}
          </span>
        )}
      </button>

      {/* Tray panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg">🎬 Animations</h3>
            {completed.length > 0 && (
              <button 
                onClick={() => clearCompletedJobs()} 
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Clear done
              </button>
            )}
          </div>

          {jobs.length === 0 && (
            <div className="p-6 text-center text-gray-400">No animations yet</div>
          )}

          <div className="divide-y">
            {jobs.map(job => (
              <div key={job.id} className="p-3 flex items-center gap-3">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={job.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {job.style || 'Animation'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {job.status === 'processing' && (
                      <span className="text-purple-500">
                        ⏳ Processing... {Math.min(95, Math.round((Date.now() - job.startedAt) / 3000))}%
                      </span>
                    )}
                    {job.status === 'complete' && (
                      <span className="text-green-500">✅ Ready!</span>
                    )}
                    {job.status === 'error' && (
                      <span className="text-red-500">❌ {job.error}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {job.status === 'complete' && job.videoUrl && (
                  <a
                    href={job.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-[#9B59B6] text-white px-3 py-1 rounded-full hover:scale-105 transition"
                  >
                    View
                  </a>
                )}
                <button
                  onClick={() => removeJob(job.id)}
                  className="text-gray-300 hover:text-red-500 text-lg"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
