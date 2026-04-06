"use client"
import type { DiagnosticAnswers } from "./types"
import {
  INDUSTRIES, TEAM_SIZES, ROLES, TECH_STACK, CLOUD_PROVIDERS,
  AI_MATURITY, PAIN_POINTS, GOALS, BUDGET_RANGES, TIMELINES, DECISION_STAGES,
} from "./types"

interface StepProps {
  answers: DiagnosticAnswers
  update: (partial: Partial<DiagnosticAnswers>) => void
}

function SelectChip({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer ${
        selected
          ? "border-primary-cyan/60 bg-primary-cyan/10 text-primary-cyan shadow-[0_0_12px_rgba(0,240,255,0.15)]"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      {label}
    </button>
  )
}

function MultiSelectChips({
  options, selected, onChange,
}: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    )
  }
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <SelectChip key={opt} label={opt} selected={selected.includes(opt)} onClick={() => toggle(opt)} />
      ))}
    </div>
  )
}

function SingleSelect({
  options, value, onChange,
}: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <SelectChip key={opt} label={opt} selected={value === opt} onClick={() => onChange(opt)} />
      ))}
    </div>
  )
}

function InputField({
  label, value, onChange, placeholder, type = "text", required = false,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-primary-cyan">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/30 transition-all backdrop-blur-sm"
      />
    </div>
  )
}

// Step 1: Company Profile
export function StepCompany({ answers, update }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Perfil de su Empresa</h2>
        <p className="text-slate-400">Cuéntenos sobre su organización para personalizar el diagnóstico.</p>
      </div>
      <InputField label="Nombre de la empresa" value={answers.companyName} onChange={(v) => update({ companyName: v })} placeholder="Ej: Acme Corp" />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Industria</label>
        <SingleSelect options={INDUSTRIES} value={answers.industry} onChange={(v) => update({ industry: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Tamaño del equipo</label>
        <SingleSelect options={TEAM_SIZES} value={answers.teamSize} onChange={(v) => update({ teamSize: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Su rol</label>
        <SingleSelect options={ROLES} value={answers.role} onChange={(v) => update({ role: v })} />
      </div>
    </div>
  )
}

// Step 2: Tech Stack
export function StepTechStack({ answers, update }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Stack Tecnológico Actual</h2>
        <p className="text-slate-400">Seleccione las tecnologías que utiliza actualmente.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Lenguajes y frameworks</label>
        <MultiSelectChips options={TECH_STACK} selected={answers.currentStack} onChange={(v) => update({ currentStack: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Proveedor de nube</label>
        <SingleSelect options={CLOUD_PROVIDERS} value={answers.cloudProvider} onChange={(v) => update({ cloudProvider: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Nivel de madurez en IA</label>
        <SingleSelect options={AI_MATURITY} value={answers.aiMaturity} onChange={(v) => update({ aiMaturity: v })} />
      </div>
    </div>
  )
}

// Step 3: Pain Points
export function StepPainPoints({ answers, update }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Desafíos Actuales</h2>
        <p className="text-slate-400">Seleccione los problemas que enfrenta su organización.</p>
      </div>
      <MultiSelectChips options={PAIN_POINTS} selected={answers.painPoints} onChange={(v) => update({ painPoints: v })} />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Describa brevemente el desafío principal (opcional)</label>
        <textarea
          value={answers.painDetails}
          onChange={(e) => update({ painDetails: e.target.value })}
          placeholder="Ej: Nuestro equipo pasa 20 horas semanales procesando facturas manualmente..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/30 transition-all backdrop-blur-sm resize-none"
        />
      </div>
    </div>
  )
}

// Step 4: Goals
export function StepGoals({ answers, update }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Objetivos</h2>
        <p className="text-slate-400">Qué quiere lograr con este proyecto?</p>
      </div>
      <MultiSelectChips options={GOALS} selected={answers.goals} onChange={(v) => update({ goals: v })} />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Presupuesto estimado</label>
        <SingleSelect options={BUDGET_RANGES} value={answers.budgetRange} onChange={(v) => update({ budgetRange: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Timeline deseado</label>
        <SingleSelect options={TIMELINES} value={answers.timeline} onChange={(v) => update({ timeline: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Etapa de decisión</label>
        <SingleSelect options={DECISION_STAGES} value={answers.decisionStage} onChange={(v) => update({ decisionStage: v })} />
      </div>
    </div>
  )
}

// Step 5: Contact
export function StepContact({ answers, update }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Datos de Contacto</h2>
        <p className="text-slate-400">Para enviarle su diagnóstico personalizado.</p>
      </div>
      <InputField label="Nombre completo" value={answers.contactName} onChange={(v) => update({ contactName: v })} placeholder="Johan Rodríguez" required />
      <InputField label="Email corporativo" value={answers.contactEmail} onChange={(v) => update({ contactEmail: v })} placeholder="johan@empresa.com" type="email" required />
      <InputField label="Sitio web (opcional)" value={answers.contactWebsite} onChange={(v) => update({ contactWebsite: v })} placeholder="https://empresa.com" />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Algo más que debamos saber? (opcional)</label>
        <textarea
          value={answers.additionalNotes}
          onChange={(e) => update({ additionalNotes: e.target.value })}
          placeholder="Contexto adicional, restricciones, preferencias..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/30 transition-all backdrop-blur-sm resize-none"
        />
      </div>
    </div>
  )
}
