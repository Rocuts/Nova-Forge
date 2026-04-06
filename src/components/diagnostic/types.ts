export interface DiagnosticAnswers {
  companyName: string
  industry: string
  teamSize: string
  role: string
  currentStack: string[]
  cloudProvider: string
  aiMaturity: string
  painPoints: string[]
  painDetails: string
  goals: string[]
  budgetRange: string
  timeline: string
  decisionStage: string
  contactName: string
  contactEmail: string
  contactWebsite: string
  additionalNotes: string
}

export const INITIAL_ANSWERS: DiagnosticAnswers = {
  companyName: "",
  industry: "",
  teamSize: "",
  role: "",
  currentStack: [],
  cloudProvider: "",
  aiMaturity: "",
  painPoints: [],
  painDetails: "",
  goals: [],
  budgetRange: "",
  timeline: "",
  decisionStage: "",
  contactName: "",
  contactEmail: "",
  contactWebsite: "",
  additionalNotes: "",
}
