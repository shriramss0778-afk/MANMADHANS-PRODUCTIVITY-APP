import { describe, expect, it } from "vitest";
import {
  buildCategoryDistribution,
  buildDailyPagesSeries,
  buildHeatmap,
  buildKnowledgeGrowth,
  buildWeeklyLearningHours,
} from "./analytics";

describe("analytics helpers", () => {
  it("builds weekly learning series", () => {
    const now = new Date();
    const knowledge = [
      { dateLearned: now, retention: 80 },
      { dateLearned: now, retention: 60 },
    ] as Array<{ dateLearned: Date; retention: number }>;
    const sessions = [{ completedAt: now, mode: "focus", durationMins: 50 }] as Array<{
      completedAt: Date;
      mode: string;
      durationMins: number;
    }>;

    const result = buildWeeklyLearningHours(knowledge as never, sessions as never);
    expect(result).toHaveLength(7);
    expect(result[result.length - 1].hours).toBeGreaterThan(0);
  });

  it("builds cumulative knowledge growth", () => {
    const result = buildKnowledgeGrowth(
      [
        { dateLearned: new Date("2026-01-01"), retention: 70 },
        { dateLearned: new Date("2026-01-15"), retention: 90 },
        { dateLearned: new Date("2026-02-01"), retention: 80 },
      ] as never,
    );
    expect(result.at(-1)?.entries).toBe(3);
  });

  it("builds category distribution", () => {
    const result = buildCategoryDistribution(
      [
        { category: "Technology" },
        { category: "Technology" },
        { category: "Business" },
      ] as never,
    );
    expect(result.find((item) => item.name === "Technology")?.value).toBe(2);
  });

  it("builds heatmap values", () => {
    const result = buildHeatmap([new Date(), new Date()], 7);
    expect(result).toHaveLength(7);
    expect(result[result.length - 1]).toBeGreaterThan(0);
  });

  it("builds daily page bars", () => {
    const result = buildDailyPagesSeries(
      [
        {
          pagesRead: 120,
          totalPages: 240,
          startedAt: new Date("2026-06-01"),
          createdAt: new Date("2026-06-01"),
        },
      ] as never,
    );
    expect(result).toHaveLength(7);
  });
});
