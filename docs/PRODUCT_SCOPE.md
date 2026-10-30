# Product scope — v1

## Core journey
1. Create a purchase request.
2. Add supplier quotations by upload or manual entry.
3. Extract candidate fields with OCR/AI and show provenance/confidence.
4. Human reviews and corrects extracted data.
5. Deterministic engine normalises units and calculates comparable costs.
6. Approver selects supplier and records rationale.
7. Generate versioned purchase order.
8. Upload supplier invoice.
9. Match invoice against PO and approved quote snapshot.
10. Route discrepancies to human review.

## AI responsibilities
- Document field extraction and classification.
- Assist with item/specification matching and normalisation suggestions.
- Explain differences using authorised, retrieved records.
- Summarise historical price movement once enough data exists.

## Non-AI responsibilities
- Money arithmetic, tax arithmetic, tolerance evaluation, approvals, payment decisions and access control remain deterministic application logic.

## Non-goals
Marketplace, payment initiation, accounting ledger, tax filing, ERP replacement and autonomous purchasing.
