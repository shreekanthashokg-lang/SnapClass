import { describe, expect, it } from "vitest";
import { parseHttpUrl } from "./env";

describe("parseHttpUrl", () => {
  it("accepts absolute http and https URLs", () => {
    expect(parseHttpUrl("https://example.com")).toBe("https://example.com/");
    expect(parseHttpUrl(" http://localhost:8501/app ")).toBe("http://localhost:8501/app");
  });

  it("rejects empty, malformed and non-http values", () => {
    expect(parseHttpUrl(undefined)).toBeUndefined();
    expect(parseHttpUrl("")).toBeUndefined();
    expect(parseHttpUrl("not a url")).toBeUndefined();
    expect(parseHttpUrl("javascript:alert(1)")).toBeUndefined();
    expect(parseHttpUrl("data:text/html,<script>1</script>")).toBeUndefined();
    expect(parseHttpUrl("ftp://example.com")).toBeUndefined();
  });
});
