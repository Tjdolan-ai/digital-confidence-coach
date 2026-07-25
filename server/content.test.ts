import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  getUserContents: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      title: "Test Content",
      body: "Test body content",
      contentType: "blog",
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getContentById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    title: "Test Content",
    body: "Test body content",
    contentType: "blog",
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  createContent: vi.fn().mockResolvedValue(1),
  updateContent: vi.fn().mockResolvedValue(undefined),
  deleteContent: vi.fn().mockResolvedValue(undefined),
  getDerivativesByContent: vi.fn().mockResolvedValue([]),
  createDerivative: vi.fn().mockResolvedValue(1),
  getPublicTemplates: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Test Template",
      description: "A test template",
      category: "blog",
      structure: "# Title\n\nContent here...",
      isPublic: true,
      usageCount: 10,
    },
  ]),
  getUserTemplates: vi.fn().mockResolvedValue([]),
  createTemplate: vi.fn().mockResolvedValue(1),
  incrementTemplateUsage: vi.fn().mockResolvedValue(undefined),
  getUserProfile: vi.fn().mockResolvedValue({
    userId: 1,
    niche: "Technology",
    keywords: ["AI", "Productivity"],
  }),
  upsertUserProfile: vi.fn().mockResolvedValue(undefined),
  getUserScheduledPosts: vi.fn().mockResolvedValue([]),
  getUpcomingPosts: vi.fn().mockResolvedValue([]),
  createScheduledPost: vi.fn().mockResolvedValue(1),
  updateScheduledPost: vi.fn().mockResolvedValue(undefined),
  getUserCalendarItems: vi.fn().mockResolvedValue([]),
  createCalendarItem: vi.fn().mockResolvedValue(1),
  getContentAnalytics: vi.fn().mockResolvedValue([]),
  getTrendingTopics: vi.fn().mockResolvedValue([]),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Content Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists user content when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.content.list({});

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Test Content");
  });

  it("gets content by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.content.get({ id: 1 });

    expect(result).toBeDefined();
    expect(result?.title).toBe("Test Content");
  });

  it("creates new content", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.content.create({
      title: "New Content",
      body: "New content body",
      contentType: "blog",
    });

    expect(result.id).toBe(1);
  });

  it("updates existing content", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.content.update({
      id: 1,
      title: "Updated Title",
    });

    expect(result.success).toBe(true);
  });

  it("deletes content", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.content.delete({ id: 1 });

    expect(result.success).toBe(true);
  });
});

describe("Templates Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists public templates without authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.templates.list({});

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Test Template");
  });

  it("creates a new template when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.templates.create({
      name: "My Template",
      description: "A custom template",
      category: "blog",
      structure: "# Title\n\nContent...",
      isPublic: false,
    });

    expect(result.id).toBe(1);
  });

  it("increments template usage", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.templates.use({ id: 1 });

    expect(result.success).toBe(true);
  });
});

describe("Profile Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets user profile when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.get();

    expect(result).toBeDefined();
    expect(result?.niche).toBe("Technology");
  });

  it("updates user profile", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.update({
      niche: "Marketing",
      keywords: ["SEO", "Content"],
    });

    expect(result.success).toBe(true);
  });
});

describe("Schedule Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists scheduled posts", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.schedule.list({});

    expect(result).toEqual([]);
  });

  it("creates a scheduled post", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.schedule.create({
      platform: "twitter",
      scheduledAt: "2024-12-30T10:00:00Z",
      postContent: "Test post content",
    });

    expect(result.id).toBe(1);
  });

  it("updates a scheduled post", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.schedule.update({
      id: 1,
      status: "cancelled",
    });

    expect(result.success).toBe(true);
  });
});

describe("Analytics Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets analytics overview", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analytics.overview({});

    expect(result.totals).toBeDefined();
    expect(result.totals.views).toBe(0);
    expect(result.records).toEqual([]);
  });
});

describe("Trends Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists trending topics without authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.trends.list({});

    expect(result).toEqual([]);
  });
});

describe("Auth Router", () => {
  it("returns user when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeDefined();
    expect(result?.name).toBe("Test User");
  });

  it("returns null when not authenticated", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeNull();
  });

  it("logs out and clears cookie", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});
