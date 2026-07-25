import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User profile settings for content preferences
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  niche: varchar("niche", { length: 255 }),
  keywords: json("keywords").$type<string[]>(),
  twitterHandle: varchar("twitterHandle", { length: 64 }),
  linkedinUrl: varchar("linkedinUrl", { length: 255 }),
  blogUrl: varchar("blogUrl", { length: 255 }),
  timezone: varchar("timezone", { length: 64 }).default("UTC"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Content pieces - core content items created by users
 */
export const contents = mysqlTable("contents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  body: text("body").notNull(),
  contentType: mysqlEnum("contentType", ["blog", "tweet_thread", "linkedin", "newsletter", "youtube_summary", "custom"]).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 1000 }),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "archived"]).default("draft").notNull(),
  tags: json("tags").$type<string[]>(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Content = typeof contents.$inferSelect;
export type InsertContent = typeof contents.$inferInsert;

/**
 * Content derivatives - generated variations of core content
 */
export const contentDerivatives = mysqlTable("content_derivatives", {
  id: int("id").autoincrement().primaryKey(),
  parentContentId: int("parentContentId").notNull(),
  userId: int("userId").notNull(),
  format: mysqlEnum("format", ["tweet_thread", "linkedin_post", "newsletter", "summary", "takeaways", "promo_post"]).notNull(),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "published"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContentDerivative = typeof contentDerivatives.$inferSelect;
export type InsertContentDerivative = typeof contentDerivatives.$inferInsert;

/**
 * Scheduled posts for cross-platform publishing
 */
export const scheduledPosts = mysqlTable("scheduled_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentId: int("contentId"),
  derivativeId: int("derivativeId"),
  platform: mysqlEnum("platform", ["twitter", "linkedin", "blog", "newsletter"]).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  publishedAt: timestamp("publishedAt"),
  status: mysqlEnum("status", ["pending", "published", "failed", "cancelled"]).default("pending").notNull(),
  postContent: text("postContent").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;

/**
 * Content calendar items for planning
 */
export const calendarItems = mysqlTable("calendar_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  contentType: mysqlEnum("contentType", ["blog", "tweet_thread", "linkedin", "newsletter", "video", "other"]).notNull(),
  plannedDate: timestamp("plannedDate").notNull(),
  angle: varchar("angle", { length: 500 }),
  format: varchar("format", { length: 255 }),
  status: mysqlEnum("status", ["idea", "in_progress", "ready", "published"]).default("idea").notNull(),
  contentId: int("contentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CalendarItem = typeof calendarItems.$inferSelect;
export type InsertCalendarItem = typeof calendarItems.$inferInsert;

/**
 * Content templates for reusable structures
 */
export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["blog", "social", "newsletter", "video_script", "general"]).notNull(),
  structure: text("structure").notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  usageCount: int("usageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

/**
 * Analytics for published content
 */
export const contentAnalytics = mysqlTable("content_analytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentId: int("contentId"),
  scheduledPostId: int("scheduledPostId"),
  platform: mysqlEnum("platform", ["twitter", "linkedin", "blog", "newsletter"]).notNull(),
  views: int("views").default(0),
  likes: int("likes").default(0),
  shares: int("shares").default(0),
  comments: int("comments").default(0),
  clicks: int("clicks").default(0),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentAnalytics = typeof contentAnalytics.$inferSelect;
export type InsertContentAnalytics = typeof contentAnalytics.$inferInsert;

/**
 * Trending topics cache
 */
export const trendingTopics = mysqlTable("trending_topics", {
  id: int("id").autoincrement().primaryKey(),
  topic: varchar("topic", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  score: int("score").default(0),
  source: varchar("source", { length: 100 }),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrendingTopic = typeof trendingTopics.$inferSelect;
export type InsertTrendingTopic = typeof trendingTopics.$inferInsert;
