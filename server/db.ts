import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  userProfiles, 
  contents, 
  contentDerivatives, 
  scheduledPosts, 
  calendarItems, 
  templates, 
  contentAnalytics, 
  trendingTopics,
  InsertUserProfile,
  InsertContent,
  InsertContentDerivative,
  InsertScheduledPost,
  InsertCalendarItem,
  InsertTemplate,
  InsertContentAnalytics,
  InsertTrendingTopic
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ USER PROFILE OPERATIONS ============

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserProfile(profile: InsertUserProfile) {
  const db = await getDb();
  if (!db) return;

  const existing = await getUserProfile(profile.userId);
  if (existing) {
    await db.update(userProfiles).set(profile).where(eq(userProfiles.userId, profile.userId));
  } else {
    await db.insert(userProfiles).values(profile);
  }
}

// ============ CONTENT OPERATIONS ============

export async function createContent(content: InsertContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contents).values(content);
  return result[0].insertId;
}

export async function getContentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(contents).where(eq(contents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserContents(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(contents)
    .where(eq(contents.userId, userId))
    .orderBy(desc(contents.createdAt))
    .limit(limit);
}

export async function updateContent(id: number, updates: Partial<InsertContent>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(contents).set(updates).where(eq(contents.id, id));
}

export async function deleteContent(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(contents).where(eq(contents.id, id));
}

// ============ CONTENT DERIVATIVE OPERATIONS ============

export async function createDerivative(derivative: InsertContentDerivative) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contentDerivatives).values(derivative);
  return result[0].insertId;
}

export async function getDerivativesByContent(contentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(contentDerivatives)
    .where(eq(contentDerivatives.parentContentId, contentId))
    .orderBy(desc(contentDerivatives.createdAt));
}

// ============ SCHEDULED POST OPERATIONS ============

export async function createScheduledPost(post: InsertScheduledPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(scheduledPosts).values(post);
  return result[0].insertId;
}

export async function getUserScheduledPosts(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(scheduledPosts)
    .where(eq(scheduledPosts.userId, userId))
    .orderBy(scheduledPosts.scheduledAt)
    .limit(limit);
}

export async function getUpcomingPosts(userId: number, days = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  
  return db.select().from(scheduledPosts)
    .where(and(
      eq(scheduledPosts.userId, userId),
      eq(scheduledPosts.status, "pending"),
      gte(scheduledPosts.scheduledAt, now),
      lte(scheduledPosts.scheduledAt, future)
    ))
    .orderBy(scheduledPosts.scheduledAt);
}

export async function updateScheduledPost(id: number, updates: Partial<InsertScheduledPost>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(scheduledPosts).set(updates).where(eq(scheduledPosts.id, id));
}

// ============ CALENDAR ITEM OPERATIONS ============

export async function createCalendarItem(item: InsertCalendarItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(calendarItems).values(item);
  return result[0].insertId;
}

export async function getUserCalendarItems(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(calendarItems).where(eq(calendarItems.userId, userId));
  
  if (startDate && endDate) {
    query = db.select().from(calendarItems)
      .where(and(
        eq(calendarItems.userId, userId),
        gte(calendarItems.plannedDate, startDate),
        lte(calendarItems.plannedDate, endDate)
      ));
  }
  
  return query.orderBy(calendarItems.plannedDate);
}

export async function updateCalendarItem(id: number, updates: Partial<InsertCalendarItem>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(calendarItems).set(updates).where(eq(calendarItems.id, id));
}

// ============ TEMPLATE OPERATIONS ============

export async function createTemplate(template: InsertTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(templates).values(template);
  return result[0].insertId;
}

export async function getPublicTemplates(category?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (category) {
    return db.select().from(templates)
      .where(and(eq(templates.isPublic, true), eq(templates.category, category as any)))
      .orderBy(desc(templates.usageCount));
  }
  
  return db.select().from(templates)
    .where(eq(templates.isPublic, true))
    .orderBy(desc(templates.usageCount));
}

export async function getUserTemplates(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(templates)
    .where(eq(templates.userId, userId))
    .orderBy(desc(templates.createdAt));
}

export async function incrementTemplateUsage(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(templates)
    .set({ usageCount: sql`${templates.usageCount} + 1` })
    .where(eq(templates.id, id));
}

// ============ ANALYTICS OPERATIONS ============

export async function createAnalyticsRecord(analytics: InsertContentAnalytics) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contentAnalytics).values(analytics);
  return result[0].insertId;
}

export async function getContentAnalytics(userId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db.select().from(contentAnalytics)
    .where(and(
      eq(contentAnalytics.userId, userId),
      gte(contentAnalytics.recordedAt, startDate)
    ))
    .orderBy(desc(contentAnalytics.recordedAt));
}

// ============ TRENDING TOPICS OPERATIONS ============

export async function getTrendingTopics(category?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  
  if (category) {
    return db.select().from(trendingTopics)
      .where(and(
        eq(trendingTopics.category, category),
        gte(trendingTopics.expiresAt, now)
      ))
      .orderBy(desc(trendingTopics.score))
      .limit(20);
  }
  
  return db.select().from(trendingTopics)
    .where(gte(trendingTopics.expiresAt, now))
    .orderBy(desc(trendingTopics.score))
    .limit(20);
}

export async function upsertTrendingTopic(topic: InsertTrendingTopic) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(trendingTopics).values(topic).onDuplicateKeyUpdate({
    set: { score: topic.score, expiresAt: topic.expiresAt }
  });
}
