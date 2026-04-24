# EU AI Act — Key Provisions Summary

> This file is a community-maintained **working summary** of the Regulation (EU)
> 2024/1689. Replace / expand with the official consolidated text for higher
> fidelity. For binding text see: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689

## Article 3 — Definitions
- "AI system" means a machine-based system that, for explicit or implicit objectives, infers, from the input it receives, how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments.
- "Provider" and "deployer" denote the actor who develops an AI system and the actor who uses it under its authority.
- "General-purpose AI model" (GPAI) means an AI model, including where trained with large amounts of data using self-supervision at scale, that displays significant generality and is capable of competently performing a wide range of distinct tasks.

## Article 5 — Prohibited AI practices
The following practices are prohibited:
- Subliminal, manipulative or deceptive techniques that materially distort behaviour.
- Exploitation of vulnerabilities of specific groups (age, disability, socio-economic).
- Social scoring by public authorities that leads to detrimental treatment disproportionate to behaviour.
- Real-time remote biometric identification in publicly accessible spaces for law-enforcement (with narrow exceptions).
- Emotion recognition in the workplace and educational institutions (with narrow medical/safety exceptions).
- Biometric categorisation that infers sensitive attributes (race, political opinions, union membership, etc.).
- Predictive policing based solely on profiling / personality traits.
- Untargeted scraping of facial images from the internet or CCTV to build facial-recognition databases.

## Article 6 + Annex III — High-risk AI systems
An AI system is classified as high-risk if it falls under Annex III categories, including:
1. Biometric identification and categorisation of natural persons.
2. Management and operation of critical infrastructure.
3. Education and vocational training (admissions, evaluating students, monitoring exams).
4. Employment, workers management and access to self-employment (recruitment, CV screening, promotions, task allocation, monitoring and evaluation).
5. Access to and enjoyment of essential private and public services (credit scoring, emergency dispatch, eligibility determinations).
6. Law enforcement (evidence evaluation, profiling, crime-risk assessment).
7. Migration, asylum and border control management.
8. Administration of justice and democratic processes.

High-risk systems must comply with Articles 8–15 requirements: risk management, data governance, technical documentation, record-keeping, transparency to deployers, human oversight, and accuracy/robustness/cybersecurity.

## Article 9 — Risk-management system
A risk-management system shall be established, implemented, documented and maintained for high-risk AI systems as a continuous iterative process throughout the lifecycle, including identification/analysis of foreseeable risks, estimation/evaluation of risks, and adoption of risk-management measures.

## Article 10 — Data and data governance
Training, validation and testing data sets must be subject to appropriate data governance: relevance, representativeness, freedom from errors, statistical properties appropriate to intended purpose, and examination for possible biases.

## Article 13 — Transparency and information to deployers
High-risk AI systems must be designed and developed so that deployers can interpret the system's output and use it appropriately. Instructions for use must include, inter alia, the system's intended purpose, characteristics, limitations, and human-oversight measures.

## Article 14 — Human oversight
High-risk AI systems shall be designed and developed so that they can be effectively overseen by natural persons during the period in which the AI system is in use, including the ability to fully understand capacities and limitations, remain aware of automation bias, correctly interpret outputs, decide not to use the system, or intervene on its operation.

## Article 15 — Accuracy, robustness and cybersecurity
High-risk AI systems shall be designed with appropriate levels of accuracy, robustness and cybersecurity; declared accuracy levels and relevant accuracy metrics shall be indicated in the instructions for use.

## Article 50 (formerly 52) — Transparency obligations for certain AI systems
- Providers of AI systems intended to interact directly with natural persons must ensure the systems are designed so that natural persons are informed they are interacting with an AI (unless obvious from context).
- Deployers of emotion-recognition or biometric-categorisation systems must inform the natural persons exposed to them.
- Providers of AI systems generating synthetic audio, image, video or text must ensure outputs are marked in a machine-readable format and detectable as AI-generated.
- Deployers of "deep fakes" must disclose that the content is artificially generated.
- Deployers of systems generating text published to inform the public on matters of public interest must disclose AI generation, unless human review or editorial responsibility applies.

## Article 53+ — General-purpose AI models
GPAI providers must draw up and keep up-to-date technical documentation of the model; make information available to downstream providers; put in place a policy to comply with EU copyright law; draw up and publish a sufficiently detailed summary about the content used for training.

GPAI models with systemic risk (FLOPs ≥ 10^25 or designated by the Commission) have additional obligations: model evaluations, systemic risk assessment and mitigation, serious-incident reporting, adequate cybersecurity protection.

## Article 60–62 — Testing in real-world conditions
AI regulatory sandboxes are established in each Member State to foster innovation and provide a controlled environment for testing AI systems prior to placing on the market.

## Enforcement and penalties
- Non-compliance with the prohibitions in Article 5: up to €35 million or 7% of worldwide annual turnover, whichever is higher.
- Non-compliance with obligations for high-risk systems or GPAI: up to €15 million or 3%.
- Supply of incorrect information to authorities: up to €7.5 million or 1%.

## Phased application
- Prohibitions (Article 5): apply 6 months after entry into force.
- General-purpose AI model obligations: apply 12 months after entry into force.
- High-risk system obligations (Annex III): apply 24 months after entry into force.
- High-risk embedded in regulated products (Annex I): apply 36 months after entry into force.
