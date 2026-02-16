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
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">🍪 We value your privacy</h3>
                <p className="text-sm text-gray-500">
                  We use cookies to enhance your experience, analyse traffic, and personalise content.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-gray-400 hover:text-gray-900 transition-colors underline"
                >
                  Customise
                </button>
                <button
                  onClick={() => accept(false)}
                  className="px-4 py-2 text-sm rounded-lg border-2 border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={() => accept(true)}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors font-bold"
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
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    {[
                      { key: 'essential', label: 'Essential', desc: 'Required for the website to function.', locked: true },
                      { key: 'statistics', label: 'Statistics', desc: 'Help us understand how visitors use our site.' },
                      { key: 'marketing', label: 'Marketing', desc: 'Used to deliver relevant advertisements.' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{item.label}</span>
                          <span className="text-xs text-gray-400 ml-2">{item.desc}</span>
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
                          <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-gray-900 transition-colors" />
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform shadow" />
                        </div>
                      </label>
                    ))}
                    <button
                      onClick={() => accept(false)}
                      className="mt-2 px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors font-bold"
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
