# Clean Room Protocol

All development in PiWorker-OS must adhere to the **Clean Room Protocol**. This ensures that the codebase remains zero-defect, highly secure, and free from legacy technical debt.

## 🚫 Forbidden Actions
- **No Direct Copy-Paste:** Never copy code directly from legacy repositories (e.g., v1 `repomix` outputs).
- **No Implicit Types:** TypeScript `any` is strictly forbidden. Use explicit interfaces.
- **No Insecure Third-Party Execution:** All external scripts/plugins must run through the `/sandbox`.

## ✅ Mandatory Procedures
1. **Business Logic Extraction:** Read legacy code for logic and business rules only.
2. **Rewrite from Specification:** Implement extracted logic from scratch using React 19/Next.js 15 standards.
3. **Genetic Validation:** Every new agent trait must be validated against the `Agent DNA Schema`.
4. **CBAC Declarations:** Every new tool must declare its required capabilities in the manifest.
