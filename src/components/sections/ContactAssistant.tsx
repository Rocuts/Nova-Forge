"use client"

import { useEffect, useId, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MessageCircle, X, Send } from "lucide-react"

import { siteConfig } from "@/config/site"

type Message = {
  id: string
  role: "system" | "user"
  content: string
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "system",
  content: "¿Tienes alguna pregunta? Escríbenos y te responderemos a la brevedad.",
}

export function ContactAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [inputValue, setInputValue] = useState("")
  const [sent, setSent] = useState(false)
  const hasOpenedRef = useRef(false)
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dialogTitleId = useId()

  const closeAssistant = () => setIsOpen(false)

  useEffect(() => {
    if (!isOpen) {
      if (hasOpenedRef.current) {
        openButtonRef.current?.focus()
      }
      return
    }

    hasOpenedRef.current = true
    inputRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAssistant()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault()
    if (!inputValue.trim() || sent) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    }

    const confirmationMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "system",
      content: "Gracias por tu mensaje. Te contactaremos pronto.",
    }

    setMessages((prev) => [...prev, userMessage, confirmationMessage])

    const text = encodeURIComponent(inputValue)
    window.open(`https://wa.me/573015244404?text=${text}`, "_blank")

    setInputValue("")
    setSent(true)
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            ref={openButtonRef}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-cyan text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-shadow"
            aria-label="Abrir contacto"
          >
            <MessageCircle size={24} className="stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-[400px] h-[500px] max-h-[80vh] flex flex-col glass-panel rounded-2xl overflow-hidden border border-surface-border shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
          >
            <div className="flex items-center justify-between p-4 border-b border-surface-border bg-surface-elevated/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-cyan/20 flex items-center justify-center text-primary-cyan">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <h3 id={dialogTitleId} className="font-medium text-sm">
                    Contacto Rápido
                  </h3>
                  <span className="text-xs text-text-secondary">
                    Te responderemos pronto
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAssistant}
                className="p-2 rounded-full hover:bg-surface-border text-text-secondary transition-colors"
                aria-label="Cerrar contacto"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-base/80">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary-cyan text-black rounded-tr-sm"
                        : "bg-surface-elevated border border-surface-border text-text-primary rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-surface-border bg-surface-elevated/50">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder={sent ? "Mensaje enviado" : "Escribe tu mensaje..."}
                  disabled={sent}
                  className="w-full bg-surface-base border border-surface-border rounded-full py-2.5 pl-4 pr-12 text-sm text-text-primary focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/50 transition-all placeholder:text-text-secondary disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || sent}
                  className="absolute right-2 p-1.5 rounded-full text-primary-cyan hover:bg-primary-cyan/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  aria-label="Enviar mensaje"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
