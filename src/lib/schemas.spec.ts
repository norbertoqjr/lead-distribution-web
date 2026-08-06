import {
  brokerSchema,
  formSchema,
  leadFormSchema,
  loginSchema,
} from "./schemas";

/**
 * These assert the client mirrors the API DTOs. If one of these fails after a
 * server-side change, the two layers have drifted — fix both, not the test.
 */

describe("leadFormSchema", () => {
  it("normalizes the email before validating, matching the DTO transform", () => {
    const result = leadFormSchema.parse({
      name: "  Ada Lovelace ",
      email: "  Ada@Example.COM ",
    });

    expect(result.email).toBe("ada@example.com");
    expect(result.name).toBe("Ada Lovelace");
  });

  it("rejects a malformed email", () => {
    const result = leadFormSchema.safeParse({ name: "Ada", email: "nope" });
    expect(result.success).toBe(false);
  });

  it("treats phone as optional", () => {
    expect(
      leadFormSchema.safeParse({ name: "Ada", email: "a@b.co" }).success,
    ).toBe(true);
  });

  it("rejects a name that is only whitespace once trimmed", () => {
    const result = leadFormSchema.safeParse({ name: "   ", email: "a@b.co" });
    expect(result.success).toBe(false);
  });
});

describe("formSchema", () => {
  it.each([
    ["lead-registration", true],
    ["leadregistration", true],
    ["lead_registration", false],
    ["Lead-Registration", true], // lowercased before the pattern runs
    ["-leading", false],
    ["trailing-", false],
    ["double--hyphen", false],
  ])("slug %s -> valid: %s", (slug, valid) => {
    expect(formSchema.safeParse({ name: "Form", slug }).success).toBe(valid);
  });
});

describe("brokerSchema", () => {
  const valid = {
    name: "Broker A",
    dailyCap: 10,
    timezone: "Asia/Manila",
    openMinute: 540,
    closeMinute: 1080,
    workingDays: [1, 2, 3, 4, 5],
  };

  it("accepts a well-formed broker", () => {
    expect(brokerSchema.safeParse(valid).success).toBe(true);
  });

  it("requires at least one working day", () => {
    expect(brokerSchema.safeParse({ ...valid, workingDays: [] }).success).toBe(
      false,
    );
  });

  it("rejects a weekday outside 1-7", () => {
    expect(brokerSchema.safeParse({ ...valid, workingDays: [8] }).success).toBe(
      false,
    );
  });

  it("rejects a negative daily cap", () => {
    expect(brokerSchema.safeParse({ ...valid, dailyCap: -1 }).success).toBe(
      false,
    );
  });

  it("rejects minutes beyond a day", () => {
    expect(
      brokerSchema.safeParse({ ...valid, closeMinute: 1441 }).success,
    ).toBe(false);
  });

  it("rejects an identical open and close, which would mean a zero-length window", () => {
    expect(
      brokerSchema.safeParse({ ...valid, openMinute: 540, closeMinute: 540 })
        .success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("enforces the same 8 character minimum as the DTO", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.co", password: "short" }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ email: "a@b.co", password: "longenough" })
        .success,
    ).toBe(true);
  });
});
