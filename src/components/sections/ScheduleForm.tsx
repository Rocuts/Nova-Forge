"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CalendarCheck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface ScheduleFormProps {
  content: {
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    companyLabel: string
    companyPlaceholder: string
    topicLabel: string
    topics: readonly string[]
    messageLabel: string
    messagePlaceholder: string
    submitButton: string
    successTitle: string
    successMessage: string
    whatsappButton: string
    backButton: string
  }
  locale: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const WHATSAPP_URL = "https://wa.me/573015244404"

function buildWhatsAppText(
  name: string,
  company: string,
  topic: string,
  message: string,
): string {
  const lines = [
    `*Nombre:* ${name}`,
    company && `*Empresa:* ${company}`,
    `*Tema:* ${topic}`,
    message && `*Mensaje:* ${message}`,
  ].filter(Boolean)
  return encodeURIComponent(lines.join("\n"))
}

export function ScheduleForm({ content, locale }: ScheduleFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [topic, setTopic] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const isEmailValid = EMAIL_REGEX.test(email)
  const isFormValid = name.trim() !== "" && isEmailValid && topic !== ""

  // Auto-focus name field on mount
  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  // Move focus to success state when submitted
  useEffect(() => {
    if (submitted) {
      successRef.current?.focus()
    }
  }, [submitted])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isFormValid) return

    const text = buildWhatsAppText(name, company, topic, message)
    window.open(`${WHATSAPP_URL}?text=${text}`, "_blank")
    setSubmitted(true)
  }

  const backHref = locale === "es" ? "/" : "/en"

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="glass-panel rounded-2xl border border-surface-border p-8 md:p-10"
          >
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Name */}
              <div>
                <label
                  htmlFor="schedule-name"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  {content.nameLabel}{" "}
                  <span className="text-primary-cyan">*</span>
                </label>
                <input
                  ref={nameRef}
                  id="schedule-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={content.namePlaceholder}
                  className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/30 transition-all backdrop-blur-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="schedule-email"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  {content.emailLabel}{" "}
                  <span className="text-primary-cyan">*</span>
                </label>
                <input
                  id="schedule-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={content.emailPlaceholder}
                  className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/30 transition-all backdrop-blur-sm"
                  aria-invalid={email.length > 0 && !isEmailValid}
                />
              </div>

              {/* Company */}
              <div>
                <label
                  htmlFor="schedule-company"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  {content.companyLabel}
                </label>
                <input
                  id="schedule-company"
                  type="text"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={content.companyPlaceholder}
                  className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/30 transition-all backdrop-blur-sm"
                />
              </div>

              {/* Topic (chip-based single select) */}
              <fieldset>
                <legend className="block text-sm font-medium text-slate-300 mb-3">
                  {content.topicLabel}{" "}
                  <span className="text-primary-cyan">*</span>
                </legend>
                <div className="flex flex-wrap gap-3" role="radiogroup">
                  {content.topics.map((t) => {
                    const isSelected = topic === t
                    return (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setTopic(t)}
                        className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-primary-cyan/60 bg-primary-cyan/10 text-primary-cyan shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              {/* Message */}
              <div>
                <label
                  htmlFor="schedule-message"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  {content.messageLabel}
                </label>
                <textarea
                  id="schedule-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={content.messagePlaceholder}
                  className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/30 transition-all backdrop-blur-sm resize-none"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!isFormValid}
                className="w-full"
              >
                {content.submitButton}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            ref={successRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass-panel rounded-2xl border border-surface-border p-10 md:p-14 text-center outline-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.15,
              }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-cyan/15 flex items-center justify-center"
            >
              <CalendarCheck className="w-8 h-8 text-primary-cyan" />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {content.successTitle}
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              {content.successMessage}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                size="md"
                href={`${WHATSAPP_URL}?text=${buildWhatsAppText(name, company, topic, message)}`}
                target="_blank"
              >
                {content.whatsappButton}
              </Button>
              <Button
                variant="secondary"
                size="md"
                href={backHref}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {content.backButton}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
