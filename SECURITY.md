# Security Policy

## Supported Versions

Investment Dashboard is currently in active development. Only the latest release on the default branch receives security updates.

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public issues, pull requests, or discussions.**

Instead, report them privately using [GitHub Security Advisories](https://github.com/Finfinder/Investment-Dashboard/security/advisories/new).

### What to Include

To help us triage and resolve the issue quickly, please include:

- **Description** of the vulnerability and its potential impact
- **Affected component** (authentication, TOTP 2FA, data storage / backup encryption, market data provider, UI)
- **Steps to reproduce** or a proof-of-concept (if possible)
- **Affected version(s)** of Investment Dashboard
- **Any suggested mitigation** or fix (optional)

### Response Timeline

| Stage | Target |
|-------|--------|
| Initial acknowledgment | Within 48 hours |
| Triage and severity assessment | Within 1 week |
| Fix development and testing | Varies by severity |
| Patch release | As soon as a fix is verified |

We will keep you informed of progress throughout the process.

## Scope

### In Scope

- Investment Dashboard client application and source code
- Client-side cryptographic handling (TOTP secrets, local authentication)
- LocalStorage and JSON backup/restore handling
- Stooq / market data proxy and parsers
- CI/CD workflows and repository automation

### Out of Scope

Please report vulnerabilities in third-party libraries directly to their upstream maintainers:

| Dependency | Report To |
|------------|-----------|
| React / React DOM | https://github.com/facebook/react/issues |
| Vite | https://github.com/vitejs/vite/security |
| Chart.js / react-chartjs-2 | https://github.com/chartjs/Chart.js/security |
| Papaparse | https://github.com/mholt/PapaParse/issues |
| SheetJS (xlsx) | https://github.com/SheetJS/sheetjs/issues |

If a vulnerability in a third-party dependency affects Investment Dashboard specifically (e.g. through insecure configuration or usage), that **is** in scope.

## Disclosure Policy

- We follow **coordinated disclosure**: we will work with you to understand and address the issue before any public disclosure.
- Credit will be given to the reporter in the release notes (unless you prefer to remain anonymous).
- We aim to release a fix before or simultaneously with public disclosure.

## Safe Harbor

We consider security research conducted in good faith to be authorized and will not pursue legal action against researchers who:

- Act in good faith to avoid privacy violations, destruction of data, and disruption of services
- Only interact with accounts they own or with explicit permission of the account holder
- Report vulnerabilities through the process described above
- Do not exploit a vulnerability beyond what is necessary to demonstrate the issue
