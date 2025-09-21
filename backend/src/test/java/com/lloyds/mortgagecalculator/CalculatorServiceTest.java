
package com.lloyds.mortgagecalculator;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CalculatorServiceTest {
    @Test
    void zeroRateEqualsPrincipalOverMonths() {
        CalculatorService s = new CalculatorService();
        double m = s.monthlyRepayment(120000, 0, 20);
        assertEquals(120000.0 / (20 * 12), m, 0.01);
    }

    @Test
    void interestOnlyMatchesFormula() {
        CalculatorService s = new CalculatorService();
        double m = s.interestOnlyMonthly(150000, 6.0);
        assertEquals(150000 * 0.06 / 12.0, m, 0.01);
    }
}
