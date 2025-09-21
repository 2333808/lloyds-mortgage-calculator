
# Mortgage Calculator (Java Spring Boot)

## Run locally
- Requires: Java 17+, Maven
```bash
cd "C:\Users\rodyp\OneDrive\Escritorio\lloyds-mortgage-calculator\backend"
mvn spring-boot:run
http://localhost:8080
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
  - If the backend is not running, the app falls back to a local calculation (notice banner).

  - After any change in the frontend (including index.html):
  ```bash
  cd frontend
  npm run build:ship
  ```

## Test
```bash
cd C:\Users\rodyp\OneDrive\Escritorio\lloyds-mortgage-calculator\backend
mvn test
```
<img width="2870" height="1598" alt="Screenshot 2025-09-21 142645" src="https://github.com/user-attachments/assets/facc0c3f-f05c-41e0-aefd-254c30b62e8b" />
