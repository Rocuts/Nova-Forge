import { test, expect } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import en from '../src/content/dictionaries/en'

/**
 * Gate de la landing de RealTy (v2).
 *
 * La página se dirige a un promotor inmobiliario / director comercial, no a un
 * revisor técnico: este test bloquea (a) el vocabulario de ingeniería y los
 * nombres prohibidos por CLAUDE.md, (b) la estructura de secciones, (c) el
 * etiquetado de los datos de demostración, y (d)(e)(f) las afirmaciones que la
 * regla de honestidad obliga a calificar — la ventana de activación, lo que el
 * asesor de voz NO hace, y la coherencia entre el estado del asesor y la demo
 * de voz en vivo (que depende de `REALTY_VOICE_DEMO_ENABLED`, leído en build).
 *
 * Se compara siempre en minúsculas: los chips de estado se pintan con
 * `text-transform: uppercase` y `innerText` devuelve el texto YA transformado.
 */

const dictionaries = { es, en } as const

type LocaleKey = keyof typeof dictionaries

/**
 * Jerga de ingeniería: raíces y fragmentos de identificador. Coinciden como
 * SUBCADENA para atrapar también las variantes ("idempotencia", "mocks",
 * "evaluate_offer"). Ninguna palabra de negocio en ES/EN las contiene.
 */
const FORBIDDEN_STEMS = [
  'idempot',
  'webhook',
  'gateway',
  'fixture',
  'replay',
  'mock',
  'endpoint',
  'get_lead',
  'evaluate_',
  'Cierre Autónomo',
  '%',
] as const

/**
 * Siglas y nombres propios prohibidos. Coinciden como PALABRA COMPLETA: como
 * subcadena producen falsos positivos reales en el copy legítimo — "sse" vive
 * dentro de "passes" y "dapta" dentro de "Adaptador de prueba", que es una de
 * las etiquetas de estado obligatorias.
 */
const FORBIDDEN_WORDS = [
  'HMAC',
  'JSON',
  'SSE',
  'LLM',
  'TypeScript',
  'PostgreSQL',
  'Fastify',
  'RSDubai',
  'Redminds',
  '15M',
  'Dapta',
  'Rentmies',
] as const

/** Secciones con ancla, en el orden en el que la narrativa las presenta. */
const SECTION_IDS = ['outcomes', 'journey', 'voice', 'console', 'channels', 'status', 'faq'] as const

/** Calificador obligatorio junto a la ventana de activación de 48–72 h. */
const ACTIVATION_QUALIFIER: Record<LocaleKey, string> = {
  es: 'objetivo de diseño',
  en: 'design target',
}

/**
 * El asesor de voz nunca "opera" ni está "en llamadas": con la demo apagada no
 * está desplegado, y con la demo encendida solo conversa desde el navegador —
 * las llamadas telefónicas del proyecto se activan en el piloto.
 */
const VOICE_FORBIDDEN = ['operando', 'operating', 'en llamadas', 'on calls'] as const

const countOccurrences = (haystack: string, needle: string) =>
  needle ? haystack.split(needle).length - 1 : 0

for (const locale of ['es', 'en'] as LocaleKey[]) {
  const realty = dictionaries[locale].realty

  test.describe(`/${locale}/realty`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}/realty`)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    })

    test('no engineering jargon or forbidden names in the visible copy', async ({ page }) => {
      const text = (await page.locator('main').innerText()).toLowerCase()

      const found = [
        ...FORBIDDEN_STEMS.filter((term) => text.includes(term.toLowerCase())),
        ...FORBIDDEN_WORDS.filter((term) =>
          new RegExp(`\\b${term.toLowerCase()}\\b`).test(text)
        ),
      ]
      expect(found, `términos prohibidos en /${locale}/realty`).toEqual([])
    })

    test('sections appear in narrative order', async ({ page }) => {
      const selector = SECTION_IDS.map((id) => `#${id}`).join(', ')
      const ids = await page.locator(selector).evaluateAll((nodes) => nodes.map((node) => node.id))
      expect(ids).toEqual([...SECTION_IDS])
    })

    test('demo data is labelled on every visual frame', async ({ page }) => {
      const text = (await page.locator('main').innerText()).toLowerCase()
      const label = realty.demoLabel.toLowerCase()

      expect(label.length, 'demoLabel debe existir en el diccionario').toBeGreaterThan(0)
      expect(countOccurrences(text, label)).toBeGreaterThanOrEqual(2)
    })

    test('the activation window always carries its qualifier', async ({ page }) => {
      const status = (await page.locator('#status').innerText()).toLowerCase()

      expect(status).toContain('48–72')
      expect(status).toContain(ACTIVATION_QUALIFIER[locale])
    })

    test('the voice advisor never claims to take the development calls', async ({ page }) => {
      const voice = (await page.locator('#voice').innerText()).toLowerCase()

      const claims = VOICE_FORBIDDEN.filter((term) => voice.includes(term))
      expect(claims, 'el asesor de voz no atiende las llamadas del proyecto').toEqual([])
    })

    /**
     * La demo de voz en vivo depende de `REALTY_VOICE_DEMO_ENABLED`, que se lee
     * en build: el mismo código produce dos páginas honestas distintas y el test
     * tiene que aceptar las dos. La presencia del botón de la demo es lo que
     * decide cuál, y todo lo demás debe ser coherente con esa señal — nunca una
     * demo funcionando junto a una fila que la llama "validada".
     */
    test('the voice advisor state matches the live demo flag', async ({ page }) => {
      const startButton = page.getByRole('button', { name: realty.voice.demo.start })
      const demoEnabled = (await startButton.count()) > 0

      const voice = (await page.locator('#voice').innerText()).toLowerCase()
      const status = (await page.locator('#status').innerText()).toLowerCase()

      if (demoEnabled) {
        await expect(startButton.first()).toBeVisible()
        expect(voice).toContain(realty.statusLabels.built.toLowerCase())
        expect(voice).not.toContain(realty.statusLabels.validated.toLowerCase())
        // El consentimiento se lee ANTES de pulsar: micrófono, quién procesa la
        // conversación, cuánto dura y que los datos son ficticios.
        expect(voice).toContain(realty.voice.demo.consent.toLowerCase())
        expect(status).toContain(realty.status.liveVoiceRow.note.toLowerCase())
      } else {
        expect(voice).toContain(realty.statusLabels.validated.toLowerCase())
        expect(voice).not.toContain(realty.voice.demo.title.toLowerCase())
        expect(status).not.toContain(realty.status.liveVoiceRow.note.toLowerCase())
      }
    })
  })
}
