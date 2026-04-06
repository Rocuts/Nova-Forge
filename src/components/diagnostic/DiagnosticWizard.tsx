"use client"
import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/Button"
import { DiagnosticAnswers, INITIAL_ANSWERS } from "./types"
import { StepCompany, StepTechStack, StepPainPoints, StepGoals, StepContact } from "./WizardSteps"
import { DiagnosticReport } from "./DiagnosticReport"

const STEPS = [
  { id: "company", label: "Empresa", component: StepCompany },
  { id: "stack", label: "Tecnología", component: StepTechStack },
  { id: "pain-points", label: "Desafíos", component: StepPainPoints },
  { id: "goals", label: "Objetivos", component: StepGoals },
  { id: "contact", label: "Contacto", component: StepContact },
]

type WizardStatus = "in-progress" | "submitting" | "complete"

export function DiagnosticWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<DiagnosticAnswers>(INITIAL_ANSWERS)
  const [status, setStatus] = useState<WizardStatus>("in-progress")
  const [report, setReport] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward

  const update = useCallback((partial: Partial<DiagnosticAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...partial }))
  }, [])

  const canProceed = () => {
    switch (currentStep) {
      case 0: return answers.industry && answers.teamSize
      case 1: return answers.currentStack.length > 0
      case 2: return answers.painPoints.length > 0
      case 3: return answers.goals.length > 0 && answers.budgetRange
      case 4: return answers.contactName && answers.contactEmail
      default: return true
    }
  }

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1)
      setCurrentStep((s) => s + 1)
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((s) => s - 1)
    }
  }

  const submit = async () => {
    setStatus("submitting")
    setIsStreaming(true)
    setReport("")

    try {
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      })

      if (!res.ok) throw new Error("Error generating diagnostic")

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        setStatus("complete")
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          setReport((prev) => prev + chunk)
        }
      }
    } catch {
      setReport("Lo sentimos, hubo un error generando su diagnóstico. Por favor intente nuevamente o contáctenos directamente.")
      setStatus("complete")
    } finally {
      setIsStreaming(false)
    }
  }

  const isLastStep = currentStep === STEPS.length - 1
  const progress = ((currentStep + 1) / STEPS.length) * 100
  const CurrentStepComponent = STEPS[currentStep].component

  if (status === "complete" || status === "submitting") {
    return (
      <DiagnosticReport
        content={report}
        isStreaming={isStreaming}
        contactName={answers.contactName}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < currentStep
                  ? "bg-primary-cyan/20 text-primary-cyan border border-primary-cyan/40"
                  : i === currentStep
                    ? "bg-primary-cyan text-black"
                    : "bg-white/5 text-slate-500 border border-white/10"
              }`}>
                {i < currentStep ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block transition-colors ${
                i <= currentStep ? "text-slate-200" : "text-slate-500"
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-cyan to-accent-blue rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="glass-panel rounded-[var(--radius-lg)] p-8 md:p-10 min-h-[400px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <CurrentStepComponent answers={answers} update={update} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="secondary"
          onClick={prev}
          className={currentStep === 0 ? "opacity-0 pointer-events-none" : ""}
        >
          Anterior
        </Button>

        {isLastStep ? (
          <Button
            variant="primary"
            size="lg"
            onClick={submit}
            className={!canProceed() ? "opacity-50 pointer-events-none" : ""}
          >
            Generar Diagnóstico
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={next}
            className={!canProceed() ? "opacity-50 pointer-events-none" : ""}
          >
            Siguiente
          </Button>
        )}
      </div>
    </div>
  )
}
