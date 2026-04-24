import { MODEL_CARD_PROMPT } from "./model-card";
import { QA_PROMPT } from "./qa";
import { RISK_FILE_PROMPT } from "./risk-file";
import { TIER_CLASSIFIER_PROMPT } from "./tier-classifier";

export type ModeId = "qa" | "tier-classifier" | "model-card" | "risk-file";

export type ModeDefinition = {
  id: ModeId;
  label: string;
  tagline: string;
  systemPrompt: string;
  suggestedPrompt: string;
  /** If true, the response should be rendered as a downloadable artefact. */
  producesArtefact: boolean;
  artefactFilename?: string;
};

export const MODES: Record<ModeId, ModeDefinition> = {
  qa: {
    id: "qa",
    label: "Q&A",
    tagline: "Grounded questions across EU AI Act, NIST AI RMF, ISO 42001, and FRAI docs.",
    systemPrompt: QA_PROMPT,
    suggestedPrompt:
      "What transparency obligations does the EU AI Act impose on a general-purpose AI system deployed as a chatbot?",
    producesArtefact: false,
  },
  "tier-classifier": {
    id: "tier-classifier",
    label: "EU AI Act tier",
    tagline:
      "Describe an AI use-case in plain English; I'll classify it against Annex III and cite the governing article.",
    systemPrompt: TIER_CLASSIFIER_PROMPT,
    suggestedPrompt:
      "We're deploying an AI system that screens job applications and ranks candidates for a hiring manager. What EU AI Act risk tier does this fall into?",
    producesArtefact: false,
  },
  "model-card": {
    id: "model-card",
    label: "Draft model card",
    tagline:
      "Interview me about your system and produce a model card in the same format as the FRAI CLI.",
    systemPrompt: MODEL_CARD_PROMPT,
    suggestedPrompt:
      "Let's draft a model card. My system is a RAG chatbot grounded in regulatory documents; the base model is Claude Sonnet 4.6.",
    producesArtefact: true,
    artefactFilename: "model_card.md",
  },
  "risk-file": {
    id: "risk-file",
    label: "Draft risk file",
    tagline:
      "Walk through the FRAI risk-file template and produce one ready to hand to reviewers.",
    systemPrompt: RISK_FILE_PROMPT,
    suggestedPrompt:
      "Help me draft the risk file for our hiring-triage AI. Start by asking me the first FRAI question.",
    producesArtefact: true,
    artefactFilename: "risk_file.md",
  },
};

export const MODE_ORDER: ModeId[] = [
  "qa",
  "tier-classifier",
  "model-card",
  "risk-file",
];
