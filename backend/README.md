
# Backend – Mortgage Calculator (Java Spring Boot)

## Run locally
- Requires: Java 17+, Maven
```bash
mvn spring-boot:run
```
Endpoints:
- GET http://localhost:8080/api/health
- POST http://localhost:8080/api/calc
  ```json
  {
    "price": 350000,
    "deposit": 35000,
    "termYears": 25,
    "annualRatePct": 4.5,
    "mortgageType": "repayment"
  }
  ```

## Test
```bash
mvn test
```
