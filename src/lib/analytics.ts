type AnalyticsEvent =
  | 'hero_cta_primary'
  | 'hero_cta_services'
  | 'cta_final_click'
  | 'contact_click'
  | 'scheduling_click'
  | 'mobile_menu_open'
  | 'mobile_menu_close'
  | 'faq_expand'
  | (string & {})

interface AnalyticsProvider {
  track: (event: string, properties?: Record<string, unknown>) => void
}

const consoleProvider: AnalyticsProvider = {
  track: (event, properties) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${event}`, properties)
    }
  },
}

let provider: AnalyticsProvider = consoleProvider

export function setAnalyticsProvider(p: AnalyticsProvider) {
  provider = p
}

export function trackEvent(eventName: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    provider.track(eventName, properties)
  }
}
