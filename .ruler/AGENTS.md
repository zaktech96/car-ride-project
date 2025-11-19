# Repository Guidelines

## Project Structure & Module Organization
The `app/` directory is the React Router v7 application: route modules live in `app/routes/`, shared UI in `app/components/`, hooks in `app/hooks/`, utilities in `app/utils/`, and client helpers in `app/lib/`. The `convex/` folder contains serverless functions, schema definitions, and Convex configuration. Static assets reside in `public/`, deployment outputs in `build/`, and operational runbooks in `guides/`. Configuration defaults sit in `config.example.ts`; copy to `config.ts` for local overrides.

## Build, Test, and Development Commands
Run `bun run dev` for the full-stack dev server with hot reload. `bun run build` creates the production bundle under `build/`. Use `bun run start` to serve the built output locally. Verify types and regenerate React Router loaders with `bun run typecheck`, which runs `react-router typegen` before `tsc` via bunx.

## Coding Style & Naming Conventions
Write TypeScript everywhere, using ES modules and strict typing. Prefer PascalCase for React components, camelCase for functions and variables, and kebab-case for route filenames (e.g., `pricing.tsx`). Co-locate loader/action logic with their route module. Favor Tailwind utility classes over custom CSS; place shared design tokens in `app/app.css` only when unavoidable. Keep Convex queries and mutations in files that match their domain (`subscriptions.ts`, `users.ts`).

## Testing Guidelines
The project currently relies on type safety and manual QA. When adding complex logic, scaffold Vitest + React Testing Library tests beside the code (e.g., `Component.test.tsx`) and gate networked code behind mocks. At minimum, run `npm run typecheck` before every PR and include screenshots or recordings for UI changes.

## Commit & Pull Request Guidelines
Follow the existing history pattern of short, imperative commit subjects ("Update integrations links text"). Group related changes together and avoid unrelated refactors. Pull requests should include a concise summary, linked issue or Linear ticket, and a checklist of executed commands. Mention any new environment variables, schema migrations, or Convex changes, and attach proof of testing (command output, screenshots).

## React Router & Convex Tips
Always import route types from `./+types/[route]` when accessing loader data, and rerun `npm run typecheck` if those files go stale. Convex deployments expect the schema in `convex/schema.ts`; keep mutations idempotent and document new functions in `convex/README.md`.

---

## Communication Rules (for AI coding agents)

DO NOT GIVE ME HIGH LEVEL STUFF, IF I ASK FOR FIX OR EXPLANATION, I WANT ACTUAL CODE OR EXPLANATION!!! I DON'T WANT "Here's how you can blablabla"

### General Guidelines

• Be casual unless otherwise specified
• Be terse
• Suggest solutions that I didn't think about--anticipate my needs
• Treat me as an expert
• Be accurate and thorough
• Give the answer immediately. Provide detailed explanations and restate my query in your own words if necessary after giving the answer
• Value good arguments over authorities, the source is irrelevant
• Consider new technologies and contrarian ideas, not just the conventional wisdom
• You may use high levels of speculation or prediction, just flag it for me
• No moral lectures
• Discuss safety only when it's crucial and non-obvious
• If your content policy is an issue, provide the closest acceptable response and explain the content policy issue afterward
• Cite sources whenever possible at the end, not inline
• No need to mention your knowledge cutoff
• No need to disclose you're an AI
• Please respect my prettier preferences when you provide code
• Split into multiple responses if one response isn't enough to answer the question

### Code Adjustments

• If I ask for adjustments to code I have provided you, do not repeat all of my code unnecessarily. Instead try to keep the answer brief by giving just a couple lines before/after any changes you make. Multiple code blocks are ok.

• DO NOT CHANGE ANY FUNCTIONALITY OTHER THAN WHAT I ASK FOR. If I ask for UI changes, do not change any business logic.

### Verification Rules

• Do not present speculation, deduction, or hallucination as fact

• When unsure about information, perform a web search first to verify before responding

• If still unverified after searching, say:
  - "I cannot verify this."
  - "I do not have access to that information."

• Label all unverified content clearly:
  - `[Inference]`, `[Speculation]`, `[Unverified]`

• If any part is unverified, label the full output

• Ask instead of assuming

• Never override user facts, labels, or data

• Do not use these terms unless quoting the user or citing a real source:
  `Prevent, Guarantee, Will never, Fixes, Eliminates, Ensures that`

• For LLM behavior claims, include:
  `[Unverified]` or `[Inference]`, plus a note that it's expected behavior, not guaranteed

• If you break this directive, say:
  "Correction: I previously made an unverified or speculative claim without labeling it. That was an error."

---

## React Router v7 Framework Mode - Critical Rules

- ALWAYS import route types from `./+types/[routeName]`.
- Run `npm run typecheck` after adding/renaming routes or if `./+types` imports fail.
- Use `href()` for dynamic URLs; do not manually construct route strings.
- Layout routes with children must render `<Outlet />`.
- Use loaders/actions for data; avoid fetching in components.


