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

export interface BookingState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    streetAddress: string;
    suburb: string;
    state: string;
    postalCode: string;
  };
  specialInstructions: string;
  quantities: {
    items: number;
    scissors: number;
    garden: number;
    other: number;
  };
  selectedServiceDate: Date | null;
  serviceLevel: 'standard' | 'premium';
  total: number;
}
