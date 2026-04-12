"use client"
import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/Button"
import { DiagnosticAnswers, INITIAL_ANSWERS } from "./types"
import { StepCompany, StepTechStack, StepPainPoints, StepGoals, StepContact } from "./WizardSteps"
import { DiagnosticReport } from "./DiagnosticReport"

interface DiagnosticContent {
  steps: readonly { id: string; label: string }[]
  prev: string
  next: string
  submit: string
  errorMessage: string
  stepCompany: {
    title: string; subtitle: string; companyLabel: string; companyPlaceholder: string
    industryLabel: string; teamSizeLabel: string; roleLabel: string
  }
  stepStack: {
    title: string; subtitle: string; stackLabel: string; cloudLabel: string; aiLabel: string
  }
  stepPainPoints: {
    title: string; subtitle: string; detailLabel: string; detailPlaceholder: string
  }
  stepGoals: {
    title: string; subtitle: string; budgetLabel: string; timelineLabel: string; decisionLabel: string
  }
  stepContact: {
    title: string; subtitle: string; nameLabel: string; namePlaceholder: string
    emailLabel: string; emailPlaceholder: string; websiteLabel: string; websitePlaceholder: string
    notesLabel: string; notesPlaceholder: string
  }
}

interface ReportContent {
  badge: string
  titleTemplate: string
  titleFallback: string
  subtitle: string
  loading: string
  whatsappMessage: string
  whatsappButton: string
  backButton: string
}

interface DiagnosticOptions {
  industries: readonly string[]
  teamSizes: readonly string[]
  roles: readonly string[]
  techStack: readonly string[]
  cloudProviders: readonly string[]
  aiMaturity: readonly string[]
  painPoints: readonly string[]
  goals: readonly string[]
  budgetRanges: readonly string[]
  timelines: readonly string[]
  decisionStages: readonly string[]
}

interface Props {
  content: DiagnosticContent
  reportContent: ReportContent
  options: DiagnosticOptions
  locale: string
}

type WizardStatus = "in-progress" | "submitting" | "complete"

export function DiagnosticWizard({ content, reportContent, options, locale }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<DiagnosticAnswers>(INITIAL_ANSWERS)
  const [status, setStatus] = useState<WizardStatus>("in-progress")
  const [report, setReport] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [direction, setDirection] = useState(1)

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
    if (currentStep < content.steps.length - 1) {
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
        body: JSON.stringify({ ...answers, locale }),
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
      setReport(content.errorMessage)
      setStatus("complete")
    } finally {
      setIsStreaming(false)
    }
  }

  const isLastStep = currentStep === content.steps.length - 1
  const progress = ((currentStep + 1) / content.steps.length) * 100

  if (status === "complete" || status === "submitting") {
    return (
      <DiagnosticReport
        reportContent={report}
        isStreaming={isStreaming}
        contactName={answers.contactName}
        content={reportContent}
        locale={locale}
      />
    )
  }

  const stepComponents = [
    <StepCompany key="company" answers={answers} update={update} content={content.stepCompany} options={{ industries: options.industries, teamSizes: options.teamSizes, roles: options.roles }} />,
    <StepTechStack key="stack" answers={answers} update={update} content={content.stepStack} options={{ techStack: options.techStack, cloudProviders: options.cloudProviders, aiMaturity: options.aiMaturity }} />,
    <StepPainPoints key="pain" answers={answers} update={update} content={content.stepPainPoints} options={{ painPoints: options.painPoints }} />,
    <StepGoals key="goals" answers={answers} update={update} content={content.stepGoals} options={{ goals: options.goals, budgetRanges: options.budgetRanges, timelines: options.timelines, decisionStages: options.decisionStages }} />,
    <StepContact key="contact" answers={answers} update={update} content={content.stepContact} />,
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          {content.steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < currentStep
                  ? "bg-[#f8f8f8] text-[#0a0a0a] border border-[#0a0a0a]"
                  : i === currentStep
                    ? "bg-[#0a0a0a] text-white"
                    : "bg-[#f8f8f8] text-[#a3a3a3] border border-[#e5e5e5]"
              }`}>
                {i < currentStep ? "\u2713" : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block transition-colors ${
                i <= currentStep ? "text-[#0a0a0a]" : "text-[#a3a3a3]"
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-[#e5e5e5] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#0a0a0a] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <div className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-[6px] p-8 md:p-10 min-h-[400px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {stepComponents[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="secondary"
          onClick={prev}
          className={currentStep === 0 ? "opacity-0 pointer-events-none" : ""}
        >
          {content.prev}
        </Button>

        {isLastStep ? (
          <Button
            variant="primary"
            size="lg"
            onClick={submit}
            className={!canProceed() ? "opacity-50 pointer-events-none" : ""}
          >
            {content.submit}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={next}
            className={!canProceed() ? "opacity-50 pointer-events-none" : ""}
          >
            {content.next}
          </Button>
        )}
      </div>
    </div>
  )
}
