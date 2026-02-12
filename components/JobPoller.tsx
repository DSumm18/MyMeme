'use client'

import { useEffect, useRef } from 'react'
import { getProcessingJobs, updateJob } from '@/lib/job-queue'

// This component runs in the background (in layout) and polls all processing jobs
export default function JobPoller() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const pollJobs = async () => {
      const processing = getProcessingJobs()
      if (processing.length === 0) return

      for (const job of processing) {
        // Timeout after 10 minutes
        if (Date.now() - job.startedAt > 10 * 60 * 1000) {
          updateJob(job.id, { status: 'error', error: 'Timed out after 10 minutes', completedAt: Date.now() })
          continue
        }

        try {
          const res = await fetch('/api/animate/poll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskUUID: job.taskUUID }),
          })
          const data = await res.json()

          if (data.status === 'complete') {
            updateJob(job.id, { 
              status: 'complete', 
              videoUrl: data.videoUrl, 
              completedAt: Date.now() 
            })
            // Play notification sound
            playNotificationSound()
            // Show browser notification if allowed
            showBrowserNotification(job.style)
          } else if (data.status === 'error') {
            updateJob(job.id, { 
              status: 'error', 
              error: data.error || 'Generation failed', 
              completedAt: Date.now() 
            })
          }
        } catch {
          // Network error - don't mark as failed, just retry next poll
        }
      }
    }

    // Poll every 5 seconds
    intervalRef.current = setInterval(pollJobs, 5000)
    // Run immediately too
    pollJobs()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return null // invisible component
}

function playNotificationSound() {
  try {
    const actx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const playTone = (freq: number, start: number, dur: number) => {
      const osc = actx.createOscillator()
      const gain = actx.createGain()
      osc.connect(gain)
      gain.connect(actx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, actx.currentTime + start)
      gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + start + dur)
      osc.start(actx.currentTime + start)
      osc.stop(actx.currentTime + start + dur)
    }
    playTone(523, 0, 0.15)
    playTone(659, 0.1, 0.15)
    playTone(784, 0.2, 0.3)
  } catch {}
}

function showBrowserNotification(style: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🎬 Animation Ready!', {
      body: `Your ${style} animation is complete!`,
      icon: '/icon-192.png',
    })
  }
}
