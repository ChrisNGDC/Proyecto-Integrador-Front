export interface JobOpportunity {
    id: number
    company: string
    title: string
    modality: string
    publicationDate: Date
    category: string
    type: "vacante" | "servicio"
    description?: string
    requirements?: string[]
    location?: string
    salary?: string
    contactEmail?: string
    active?: boolean
  }
  