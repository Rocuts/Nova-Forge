"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CalendarCheck, ArrowLeft } from "lucide-react"

interface ScheduleFormProps {
  content: {
    badge: string
    pageTitle: string
    pageSubtitle: string
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel — dark */}
      <div className="w-full md:w-5/12 bg-[#0a0a0a] text-white p-8 md:p-16 lg:p-20 flex flex-col justify-center min-h-[40vh] md:min-h-screen md:sticky md:top-0">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#a3a3a3]">
          {content.badge}
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading tracking-tight mt-6 mb-8 leading-[1.1]">
          {content.pageTitle}
        </h1>
        <p className="text-[#a3a3a3] text-lg leading-relaxed max-w-md">
          {content.pageSubtitle}
        </p>

        {/* Contact info at bottom */}
        <div className="mt-auto pt-16 hidden md:block">
          <div className="border-t border-white/10 pt-6">
            <p className="text-[#a3a3a3] text-sm">contacto@novaforge.io</p>
          </div>
        </div>
      </div>

      {/* Right panel — light, form */}
      <div className="w-full md:w-7/12 bg-white p-8 md:p-16 lg:p-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-xl"
            >
              <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                {/* Name */}
                <div>
                  <label
                    htmlFor="schedule-name"
                    className="block text-sm font-medium text-[#0a0a0a] mb-2"
                  >
                    {content.nameLabel}{" "}
                    <span className="text-[#0a0a0a]">*</span>
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
                    className="w-full bg-white border-b border-[#e5e5e5] py-4 text-[#0a0a0a] text-base placeholder:text-[#a3a3a3] focus:border-[#0a0a0a] focus:outline-none transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="schedule-email"
                    className="block text-sm font-medium text-[#0a0a0a] mb-2"
                  >
                    {content.emailLabel}{" "}
                    <span className="text-[#0a0a0a]">*</span>
                  </label>
                  <input
                    id="schedule-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={content.emailPlaceholder}
                    className="w-full bg-white border-b border-[#e5e5e5] py-4 text-[#0a0a0a] text-base placeholder:text-[#a3a3a3] focus:border-[#0a0a0a] focus:outline-none transition-colors"
                    aria-invalid={email.length > 0 && !isEmailValid}
                  />
                </div>

                {/* Company */}
                <div>
                  <label
                    htmlFor="schedule-company"
                    className="block text-sm font-medium text-[#0a0a0a] mb-2"
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
                    className="w-full bg-white border-b border-[#e5e5e5] py-4 text-[#0a0a0a] text-base placeholder:text-[#a3a3a3] focus:border-[#0a0a0a] focus:outline-none transition-colors"
                  />
                </div>

                {/* Topic (chip-based single select) */}
                <fieldset>
                  <legend className="block text-sm font-medium text-[#0a0a0a] mb-3">
                    {content.topicLabel}{" "}
                    <span className="text-[#0a0a0a]">*</span>
                  </legend>
                  <div className="flex flex-wrap gap-2" role="radiogroup">
                    {content.topics.map((t) => {
                      const isSelected = topic === t
                      return (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setTopic(t)}
                          className={`px-4 py-2 rounded-[2px] border text-sm font-medium transition-colors duration-200 cursor-pointer ${
                            isSelected
                              ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                              : "border-[#e5e5e5] bg-white text-[#525252] hover:border-[#0a0a0a]/30"
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
                    className="block text-sm font-medium text-[#0a0a0a] mb-2"
                  >
                    {content.messageLabel}
                  </label>
                  <textarea
                    id="schedule-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={content.messagePlaceholder}
                    className="w-full bg-white border-b border-[#e5e5e5] py-4 text-[#0a0a0a] text-base placeholder:text-[#a3a3a3] focus:border-[#0a0a0a] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full bg-[#0a0a0a] text-white py-4 text-base font-medium rounded-[2px] hover:bg-[#1a1a1a] transition-colors mt-10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {content.submitButton}
                </button>
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
              className="w-full max-w-xl outline-none"
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
                className="w-16 h-16 mb-8 rounded-full border border-[#e5e5e5] flex items-center justify-center"
              >
                <CalendarCheck className="w-8 h-8 text-[#0a0a0a]" />
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#0a0a0a] mb-4 tracking-tight">
                {content.successTitle}
              </h2>
              <p className="text-[#525252] text-lg mb-10 max-w-md leading-relaxed">
                {content.successMessage}
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <a
                  href={`${WHATSAPP_URL}?text=${buildWhatsAppText(name, company, topic, message)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-[#0a0a0a] text-white px-8 py-4 text-base font-medium rounded-[2px] hover:bg-[#1a1a1a] transition-colors"
                >
                  {content.whatsappButton}
                </a>
                <a
                  href={backHref}
                  className="inline-flex items-center justify-center border border-[#e5e5e5] text-[#0a0a0a] px-8 py-4 text-base font-medium rounded-[2px] hover:bg-[#f8f8f8] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {content.backButton}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
