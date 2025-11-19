# Make Tests Command

Generate comprehensive tests for implemented features.

## Workflow

### 1. Identify Test Scope

```
git status --porcelain
git diff HEAD -- '*.py' '*.ts' '*.tsx' '*.js' '*.jsx'
```

Ask user:
- What feature(s) need testing?
- Any edge cases to cover?
- Integration or unit tests priority?

### 2. Analyze Implementation

Read implementation files to understand:
- Function/class signatures
- Input validation requirements
- Error handling patterns
- Dependencies and mocks needed

### 3. Generate Tests

For each function/component:

```
# Structure
describe("Feature Name", () => {
  it("should handle happy path", () => {
    // Arrange
    // Act
    // Assert
  });

  it("should handle edge case X", () => {});
  it("should handle error Y", () => {});
});
```

**Test patterns:**
- Happy path first
- Edge cases (empty, null, boundaries)
- Error conditions
- Integration points

### 4. Create Test Files

Place tests alongside source:
- `src/utils.ts` → `src/utils.test.ts`
- `src/api.tsx` → `src/api.test.tsx`

Show coverage report if available:
```
npm test -- --coverage
pytest --cov
```

### 5. Summary

```
✅ Created tests for {feature}

Files:
  • src/handlers.test.ts (12 tests)
  • src/utils.test.ts (8 tests)

Coverage: 92% lines, 85% branches

Next: npm test to verify
```

## Guidelines

- No mocking unless necessary (prefer real implementations)
- Test behavior, not implementation details
- Clear test names describing expected behavior
- One assertion focus per test (or closely related)
- Use fixtures/factories for complex data setup

## Usage

```
/make-tests                    # Interactive mode
/make-tests "feature name"     # Focus on specific feature
```
