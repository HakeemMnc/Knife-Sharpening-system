export type CustomerType = 'B2B' | 'B2C'
export type ServiceStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface Customer {
  type: CustomerType
  currentStage: ServiceStage
}

export interface ServiceInfo {
  stage: ServiceStage
  title: string
  description: string
}
