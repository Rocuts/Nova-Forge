"use client"
import type { DiagnosticAnswers } from "./types"

interface StepProps {
  answers: DiagnosticAnswers
  update: (partial: Partial<DiagnosticAnswers>) => void
}

interface StepCompanyProps extends StepProps {
  content: {
    title: string
    subtitle: string
    companyLabel: string
    companyPlaceholder: string
    industryLabel: string
    teamSizeLabel: string
    roleLabel: string
  }
  options: {
    industries: readonly string[]
    teamSizes: readonly string[]
    roles: readonly string[]
  }
}

interface StepTechStackProps extends StepProps {
  content: {
    title: string
    subtitle: string
    stackLabel: string
    cloudLabel: string
    aiLabel: string
  }
  options: {
    techStack: readonly string[]
    cloudProviders: readonly string[]
    aiMaturity: readonly string[]
  }
}

interface StepPainPointsProps extends StepProps {
  content: {
    title: string
    subtitle: string
    detailLabel: string
    detailPlaceholder: string
  }
  options: {
    painPoints: readonly string[]
  }
}

interface StepGoalsProps extends StepProps {
  content: {
    title: string
    subtitle: string
    budgetLabel: string
    timelineLabel: string
    decisionLabel: string
  }
  options: {
    goals: readonly string[]
    budgetRanges: readonly string[]
    timelines: readonly string[]
    decisionStages: readonly string[]
  }
}

interface StepContactProps extends StepProps {
  content: {
    title: string
    subtitle: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    websiteLabel: string
    websitePlaceholder: string
    notesLabel: string
    notesPlaceholder: string
  }
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
}: { options: readonly string[]; selected: string[]; onChange: (v: string[]) => void }) {
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
}: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
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

export function StepCompany({ answers, update, content, options }: StepCompanyProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">{content.title}</h2>
        <p className="text-slate-400">{content.subtitle}</p>
      </div>
      <InputField label={content.companyLabel} value={answers.companyName} onChange={(v) => update({ companyName: v })} placeholder={content.companyPlaceholder} />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">{content.industryLabel}</label>
        <SingleSelect options={options.industries} value={answers.industry} onChange={(v) => update({ industry: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">{content.teamSizeLabel}</label>
        <SingleSelect options={options.teamSizes} value={answers.teamSize} onChange={(v) => update({ teamSize: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">{content.roleLabel}</label>
        <SingleSelect options={options.roles} value={answers.role} onChange={(v) => update({ role: v })} />
      </div>
    </div>
  )
}

export function StepTechStack({ answers, update, content, options }: StepTechStackProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">{content.title}</h2>
        <p className="text-slate-400">{content.subtitle}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">{content.stackLabel}</label>
        <MultiSelectChips options={options.techStack} selected={answers.currentStack} onChange={(v) => update({ currentStack: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">{content.cloudLabel}</label>
        <SingleSelect options={options.cloudProviders} value={answers.cloudProvider} onChange={(v) => update({ cloudProvider: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">{content.aiLabel}</label>
        <SingleSelect options={options.aiMaturity} value={answers.aiMaturity} onChange={(v) => update({ aiMaturity: v })} />
      </div>
    </div>
  )
}

export function StepPainPoints({ answers, update, content, options }: StepPainPointsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">{content.title}</h2>
        <p className="text-slate-400">{content.subtitle}</p>
      </div>
      <MultiSelectChips options={options.painPoints} selected={answers.painPoints} onChange={(v) => update({ painPoints: v })} />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{content.detailLabel}</label>
        <textarea
          value={answers.painDetails}
          onChange={(e) => update({ painDetails: e.target.value })}
          placeholder={content.detailPlaceholder}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/30 transition-all backdrop-blur-sm resize-none"
        />
      </div>
    </div>
  )
}

export function StepGoals({ answers, update, content, options }: StepGoalsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">{content.title}</h2>
        <p className="text-slate-400">{content.subtitle}</p>
      </div>
      <MultiSelectChips options={options.goals} selected={answers.goals} onChange={(v) => update({ goals: v })} />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">{content.budgetLabel}</label>
        <SingleSelect options={options.budgetRanges} value={answers.budgetRange} onChange={(v) => update({ budgetRange: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">{content.timelineLabel}</label>
        <SingleSelect options={options.timelines} value={answers.timeline} onChange={(v) => update({ timeline: v })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">{content.decisionLabel}</label>
        <SingleSelect options={options.decisionStages} value={answers.decisionStage} onChange={(v) => update({ decisionStage: v })} />
      </div>
    </div>
  )
}

export function StepContact({ answers, update, content }: StepContactProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">{content.title}</h2>
        <p className="text-slate-400">{content.subtitle}</p>
      </div>
      <InputField label={content.nameLabel} value={answers.contactName} onChange={(v) => update({ contactName: v })} placeholder={content.namePlaceholder} required />
      <InputField label={content.emailLabel} value={answers.contactEmail} onChange={(v) => update({ contactEmail: v })} placeholder={content.emailPlaceholder} type="email" required />
      <InputField label={content.websiteLabel} value={answers.contactWebsite} onChange={(v) => update({ contactWebsite: v })} placeholder={content.websitePlaceholder} />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{content.notesLabel}</label>
        <textarea
          value={answers.additionalNotes}
          onChange={(e) => update({ additionalNotes: e.target.value })}
          placeholder={content.notesPlaceholder}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-cyan/50 focus:ring-1 focus:ring-primary-cyan/30 transition-all backdrop-blur-sm resize-none"
        />
      </div>
    </div>
  )
}
