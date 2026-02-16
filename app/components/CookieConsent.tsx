'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CookieConsent() {
  const [show, setShow] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true,
    statistics: false,
    marketing: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = (all: boolean) => {
    const prefs = all
      ? { essential: true, statistics: true, marketing: true }
      : preferences
    localStorage.setItem('cookie-consent', JSON.stringify(prefs))
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="cookie-banner"
        >
          <div className="max-w-4xl mx-auto glass rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">🍪 We value your privacy</h3>
                <p className="text-sm text-white/60">
                  We use cookies to enhance your experience, analyse traffic, and personalise content.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-white/50 hover:text-white transition-colors underline"
                >
                  Customise
                </button>
                <button
                  onClick={() => accept(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={() => accept(true)}
                  className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors font-medium"
                >
                  Accept All
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    {[
                      { key: 'essential', label: 'Essential', desc: 'Required for the website to function.', locked: true },
                      { key: 'statistics', label: 'Statistics', desc: 'Help us understand how visitors use our site.' },
                      { key: 'marketing', label: 'Marketing', desc: 'Used to deliver relevant advertisements.' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                        <div>
                          <span className="text-sm font-medium text-white">{item.label}</span>
                          <span className="text-xs text-white/40 ml-2">{item.desc}</span>
                        </div>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={preferences[item.key as keyof typeof preferences]}
                            onChange={(e) =>
                              !item.locked &&
                              setPreferences((p) => ({ ...p, [item.key]: e.target.checked }))
                            }
                            disabled={item.locked}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-purple-600 transition-colors" />
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                        </div>
                      </label>
                    ))}
                    <button
                      onClick={() => accept(false)}
                      className="mt-2 px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors font-medium"
                    >
                      Save Preferences
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
