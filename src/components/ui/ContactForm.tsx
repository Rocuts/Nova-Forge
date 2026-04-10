"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

// To activate emails, user must swap this with their Formspree Endpoint URL
// e.g. "https://formspree.io/f/xabcdefg"
const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_URL || ""

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!FORMSPREE_ENDPOINT) {
      // Simulation mode if no endpoint is configured
      setStatus("submitting")
      await new Promise(resolve => setTimeout(resolve, 1500))
      setStatus("success")
      return
    }

    setStatus("submitting")
    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      })
      if (response.ok) {
        setStatus("success")
        form.reset()
      } else {
        setStatus("error")
      }
    } catch (error) {
      setStatus("error")
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto text-left">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-8 text-center bg-surface-elevated/40 border border-primary-cyan/30 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.15)] backdrop-blur-xl"
          >
            <div className="w-16 h-16 rounded-full bg-primary-cyan/10 flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-primary-cyan" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Solicitud Recibida</h3>
            <p className="text-slate-400 leading-relaxed">
              Nuestro equipo técnico analizará tu requerimiento y nos pondremos en contacto contigo a la brevedad.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-8 text-primary-cyan text-sm font-medium hover:text-white transition-colors"
            >
              Enviar otro mensaje
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 p-8 bg-surface-base border border-surface-border rounded-2xl relative overflow-hidden group shadow-2xl"
          >
            {/* Background subtle active glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/5 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {status === "error" && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Ocurrió un error al enviar el mensaje. Por favor, intenta de nuevo.</span>
              </div>
            )}

            <div className="space-y-1 z-10">
              <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full bg-surface-elevated/50 border border-surface-border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/50 transition-all shadow-inner"
                placeholder="Ingeniero Doe"
              />
            </div>

            <div className="space-y-1 z-10">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-surface-elevated/50 border border-surface-border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/50 transition-all shadow-inner"
                placeholder="doe@empresa.com"
              />
            </div>

            <div className="space-y-1 z-10">
              <label htmlFor="message" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Objetivo / Requerimiento</label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="w-full bg-surface-elevated/50 border border-surface-border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/50 transition-all shadow-inner resize-none"
                placeholder="Describe los procesos que deseas automatizar u optimizar..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-2 w-full relative group overflow-hidden rounded-xl bg-zinc-100 text-zinc-900 font-bold py-4 hover:bg-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed z-10"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Asignando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Solicitar Diagnóstico
                  </>
                )}
              </span>
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
