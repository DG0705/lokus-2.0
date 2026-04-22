// Remote states that require premium delivery
const REMOTE_STATES = [
  'Arunachal Pradesh',
  'Assam', 
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura',
  'Ladakh',
  'Andaman and Nicobar Islands',
  'Lakshadweep'
];

export interface ShippingCalculation {
  fee: number;
  type: 'free' | 'standard' | 'premium';
  description: string;
}

export function calculateShipping(state: string, orderValue: number): ShippingCalculation {
  // Free shipping for orders above 5000
  if (orderValue > 5000) {
    return {
      fee: 0,
      type: 'free',
      description: 'Free Shipping (Orders above â¹5,000)'
    };
  }

  // Check if state requires premium delivery
  const normalizedState = state.toLowerCase().trim();
  const isRemoteState = REMOTE_STATES.some(remoteState => 
    remoteState.toLowerCase() === normalizedState
  );

  if (isRemoteState) {
    return {
      fee: 300,
      type: 'premium',
      description: 'Premium Delivery (Remote Location)'
    };
  }

  // Standard shipping
  return {
    fee: 150,
    type: 'standard',
    description: 'Standard Delivery'
  };
}

// Helper function to normalize state names
export function normalizeStateName(state: string): string {
  return state.toLowerCase().trim();
}

// Helper function to check if a state is remote
export function isRemoteState(state: string): boolean {
  const normalizedState = normalizeStateName(state);
  return REMOTE_STATES.some(remoteState => 
    remoteState.toLowerCase() === normalizedState
  );
}
