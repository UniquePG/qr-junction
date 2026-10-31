/** Fields the public menu is allowed to receive. Address and licences stay on the owner profile. */
export const guestRestaurantSelect = {
  id: true,
  name: true,
  description: true,
  logoUrl: true,
  coverImage: true,
  currency: true,
  taxRate: true,
  taxName: true,
  orderingEnabled: true,
  phone: true,
  whatsapp: true,
  email: true,
  website: true,
  instagram: true,
  openingHours: true,
  showOpeningHours: true,
} as const;
