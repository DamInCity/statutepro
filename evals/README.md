# StatutePro — AI Eval Framework (promptfoo)

> Automated quality assurance, safety testing, and adversarial red-teaming for every AI feature in StatutePro.

---

## Why This Exists

StatutePro is not a simple chatbot. It handles **privileged client data**, **trust account compliance**, **billing records**, and **strategic legal advice** for real law firms. Every AI output that reaches a lawyer or client carries professional-ethics risk. This eval suite ensures:

- **Legal accuracy** — no hallucinated statutes, case citations, or deadlines
- **Compliance** — AI never establishes attorney-client relationship or gives specific legal advice (unauthorized practice of law risk)
- **Privacy** — no PII leakage across clients, matters, or organisations (multi-tenant isolation)
- **Trust** — billing descriptions, matter analysis, and document summaries are professionally accurate
- **Robustness** — the system resists prompt injection attacks embedded in client documents

---

## Architecture

```
evals/
├── promptfooconfig.yaml        # Smoke test — representative subset of all features
├── redteam.yaml                # Adversarial / red-team probes (run nightly)
├── .env.example                # Environment variables required
├── features/                   # One config file per AI feature
│   ├── 01_chat.yaml            # General AI chat assistant
│   ├── 02_summarization.yaml   # Legal document summarisation
│   ├── 03_email_drafting.yaml  # Professional email drafting
│   ├── 04_matter_analysis.yaml # Matter & case strategic analysis
│   ├── 05_billing.yaml         # Billable time entry descriptions
│   ├── 06_document_assembly.yaml  # Contract & document generation (roadmap)
│   ├── 07_trust_accounting.yaml   # IOLTA / trust account AI assistance
│   ├── 08_client_portal.yaml      # Client-facing chatbot
│   └── 09_multilingual.yaml       # Multi-language support (EA, SEA markets)
├── datasets/                   # CSV datasets for parameterised testing
│   ├── legal_qa.csv
│   ├── billing_inputs.csv
│   └── contract_clauses.csv
└── .github/workflows/
    ├── eval.yml                # PR quality gate
    └── redteam.yml             # Nightly adversarial scan
```

---

## Quick Start

### Prerequisites

```bash
# Install promptfoo (no global install needed)
npx promptfoo@latest --version

# Copy environment template
cp evals/.env.example evals/.env

# Edit evals/.env and add your API keys
```

### Run the Smoke Test

```bash
cd /path/to/statutepro
npx promptfoo eval -c evals/promptfooconfig.yaml
npx promptfoo view    # Open web UI with results
```

### Run All Feature Tests

```bash
npx promptfoo eval -c evals/features/*.yaml
```

### Run a Single Feature

```bash
npx promptfoo eval -c evals/features/02_summarization.yaml
```

### Compare Models (Current vs. Upgrade Candidate)

```bash
# Add both providers to the config and run
npx promptfoo eval -c evals/features/04_matter_analysis.yaml
# Results show side-by-side comparison of gpt-oss-20b vs Qwen3-235B
```

### Run Red Team Scan

```bash
npx promptfoo redteam run -c evals/redteam.yaml
npx promptfoo redteam report    # Opens vulnerability risk report
```

### Export Results

```bash
# JSON (for CI/CD gates)
npx promptfoo eval -c evals/promptfooconfig.yaml -o evals/results/latest.json

# HTML (for sharing with team)
npx promptfoo eval -c evals/promptfooconfig.yaml -o evals/results/report.html

# JUnit XML (for GitLab/Jenkins)
npx promptfoo eval -c evals/promptfooconfig.yaml -o evals/results/junit.xml
```

---

## Quality Metrics

Every test is tagged with named metrics that appear in the UI:

| Metric | Description |
|---|---|
| `Accuracy` | Factual correctness — dates, parties, numbers match the source |
| `Completeness` | All required sections/elements are present |
| `Format` | Output format matches requirements (e.g., no subject line in email body) |
| `Quality` | Professional tone, clarity, and legal appropriateness |
| `Safety` | Does not give specific legal advice, does not claim to be an attorney |
| `Privacy` | Does not expose PII or cross-client data |
| `Security` | Resists prompt injection, jailbreaks, adversarial inputs |
| `Compliance` | Follows IOLTA rules, professional ethics standards |

### Pass Rate Thresholds

| Suite | Minimum Pass Rate | Rationale |
|---|---|---|
| Safety | **100%** | Zero-tolerance for UPL or PII leakage |
| Security | **100%** | Zero-tolerance for prompt injection |
| Accuracy | **90%** | High bar for legal data accuracy |
| Completeness | **85%** | All key elements present |
| Format | **95%** | Output format critical for downstream use |
| Quality | **80%** | LLM-graded, some subjectivity |

---

## Provider Configuration

### Current Production Model
- **Provider:** SiliconFlow API (OpenAI-compatible)
- **Model:** `openai/gpt-oss-20b`
- **Env var:** `SILICONFLOW_API_KEY`

### Upgrade Candidate (Roadmap)
- **Model:** `Qwen/Qwen3-235B-A22B`
- **Cost:** ~$0.30–0.80/query via SiliconFlow vs. self-hosted ($2k–5k/mo infra)

### Live API Testing
For testing the actual FastAPI endpoints:
- **Base URL:** `http://localhost:8000/api/v1` (local) or staging URL
- **Env var:** `STATUTEPRO_API_URL`, `STATUTEPRO_API_TOKEN`

---

## Test Case Design Principles

1. **Use realistic legal documents** — fictional but jurisdiction-accurate (Kenya, US, UK)
2. **Always test the anti-patterns** — what the AI should NOT say is as important as what it should say
3. **Named metrics per assertion** — all assertions map to a metric for dashboard tracking
4. **Mix deterministic + LLM-graded** — use `contains`/`regex` for known facts, `llm-rubric` for quality
5. **Weight safety assertions** — `weight: 3` for safety/privacy, `weight: 1` for format niceties
6. **Test edge cases by jurisdiction** — statute-of-limitations vary by country/state; multi-tenancy varies by subscription plan

---

## CI/CD Integration

- **Every PR** that changes `prompts/`, `app/api/v1/ai.py`, or `services/` triggers the eval smoke test
- **Nightly** red-team scan runs adversarial probes against the staging environment
- **Failures block merge** if Safety or Security metrics drop below 100%
- Results are uploaded as PR artifacts for review

---

## Adding New Tests

1. Find the relevant feature file in `evals/features/`
2. Add a new entry to the `tests:` array with descriptive `description:` field
3. Include at least one `llm-rubric` assertion and one deterministic assertion
4. Tag with the correct `metric:` label
5. Run locally to verify the test passes before committing
