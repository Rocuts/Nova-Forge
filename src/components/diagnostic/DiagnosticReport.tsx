"use client"
import { motion } from "motion/react"
import { Button } from "@/components/ui/Button"
import { siteConfig } from "@/config/site"

interface DiagnosticReportProps {
  content: string
  isStreaming: boolean
  contactName: string
}

export function DiagnosticReport({ content, isStreaming, contactName }: DiagnosticReportProps) {
  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-cyan/30 bg-primary-cyan/5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-cyan/80">
            Diagnóstico Generado
          </span>
        </div>

        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
          {contactName ? `Diagnóstico para ${contactName}` : "Su Diagnóstico Técnico"}
        </h2>
        <p className="text-slate-400">Análisis personalizado basado en sus respuestas.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-panel rounded-[var(--radius-lg)] p-8 md:p-10"
      >
        <div className="prose prose-invert prose-sm md:prose-base max-w-none
          prose-headings:font-heading prose-headings:text-white prose-headings:tracking-tight
          prose-h2:text-xl prose-h2:md:text-2xl prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-lg prose-h3:md:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-li:text-slate-300
          prose-strong:text-primary-cyan prose-strong:font-semibold
          prose-ul:space-y-1
        ">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }} />
          ) : (
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-primary-cyan animate-pulse" />
              Generando diagnóstico...
            </div>
          )}
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-primary-cyan/60 animate-pulse ml-0.5" />
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isStreaming ? 0 : 1, y: isStreaming ? 20 : 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
      >
        <Button
          size="lg"
          variant="primary"
          href={siteConfig.links.scheduling}
        >
          Agendar Consulta Estratégica
        </Button>
        <Button
          size="lg"
          variant="secondary"
          href="/"
        >
          Volver al Inicio
        </Button>
      </motion.div>
    </div>
  )
}

function formatMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[hul])/g, '$1')
    .replace(/(<\/[hul]\w*>)<\/p>/g, '$1')
}
