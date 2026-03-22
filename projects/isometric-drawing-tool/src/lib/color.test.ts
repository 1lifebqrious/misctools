import { describe, expect, it } from "vitest";
import { withOpacity } from "./color";

describe("withOpacity", () => {
  it("converts a six digit hex color to rgba", () => {
    expect(withOpacity("#336699", 0.4)).toBe("rgba(51, 102, 153, 0.4)");
  });

  it("expands three digit hex values", () => {
    expect(withOpacity("#abc", 1)).toBe("rgba(170, 187, 204, 1)");
  });
});
