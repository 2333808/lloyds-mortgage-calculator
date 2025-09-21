
import React, { useEffect, useMemo, useState } from 'react'
import { monthlyRepayment, interestOnlyMonthly } from './lib/calc'
import { calculateViaApi } from './lib/api'

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, n))
}

const currency = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })
const percent = (n: number) => `${n.toFixed(2)}%`

type MortgageType = 'repayment' | 'interestOnly'

export default function App() {
  const [step, setStep] = useState(1)
  const [price, setPrice] = useState(350000)
  const [deposit, setDeposit] = useState(35000)
  const [term, setTerm] = useState(25)
  const [rate, setRate] = useState(4.5)
  const [type, setType] = useState<MortgageType>('repayment')
  const [fixYears, setFixYears] = useState(2)

  const [apiError, setApiError] = useState<string>('')
  const [useApi, setUseApi] = useState<boolean>(true) // try API first if configured

  useEffect(() => {
    const saved = localStorage.getItem('lloyds-mortgage-calculator')
    if (saved) {
      try {
        const d = JSON.parse(saved)
        setPrice(d.price ?? 350000)
        setDeposit(d.deposit ?? 35000)
        setTerm(d.term ?? 25)
        setRate(d.rate ?? 4.5)
        setType(d.type ?? 'repayment')
        setFixYears(d.fixYears ?? 2)
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('lloyds-mortgage-calculator', JSON.stringify({ price, deposit, term, rate, type, fixYears }))
  }, [price, deposit, term, rate, type, fixYears])

  const loanAmount = useMemo(() => clamp(price - deposit, 0, 10_000_000), [price, deposit])
  const ltv = useMemo(() => price > 0 ? (loanAmount / price) * 100 : 0, [loanAmount, price])

  const [remoteMonthly, setRemoteMonthly] = useState<number | null>(null)
  const [remoteInterest, setRemoteInterest] = useState<number | null>(null)
  const [remoteTotal, setRemoteTotal] = useState<number | null>(null)

  const localMonthly = useMemo(() => {
    return type === 'interestOnly'
      ? interestOnlyMonthly(loanAmount, rate)
      : monthlyRepayment(loanAmount, rate, term)
  }, [loanAmount, rate, term, type])

  const localTotalPaid = useMemo(() => localMonthly * 12 * term, [localMonthly, term])
  const localInterest = useMemo(() => localTotalPaid - loanAmount, [localTotalPaid, loanAmount])

  useEffect(() => {
    // Try backend API if configured (env). Fallback to local calc if error.
    async function run() {
      try {
        setApiError('')
        if (!useApi) { setRemoteMonthly(null); setRemoteInterest(null); setRemoteTotal(null); return; }
        const res = await calculateViaApi({
          price, deposit, termYears: term, annualRatePct: rate, mortgageType: type
        })
        setRemoteMonthly(res.monthlyPayment)
        setRemoteInterest(res.totalInterest)
        setRemoteTotal(res.totalPaid)
      } catch (e: any) {
        setApiError(e?.message || 'API error')
        setUseApi(false) // disable API if failing
      }
    }
    run()
  }, [price, deposit, term, rate, type, useApi])

  const monthly = remoteMonthly ?? localMonthly
  const totalPaid = remoteTotal ?? localTotalPaid
  const totalInterest = remoteInterest ?? localInterest

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100
  const canNext1 = loanAmount > 0 && term >= 5 && term <= 40

  return (
    <div className="container">
      <h1 style={{margin:'0 0 8px 0'}}>Lloyds Mortgage Calculator</h1>
      <div className="steps"><span style={{ width: progress + '%' }} /></div>
      {apiError && <div className="err">Backend not reachable / disabled. Using local calculation. ({apiError})</div>}
      <div className="grid">
        <div className="card">
          <div className="hdr"><h2>Step {step} of 3</h2></div>
          <div className="bd">
            {step === 1 && (
              <div>
                <Field label="Property price" tip="The purchase price of the property before fees.">
                  <RangeAndNumber min={50000} max={10_000_000} step={1000} value={price} onChange={setPrice} />
                </Field>
                <Field label="Deposit" tip="Your upfront payment. Loan amount = price − deposit.">
                  <RangeAndNumber min={0} max={price} step={1000} value={deposit} onChange={setDeposit} />
                  <div className="muted">Loan amount: <b>{currency(loanAmount)}</b> (LTV {ltv.toFixed(0)}%)</div>
                </Field>
                <Field label="Mortgage term" tip="How long you'll take to repay the mortgage.">
                  <RangeAndNumber min={5} max={40} step={1} value={term} onChange={(v)=> setTerm(clamp(v,5,40))} />
                  <div className="muted">{term} years</div>
                </Field>
                <div className="btnrow">
                  <span/>
                  <button onClick={()=> setStep(2)} disabled={!canNext1}>Next</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <Field label="Interest rate (APR)" tip="Estimated annual interest rate. Adjust to compare scenarios.">
                  <RangeAndNumber min={0} max={15} step={0.1} value={rate} onChange={(v)=> setRate(Number(v.toFixed(1)))} />
                  <div className="muted">{percent(rate)}</div>
                </Field>

                <Field label="Mortgage type" tip="Repayment reduces your balance each month. Interest-only pays interest only; principal due later.">
                  <div className="row">
                    <label><input type="radio" name="type" checked={type==='repayment'} onChange={()=> setType('repayment')} /> Repayment</label>
                    <label><input type="radio" name="type" checked={type==='interestOnly'} onChange={()=> setType('interestOnly')} /> Interest-only</label>
                  </div>
                </Field>

                <Field label="Initial fixed period" tip="How long your initial fixed rate lasts before reverting.">
                  <select value={String(fixYears)} onChange={(e)=> setFixYears(Number(e.target.value))}>
                    <option value="2">2 years</option>
                    <option value="3">3 years</option>
                    <option value="5">5 years</option>
                    <option value="10">10 years</option>
                  </select>
                </Field>

                <div className="btnrow">
                  <button onClick={()=> setStep(1)} style={{background:'#fff', color:'#0ea5e9'}}>Back</button>
                  <button onClick={()=> setStep(3)}>See results</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <SummaryRow label="Monthly payment" value={currency(monthly)} />
                <SummaryRow label="Loan amount" value={currency(loanAmount)} />
                <SummaryRow label="Total interest over term" value={currency(totalInterest)} />
                <SummaryRow label="Total paid over term" value={currency(totalPaid)} />

                <p className="tooltip">This is a projection based on your inputs. Actual offers depend on affordability checks and lender criteria.</p>
                <div className="btnrow">
                  <button onClick={()=> setStep(2)} style={{background:'#fff', color:'#0ea5e9'}}>Back</button>
                  <button onClick={()=> { setStep(1); }}>Start over</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="hdr"><h2>Helpful guidance</h2></div>
          <div className="bd">
            <h3 style={{marginTop:0}}>Plain language</h3>
            <p className="muted">We’ve swapped jargon for clear explanations and added simple inline tips.</p>
            <h3>Mobile-first</h3>
            <p className="muted">Touch-friendly controls and responsive layout.</p>
            <h3>Autosave</h3>
            <p className="muted">Your inputs are stored locally so you won’t lose progress if you refresh.</p>
            <h3>Accessibility</h3>
            <p className="muted">Proper labels, input types, and consistent patterns for an inclusive experience.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field(props: { label: string, tip?: string, children: React.ReactNode }) {
  return (
    <div style={{marginBottom:12}}>
      <label><b>{props.label}</b></label>
      {props.tip && <div className="tooltip" role="note">{props.tip}</div>}
      <div style={{marginTop:6}}>{props.children}</div>
    </div>
  )
}

function RangeAndNumber(props: {min:number, max:number, step:number, value:number, onChange:(n:number)=>void}) {
  const { min, max, step, value, onChange } = props
  return (
    <div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e)=> onChange(Number((e.target as HTMLInputElement).value))} />
      <div className="row">
        <input type="number" value={value}
          onChange={(e)=> onChange(Number((e.target as HTMLInputElement).value))} />
        <span className="muted">min {min.toLocaleString()} • max {max.toLocaleString()}</span>
      </div>
    </div>
  )
}

function SummaryRow(props: { label: string, value: string }) {
  return (
    <div className="summary">
      <div className="muted">{props.label}</div>
      <div><b>{props.value}</b></div>
    </div>
  )
}
