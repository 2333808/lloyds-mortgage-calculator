
package com.lloyds.mortgagecalculator;

import org.springframework.stereotype.Service;

@Service
public class CalculatorService {
    public double monthlyRepayment(double principal, double annualRatePct, int years) {
        double r = annualRatePct / 100.0 / 12.0;
        int n = Math.max(0, years) * 12;
        if (principal <= 0 || n <= 0) return 0.0;
        if (r == 0.0) return principal / n;
        return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    public double interestOnlyMonthly(double principal, double annualRatePct) {
        double r = annualRatePct / 100.0 / 12.0;
        if (principal <= 0) return 0.0;
        return principal * r;
    }
}
