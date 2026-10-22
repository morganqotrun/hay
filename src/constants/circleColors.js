export const CIRCLE_COLORS = [
  { id: 'tomat', name: 'Tomat', hex: '#E8452C', text: '#FFFFFF' },
  { id: 'kunyit', name: 'Kunyit', hex: '#F2B134', text: '#221A14' },
  { id: 'pandan', name: 'Pandan', hex: '#4FA05A', text: '#FFFFFF' },
  { id: 'laut', name: 'Laut', hex: '#1E9C93', text: '#FFFFFF' },
  { id: 'tinta', name: 'Tinta', hex: '#4A63D6', text: '#FFFFFF' },
  { id: 'dadu', name: 'Dadu', hex: '#F08CAE', text: '#221A14' },
]

export function getCircleColorByHexOrName(val) {
  if (!val) return CIRCLE_COLORS[0]
  const normalized = val.toLowerCase()
  return (
    CIRCLE_COLORS.find(
      (c) => c.name.toLowerCase() === normalized || c.hex.toLowerCase() === normalized || c.id === normalized
    ) || CIRCLE_COLORS[0]
  )
}
