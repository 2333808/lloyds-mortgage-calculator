
export function monthlyRepayment(principal: number, annualRatePct: number, years: number): number {
  const r = annualRatePct / 100 / 12
  const n = Math.round(years * 12)
  if (principal <= 0 || n <= 0) return 0
  if (r === 0) return principal / n
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export function interestOnlyMonthly(principal: number, annualRatePct: number): number {
  const r = annualRatePct / 100 / 12
  if (principal <= 0) return 0
  return principal * r
}
