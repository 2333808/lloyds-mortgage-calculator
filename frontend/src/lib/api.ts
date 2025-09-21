// src/lib/api.ts
export type CalcRequest = {
  price: number;
  deposit: number;
  termYears: number;
  annualRatePct: number;
  mortgageType: "repayment" | "interestOnly";
};

export type CalcResponse = {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
};

// Same-origin: frontend and backend are served from the same host+port
export async function calculateViaApi(req: CalcRequest): Promise<CalcResponse> {
  const res = await fetch(`/api/calc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return await res.json();
}
