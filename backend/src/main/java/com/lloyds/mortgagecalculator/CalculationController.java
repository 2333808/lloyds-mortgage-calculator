package com.lloyds.mortgagecalculator;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CalculationController {
    private final CalculatorService service;

    public CalculationController(CalculatorService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    @PostMapping("/calc")
    public CalcResponse calc(@RequestBody CalcRequest req) {
        CalcResponse res = new CalcResponse();

        double loanAmount = Math.max(0.0, req.price - req.deposit);
        res.loanAmount = loanAmount;

        double monthly = "interestOnly".equalsIgnoreCase(req.mortgageType)
                ? service.interestOnlyMonthly(loanAmount, req.annualRatePct)
                : service.monthlyRepayment(loanAmount, req.annualRatePct, req.termYears);

        res.monthlyPayment = monthly;

        double totalPaid = monthly * 12.0 * Math.max(0, req.termYears);
        res.totalPaid = totalPaid;
        res.totalInterest = totalPaid - loanAmount;

        return res;
    }
}
