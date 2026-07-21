import { cn, formatScore } from "@/lib/utils";

describe("utility helpers", () => {
  it("merges Tailwind classes deterministically", () => {
    expect(cn("px-2", "px-4", false && "hidden")).toBe("px-4");
  });

  it("formats rounded score labels", () => {
    expect(formatScore(91.7)).toBe("92/100");
  });
});
