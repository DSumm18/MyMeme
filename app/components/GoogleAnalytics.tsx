'use client'

import Script from 'next/script'

/**
 * Google Analytics 4 Component
 * Tracks page views, user interactions, and conversions
 * 
 * To enable: Add GA_ID environment variable to Vercel
 * Format: G-XXXXXXXXXX (from Google Analytics)
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

if (!GA_ID) {
  console.warn('NEXT_PUBLIC_GA_ID not configured - Google Analytics disabled')
}

export default function GoogleAnalytics() {
  if (!GA_ID) {
    return null
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      
      {/* Initialize GA4 */}
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
            });

            // Track outbound link clicks
            document.addEventListener('click', (e) => {
              const target = e.target.closest('a');
              if (target && target.href && target.href.indexOf(location.hostname) === -1) {
                gtag('event', 'click', {
                  event_category: 'outbound',
                  event_label: target.href,
                });
              }
            });
          `,
        }}
      />
    </>
  )
}
