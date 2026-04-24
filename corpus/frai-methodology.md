# FRAI Methodology

FRAI (Framework of Responsible AI) is an open-source toolkit that helps teams launch AI features responsibly. It guides evidence gathering, scans code, and assembles documentation reviewers can use: implementation checklists, model cards, risk files, evaluation reports, and compliance-aware RAG indexes.

## Workflow
1. **Discover** — interview developers about the feature (purpose, users, data, model, deployment context).
2. **Scan** — analyse the codebase for AI touch-points (calls to LLM APIs, training data sources, evaluation harnesses).
3. **Generate artefacts** — produce a checklist, model card, and risk file grounded in EU AI Act + NIST AI RMF requirements.
4. **Evaluate** — optionally run the FRAI Benchmark against the chosen model(s) to obtain safety/bias/PII/jailbreak/compliance scores.
5. **Index** — build a RAG index of the generated artefacts so downstream reviewers can Q&A them.

## Model Card Template (FRAI CLI output format)
- ## Model Details — name, version, date, authors, license, contact.
- ## Intended Use — primary intended uses, users, out-of-scope uses.
- ## Factors — relevant demographic/phenotypic/environmental groups; instrumentation; evaluation factors.
- ## Metrics — performance measures, decision thresholds, variation approaches.
- ## Evaluation Data — datasets, motivation, preprocessing.
- ## Training Data — datasets, preprocessing, known limitations.
- ## Quantitative Analyses — unitary results, intersectional results.
- ## Ethical Considerations — data, human life, mitigations, risks and harms, use cases.
- ## Caveats and Recommendations — anything the reader must know; recommended next steps.

## Risk File Template (FRAI CLI output format)
- ## System description — what the system does, in one paragraph.
- ## Intended purpose and deployment context — where, for whom, by whom.
- ## Foreseeable misuse — realistic adversarial and accidental misuse scenarios.
- ## Risk tier (EU AI Act) — Prohibited / High-risk / Limited / Minimal, with Article/Annex citation.
- ## Identified risks — enumerated, each with severity × likelihood, impacted stakeholders.
- ## Mitigations and controls — one per identified risk, mapped to EU AI Act Articles and NIST AI RMF functions where applicable.
- ## Residual risk and monitoring — what remains after mitigations; monitoring signals; escalation criteria.
- ## Governance — decision-makers, sign-off, review cadence.
- ## References — standards, internal documents, external law/guidance.

## Principles
- **Evidence over assertion** — every claim in an artefact should be traceable to user input, code, or a cited source.
- **Mark unknowns explicitly** — use `TBD — <reason>` rather than fabricating numbers.
- **Artefacts are hand-off documents** — once emitted, they should be usable without the original chat context.
- **Compliance is continuous** — risk files are living documents; revisit quarterly or whenever the system materially changes.
