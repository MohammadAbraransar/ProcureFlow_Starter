# ProcureFlow AI Architecture — implementation baseline

**Status:** design contract for implementation; no live AI provider is connected in this increment.

## 1. AI product responsibilities

### V1 — document intelligence
- Accept supplier quotations and supplier invoices as PDF, PNG, JPEG and controlled spreadsheet formats.
- OCR and extract supplier identity, document number/date, currency, line descriptions, SKU/part number, quantity, unit, unit price, discounts, freight, tax components, totals, payment terms, delivery terms and validity dates.
- Return structured candidate fields with page/region provenance, extraction method, confidence and validation state.
- Normalise units, currencies and supplier/item aliases only as suggestions. Preserve the original source values.
- Explain potential differences between an invoice and its approved purchase terms, citing the exact source fields and deterministic comparison result.

### Later releases
- Natural-language procurement assistant grounded only in records the current user is authorised to access.
- Supplier price-history summaries and anomaly signals after enough clean, consented transaction history exists.
- Forecasting only after a measured data sufficiency and back-testing gate.

## 2. Processing pipeline

1. API authenticates the user and authorises the tenant/document action.
2. Upload is placed in a private quarantine bucket with a random object key; metadata is stored separately.
3. Validate extension, MIME, file signature, size, page count and archive expansion limits. Reject encrypted/unsupported files unless a controlled workflow exists.
4. Malware scan and isolated parsing/OCR; parsers have no network access and strict CPU/memory/time limits.
5. OCR produces page text and layout coordinates. Original file and OCR output remain immutable/versioned.
6. Provider adapter receives only the minimum required document content under an approved data-processing agreement and configured region/retention policy.
7. Model output is constrained to a versioned JSON schema. Reject malformed output; never execute model-generated code or URLs.
8. Validate totals, arithmetic, dates, currency, units and required fields using deterministic application code. Arithmetic is never delegated to an LLM.
9. Normalisation/matching proposes supplier and catalogue-item matches with explainable evidence.
10. Human review confirms or edits low-confidence/high-impact fields. Store before/after values, actor, timestamp and provenance.
11. Deterministic comparison engine evaluates quote/PO/invoice differences. AI may explain the result but cannot change the calculation.
12. Persist model/provider/version, prompt-template version, schema version, confidence, validation results, reviewer outcome and latency/cost metadata.

## 3. Provider abstraction

Define an internal `DocumentExtractionProvider` interface with methods for capability discovery and schema-versioned extraction. Provider-specific SDKs must stay behind adapters. Configuration selects provider/model by environment; no provider credential is sent to the browser. Support a deterministic mock provider for tests. Provider failover must not silently change extraction semantics; log the provider/model and re-run validation on every response.

Provider approval checklist: data-processing terms, no-training setting or explicit contractual basis, retention/deletion, data residency, subprocessors, breach notice, encryption, access controls, availability, model versioning, pricing and export/deletion support. Do not send customer documents to a provider before this review is complete.

## 4. Trust boundaries and threats

- Treat all document text, QR codes, embedded links, metadata and model output as untrusted input.
- Prompt injection in a quotation/invoice is data, not an instruction. The extraction model has no tools, browser, shell, email, database or payment capability.
- Never include cross-tenant records in a prompt or retrieval context. Authorise before fetching; tenant-filter every retrieval query; test adversarial tenant IDs.
- Minimise personal data; redact unrelated personal identifiers where feasible.
- Do not train shared models on customer documents without explicit, informed permission and contractual/legal review.
- Do not expose raw OCR or prompts in normal application logs. Use redacted structured telemetry.
- Protect against oversized files, decompression bombs, malformed PDFs, parser exploits, image polyglots, OCR resource exhaustion and repeated expensive requests.
- Model output cannot select suppliers, approve quotations, create purchase orders, approve invoices or initiate payments.

## 5. Human review and decision policy

Always require human confirmation for supplier identity when ambiguous, currency, tax treatment, quantity, unit, unit price, discounts, freight, payment terms, delivery commitments and any field that changes a financial comparison. Low confidence or failed arithmetic/consistency checks must block downstream approval. Record edits and approval decisions in an append-only audit trail. A confidence score is not a probability of correctness unless calibrated against a labelled evaluation set.

## 6. Deterministic financial comparison

The comparison service, not the model, computes line extensions, discounts, freight, taxes and totals using decimal arithmetic and explicit rounding rules. It compares like-for-like units and currency, flags missing/ambiguous tax basis, and records the exact source values used. It must not rank offers on a hidden weighted score. The user sees total landed cost and each component, with configurable policy thresholds and a human decision.

## 7. Evaluation and release gates

Maintain a permissioned, de-identified labelled benchmark covering Indian invoice/quotation layouts, scans, low-resolution photos, multi-page files, tables, regional number formats, GST fields, handwritten marks, multiple currencies, unit conversions and adversarial prompt-injection content.

Measure per-field exact match and normalised accuracy, line-item precision/recall, document-level completeness, arithmetic-validation pass rate, false mismatch rate, abstention rate, reviewer correction rate, latency and cost/document. Report performance by document type, language, scan quality and supplier template. Do not rely on one aggregate accuracy score.

Initial release gates (targets to validate, not claims):
- 100% of extracted fields include source provenance or are explicitly marked unavailable.
- 100% of totals used in comparisons pass deterministic arithmetic validation.
- 0 cross-tenant document retrievals in automated security tests.
- 0 autonomous approvals, supplier selections or payment actions.
- Critical financial fields with low confidence are blocked for human review.
- Golden-set regression suite runs on every prompt, model, OCR or parser change.
- Rollback to previous provider/model/template is tested.

## 8. Operational controls

Set per-tenant file size, page, request and spend limits; queue with bounded concurrency; use idempotency keys; retry only transient failures; dead-letter persistent failures; support manual retry and deletion. Track provider latency, error rate, cost, extraction confidence distribution, review rate and queue age. Alerts must not include document contents or secrets.

## 9. Explicit non-goals

No autonomous purchasing agent, payment initiation, supplier communication, approval delegation, model-based financial arithmetic, or opaque supplier scoring in V1.
