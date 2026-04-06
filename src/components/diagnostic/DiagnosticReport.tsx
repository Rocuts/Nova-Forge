"use client"
import { motion } from "motion/react"
import { Button } from "@/components/ui/Button"

interface ReportLabels {
  badge: string
  titleTemplate: string
  titleFallback: string
  subtitle: string
  loading: string
  whatsappMessage: string
  whatsappButton: string
  backButton: string
}

interface DiagnosticReportProps {
  reportContent: string
  isStreaming: boolean
  contactName: string
  content: ReportLabels
  locale: string
}

export function DiagnosticReport({ reportContent, isStreaming, contactName, content, locale }: DiagnosticReportProps) {
  const title = contactName
    ? content.titleTemplate.replace("{name}", contactName)
    : content.titleFallback

  const whatsappText = content.whatsappMessage.replace(
    "{name}",
    contactName ? ` (${contactName})` : ""
  )

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
            {content.badge}
          </span>
        </div>

        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
          {title}
        </h2>
        <p className="text-slate-400">{content.subtitle}</p>
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
          {reportContent ? (
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(reportContent) }} />
          ) : (
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-primary-cyan animate-pulse" />
              {content.loading}
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
          href={`https://wa.me/573015244404?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
        >
          {content.whatsappButton}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          href={locale === "en" ? "/en" : "/"}
        >
          {content.backButton}
        </Button>
      </motion.div>
    </div>
  )
}

function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[hul])/g, '$1')
    .replace(/(<\/[hul]\w*>)<\/p>/g, '$1')
}
