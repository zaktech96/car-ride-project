# New Command Generator

Create a new Claude command for a specific workflow.

## Workflow

### 1. Define Command

Ask user:
- What's the command name? (kebab-case, e.g., `gh-lint-staged`)
- What does it do? (one sentence)
- What's the workflow? (steps user goes through)

### 2. Command Structure

```markdown
# Command Name

Brief description of purpose.

## Workflow

### 1. Step Name

Description of what happens.

\`\`\`
# Code block with examples
\`\`\`

### 2. Next Step

...

## Usage

\`\`\`
/command-name              # Description
/command-name arg          # With arguments
\`\`\`

## Error Handling

- Common error 1: How to recover
- Common error 2: How to recover
```

### 3. Generate File

Create in `.cursor/commands/{command-name}.md`

Example sections:
- **Workflow**: Main process (numbered phases/steps)
- **Safety**: Warnings, confirmations needed
- **Error Handling**: Common issues & recovery
- **Usage**: Command syntax examples
- **Output Format**: How results are presented

### 4. Test Command

Have user describe a realistic scenario and walk through it.

### 5. Refine

Ask:
- Missing steps?
- Unclear sections?
- Additional edge cases?

## Template

```markdown
# Command Name

One-sentence description of what this command does.

## Workflow

### 1. First Phase

What happens and why.

\`\`\`
# Commands or code samples
\`\`\`

### 2. Second Phase

...

## Usage

\`\`\`
/command-name              # Default behavior
/command-name {arg}        # With argument
\`\`\`

## Error Handling

- Issue: Solution
- Issue: Solution

## Notes

Any additional context or considerations.
```

## Command Naming

- Prefix: `gh-` for git/github commands
- Style: kebab-case, short, memorable
- Existing: `de-slop`, `gh-commit`, `gh-review-pr`, `gh-fix-ci`, `gh-address-pr-comments`

## Usage

```
/new-cmd                          # Interactive mode
/new-cmd "github merge command"   # Describe what you need
```
