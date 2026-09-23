import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import es from '../src/content/dictionaries/es'
import en from '../src/content/dictionaries/en'

/**
 * Copy de riesgo (diseño §9.1 y §9.2).
 *
 * Extracción de datos no puede volver a prometer infraestructura de evasión
 * (proxies residenciales, resolución de CAPTCHAs) ni recolección en la dark
 * web, y la home no puede insinuar personal con habilitación de seguridad
 * ("clearance"). Orbexs no puede respaldar ninguna de esas afirmaciones.
 *
 * Excepción deliberada a la convención del plan (§3.7, "textos esperados desde
 * los diccionarios"): el copy aprobado se fija aquí como literal, porque vigilar
 * ESE texto es el propósito del archivo. Leerlo del diccionario haría que la
 * prueba pasara con cualquier copy. Quien lo cambie, lo cambia aquí a conciencia.
 */

const dictionaries = { es, en } as const

type LocaleKey = keyof typeof dictionaries

const EXTRACTION_ROUTE: Record<LocaleKey, string> = {
  es: '/es/extraccion-datos',
  en: '/en/data-extraction',
}

/**
 * Lo que Extracción de datos no puede mostrar, ni en el texto ni en el JSON-LD
 * (diseño §12.7). También se vigila en llms.txt.
 */
const EXTRACTION_FORBIDDEN = [/\bprox(?:y|ies)\b/i, /\bdark\s+web\b/i, /captcha/i]

/**
 * El resto del discurso anterior (barrido de la tarea 3 en el plan), que podría
 * volver sin ninguna de las tres palabras de arriba. Solo se busca en la página
 * de Extracción de datos: en llms.txt, "residential" o "headless" pueden ser
 * copy legítimo de otras páginas (p. ej., promotores residenciales de RealTy).
 */
const EXTRACTION_OLD_PITCH = [
  /\bresidencial(?:es)?\b|\bresidential\b/i,
  /\bsin bloqueos\b|\bunblocked\b/i,
  /\bagencias de inteligencia\b|\bintelligence agencies\b/i,
  /\bheadless\b/i,
]

/** Habilitación de seguridad que la FAQ de la home no puede afirmar. */
const CLEARANCE = /\bclearance\b|\bcleared\b/i

interface ApprovedFeature {
  title: string
  description: string
}

interface ApprovedCopy {
  /** `features[2]` y `features[3]`, título y descripción. */
  features: readonly [ApprovedFeature, ApprovedFeature]
  /** `capabilities[0].items`. */
  collection: readonly [string, string, string]
  /** Frase nueva de `faq.items[3].answer`. */
  confidentiality: string
}

const APPROVED: Record<LocaleKey, ApprovedCopy> = {
  es: {
    features: [
      {
        title: 'Portales y Registros Públicos',
        description: 'Extracción desde portales gubernamentales, registros públicos y documentos escaneados.',
      },
      {
        title: 'OSINT de Fuentes Abiertas',
        description:
          'Recolección sistemática de medios, foros y redes sociales públicas para análisis de riesgo y reputación.',
      },
    ],
    collection: ['Colectores Programados', 'Renderizado de Páginas Dinámicas', 'Detección de Cambios en la Fuente'],
    confidentiality: 'un equipo dedicado bajo acuerdos de confidencialidad',
  },
  en: {
    features: [
      {
        title: 'Public Portals & Registries',
        description: 'Extraction from government portals, public registries, and scanned documents.',
      },
      {
        title: 'Open-Source OSINT',
        description:
          'Systematic collection from media outlets, forums, and public social media for risk and reputation analysis.',
      },
    ],
    collection: ['Scheduled Collectors', 'Dynamic Page Rendering', 'Source Change Detection'],
    confidentiality: 'a dedicated team bound by confidentiality agreements',
  },
}

/** Entidades JSON-LD de la página, aplanadas (un <script> puede traer un array). */
async function jsonLdEntities(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.flatMap((block) => {
    const parsed = JSON.parse(block)
    return Array.isArray(parsed) ? parsed : [parsed]
  })
}

for (const locale of ['es', 'en'] as LocaleKey[]) {
  const dict = dictionaries[locale]
  const approved = APPROVED[locale]

  test.describe(`copy de riesgo (${locale})`, () => {
    test('Extracción de datos no promete evasión ni dark web', async ({ page }) => {
      const product = dict.products.dataExtraction

      // El copy nuevo está en su sitio del diccionario…
      expect(product.features.slice(2, 4)).toEqual(approved.features)
      expect(product.capabilities[0].items).toEqual(approved.collection)

      // …y la página lo muestra, sin rastro del copy anterior.
      await page.goto(EXTRACTION_ROUTE[locale])
      const main = page.locator('main')
      await expect(main).toContainText(product.subtitle)

      const visible = await main.innerText()
      const structured = JSON.stringify(await jsonLdEntities(page))
      for (const pattern of [...EXTRACTION_FORBIDDEN, ...EXTRACTION_OLD_PITCH]) {
        expect(visible, `${pattern} en el texto visible`).not.toMatch(pattern)
        expect(structured, `${pattern} en el JSON-LD`).not.toMatch(pattern)
      }
      const featureTexts = approved.features.flatMap((feature) => [feature.title, feature.description])
      for (const text of [...featureTexts, ...approved.collection]) {
        expect(visible).toContain(text)
      }
    })

    test('la FAQ de la home no habla de clearance', async ({ page }) => {
      const item = dict.faq.items[3]
      expect(item.answer).not.toMatch(CLEARANCE)
      expect(item.answer).toContain(approved.confidentiality)

      await page.goto(`/${locale}`)

      // Datos estructurados (lo que leen los buscadores): FAQPage desde dict.faq.items.
      const faqPage = (await jsonLdEntities(page)).find((entity) => entity['@type'] === 'FAQPage')
      expect(faqPage, 'la home publica un FAQPage').toBeDefined()
      const structured = JSON.stringify(faqPage)
      expect(structured).not.toMatch(CLEARANCE)
      expect(structured).toContain(approved.confidentiality)

      // Texto visible: la respuesta solo se monta al abrir su pregunta.
      const faqSection = page.locator(`#${dict.faq.sectionId}`)
      await faqSection.getByRole('button', { name: item.question }).click()
      await expect(faqSection).toContainText(approved.confidentiality)
      await expect(faqSection).not.toContainText(CLEARANCE)
    })
  })
}

test('llms.txt no repite el copy de riesgo', async ({ request }) => {
  const response = await request.get('/llms.txt')
  expect(response.ok()).toBe(true)

  const body = await response.text()
  expect(body).not.toMatch(CLEARANCE)
  for (const pattern of EXTRACTION_FORBIDDEN) {
    expect(body).not.toMatch(pattern)
  }
  expect(body).toContain(APPROVED.es.confidentiality)
  expect(body).toContain(APPROVED.en.confidentiality)
})
