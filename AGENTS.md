## Project Knowledge

Here is a list of important project knowledge that you should know before executing any task.

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite 7 for development and builds

## Line Length Limits
- **Java:** 120 characters max
- **TypeScript/JavaScript:** 120 chars max

## Boundaries

### ✅ Always
- Organize code by domain package, not by technical layer
- Write unit tests in domain packages mirroring main source structure

### ⚠️ Ask First
- Database schema changes or migrations
- Adding new dependencies to  `package.json`
- Changes to authentication or security configurations
- API endpoint changes that affect external consumers
- Adding new environment variables for secrets

### 🚫 Never
- Create layer-based packages (`controller/`, `service/`, `repository/`, `entity/`)
- Commit secrets, API keys, or credentials
- Edit generated files in `build/` or `dist/` directories
- Edit `node_modules/` or `gradle/wrapper/`
- Use `@SuppressWarnings` without justification comment
- Remove or skip failing tests to make builds pass
- Return different error messages for authentication failures (prevents user enumeration)

### PR Title Requirements

PR titles **must** start with a valid JIRA ID:

```
✅ LSDPS-1234: Add partner management feature
✅ GPP-567: Fix authentication bug
❌ Add new feature (missing JIRA ID)
❌ fix: Update styles (missing JIRA ID)
```

## Local Development URLs

- **Frontend Dev Server:** http://localhost:5554


# Task execution plan
Important: Always plan the task step by step before writing code. Ask for permission to proceed with the plan.
Important: Before proceed with the plan, create a new file named `.agents/plans/name-of-the-task.md`.
Based on the approved plan, list all necessary implementation steps as GitHub-style checkboxes (`- [ ] Step Description`). Use sub-bullets for granular details within each main step.


- Plans should be detailed enough to execute without ambiguity
- Each task in the plan must include at least one validation test to verify it works. Preferably an integration test.
- Assess complexity and single-pass feasibility - can an agent realistically complete this in one go?
- Include a complexity indicator at the top of each plan:
  ✅ Simple - Single-pass executable, low risk
  ⚠️ Medium - May need iteration, some complexity
  🔴 Complex - Break into sub-plans before executing

**CRITICAL: After you successfully complete each step, you MUST update the `.agents/plans/name-of-the-task.md` file by changing the corresponding checkbox from `- [ ]` to `- [x]`.**
Only proceed to the *next* unchecked item after confirming the previous one is checked off in the file. Announce which step you are starting.
