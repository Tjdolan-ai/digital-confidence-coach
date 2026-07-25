import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

// ============ CONTENT ROUTER ============
const contentRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return db.getUserContents(ctx.user.id, input?.limit);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getContentById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      body: z.string(),
      contentType: z.enum(["blog", "tweet_thread", "linkedin", "newsletter", "youtube_summary", "custom"]),
      sourceUrl: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createContent({
        userId: ctx.user.id,
        title: input.title,
        body: input.body,
        contentType: input.contentType,
        sourceUrl: input.sourceUrl,
        tags: input.tags,
        status: "draft",
      });
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      body: z.string().optional(),
      status: z.enum(["draft", "scheduled", "published", "archived"]).optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      await db.updateContent(input.id, input);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteContent(input.id);
      return { success: true };
    }),

  getDerivatives: protectedProcedure
    .input(z.object({ contentId: z.number() }))
    .query(async ({ input }) => {
      return db.getDerivativesByContent(input.contentId);
    }),

  generateDerivatives: protectedProcedure
    .input(z.object({
      contentId: z.number(),
      formats: z.array(z.enum(["tweet_thread", "linkedin_post", "newsletter", "summary", "takeaways", "promo_post"])),
    }))
    .mutation(async ({ ctx, input }) => {
      const content = await db.getContentById(input.contentId);
      if (!content) throw new Error("Content not found");

      const derivatives = [];
      
      for (const format of input.formats) {
        const prompt = getDerivativePrompt(format, content.title, content.body);
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a professional content writer who creates engaging, platform-specific content." },
            { role: "user", content: prompt }
          ]
        });

        const messageContent = response.choices[0]?.message?.content;
        const generatedContent = typeof messageContent === 'string' ? messageContent : '';
        
        const id = await db.createDerivative({
          parentContentId: input.contentId,
          userId: ctx.user.id,
          format,
          content: generatedContent,
          status: "draft",
        });
        
        derivatives.push({ id, format, content: generatedContent });
      }

      return { derivatives };
    }),
});

// ============ IDEATION ROUTER ============
const ideationRouter = router({
  generateCalendar: protectedProcedure
    .input(z.object({
      prompt: z.string(),
      contentType: z.string().optional(),
      duration: z.enum(["week", "2weeks", "month"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const daysMap = { week: 7, "2weeks": 14, month: 30 };
      const days = daysMap[input.duration];

      const systemPrompt = `You are a content strategist who creates detailed content calendars. Generate a content calendar with specific, actionable content ideas.`;
      
      const userPrompt = `Create a ${days}-day content calendar for the following topic/prompt:

"${input.prompt}"

${input.contentType && input.contentType !== "all" ? `Focus on ${input.contentType} content.` : "Include a mix of content types (blog posts, Twitter threads, LinkedIn posts, newsletters)."}

For each content idea, provide:
1. Title (compelling and specific)
2. Content type (blog, tweet_thread, linkedin, newsletter, video)
3. Suggested day of the week
4. Angle (unique perspective or hook)
5. Format (how to structure it)
6. 2-3 relevant tags

Return as JSON array with this structure:
[{"title": "...", "type": "...", "suggestedDay": "Monday", "angle": "...", "format": "...", "tags": ["...", "..."]}]`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "content_calendar",
            strict: true,
            schema: {
              type: "object",
              properties: {
                ideas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      type: { type: "string" },
                      suggestedDay: { type: "string" },
                      angle: { type: "string" },
                      format: { type: "string" },
                      tags: { type: "array", items: { type: "string" } }
                    },
                    required: ["title", "type", "suggestedDay", "angle", "format", "tags"],
                    additionalProperties: false
                  }
                }
              },
              required: ["ideas"],
              additionalProperties: false
            }
          }
        }
      });

      const responseContent = response.choices[0]?.message?.content;
      const content = typeof responseContent === 'string' ? responseContent : '{}';
      const parsed = JSON.parse(content);
      
      return { ideas: parsed.ideas || [] };
    }),

  addToCalendar: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      contentType: z.enum(["blog", "tweet_thread", "linkedin", "newsletter", "video", "other"]),
      plannedDate: z.string(),
      angle: z.string().optional(),
      format: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createCalendarItem({
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        contentType: input.contentType,
        plannedDate: new Date(input.plannedDate),
        angle: input.angle,
        format: input.format,
        status: "idea",
      });
      return { id };
    }),
});

// ============ REPURPOSE ROUTER ============
const repurposeRouter = router({
  process: protectedProcedure
    .input(z.object({
      content: z.string(),
      sourceUrl: z.string().optional(),
      formats: z.array(z.enum(["summary", "takeaways", "twitter", "linkedin", "newsletter", "quotes"])),
    }))
    .mutation(async ({ input }) => {
      const outputs: Record<string, string> = {};

      for (const format of input.formats) {
        const prompt = getRepurposePrompt(format, input.content);
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a professional content repurposing specialist who transforms content for different platforms and formats." },
            { role: "user", content: prompt }
          ]
        });

        const messageContent = response.choices[0]?.message?.content;
        outputs[format] = typeof messageContent === 'string' ? messageContent : '';
      }

      return { outputs };
    }),
});

// ============ SCHEDULE ROUTER ============
const scheduleRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return db.getUserScheduledPosts(ctx.user.id, input?.limit);
    }),

  upcoming: protectedProcedure
    .input(z.object({ days: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return db.getUpcomingPosts(ctx.user.id, input?.days);
    }),

  create: protectedProcedure
    .input(z.object({
      contentId: z.number().optional(),
      derivativeId: z.number().optional(),
      platform: z.enum(["twitter", "linkedin", "blog", "newsletter"]),
      scheduledAt: z.string(),
      postContent: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createScheduledPost({
        userId: ctx.user.id,
        contentId: input.contentId,
        derivativeId: input.derivativeId,
        platform: input.platform,
        scheduledAt: new Date(input.scheduledAt),
        postContent: input.postContent,
        status: "pending",
      });
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      scheduledAt: z.string().optional(),
      postContent: z.string().optional(),
      status: z.enum(["pending", "published", "failed", "cancelled"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const updates: any = { ...input };
      if (input.scheduledAt) {
        updates.scheduledAt = new Date(input.scheduledAt);
      }
      delete updates.id;
      await db.updateScheduledPost(input.id, updates);
      return { success: true };
    }),

  calendar: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return db.getUserCalendarItems(
        ctx.user.id,
        new Date(input.startDate),
        new Date(input.endDate)
      );
    }),
});

// ============ TEMPLATES ROUTER ============
const templatesRouter = router({
  list: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return db.getPublicTemplates(input?.category);
    }),

  userTemplates: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getUserTemplates(ctx.user.id);
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      category: z.enum(["blog", "social", "newsletter", "video_script", "general"]),
      structure: z.string(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createTemplate({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        category: input.category,
        structure: input.structure,
        isPublic: input.isPublic ?? false,
      });
      return { id };
    }),

  use: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.incrementTemplateUsage(input.id);
      return { success: true };
    }),
});

// ============ ANALYTICS ROUTER ============
const analyticsRouter = router({
  overview: protectedProcedure
    .input(z.object({ days: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const records = await db.getContentAnalytics(ctx.user.id, input?.days);
      
      // Aggregate stats
      const totals = records.reduce((acc, r) => ({
        views: acc.views + (r.views || 0),
        likes: acc.likes + (r.likes || 0),
        shares: acc.shares + (r.shares || 0),
        comments: acc.comments + (r.comments || 0),
        clicks: acc.clicks + (r.clicks || 0),
      }), { views: 0, likes: 0, shares: 0, comments: 0, clicks: 0 });

      return {
        totals,
        records,
      };
    }),
});

// ============ TRENDS ROUTER ============
const trendsRouter = router({
  list: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return db.getTrendingTopics(input?.category);
    }),
});

// ============ PROFILE ROUTER ============
const profileRouter = router({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getUserProfile(ctx.user.id);
    }),

  update: protectedProcedure
    .input(z.object({
      niche: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      twitterHandle: z.string().optional(),
      linkedinUrl: z.string().optional(),
      blogUrl: z.string().optional(),
      timezone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.upsertUserProfile({
        userId: ctx.user.id,
        ...input,
      });
      return { success: true };
    }),
});

// ============ MAIN ROUTER ============
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  content: contentRouter,
  ideation: ideationRouter,
  repurpose: repurposeRouter,
  schedule: scheduleRouter,
  templates: templatesRouter,
  analytics: analyticsRouter,
  trends: trendsRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;

// ============ HELPER FUNCTIONS ============

function getDerivativePrompt(format: string, title: string, body: string): string {
  const prompts: Record<string, string> = {
    tweet_thread: `Convert this content into an engaging Twitter thread (8-12 tweets). Start with a hook, include key insights, and end with a call to action.

Title: ${title}
Content: ${body}`,
    
    linkedin_post: `Transform this content into a professional LinkedIn post. Use a personal story angle, include line breaks for readability, and end with a question to drive engagement.

Title: ${title}
Content: ${body}`,
    
    newsletter: `Adapt this content for an email newsletter. Make it conversational, add a personal touch, and include clear sections with headers.

Title: ${title}
Content: ${body}`,
    
    summary: `Create a concise 2-3 paragraph summary of this content that captures the key points and main takeaways.

Title: ${title}
Content: ${body}`,
    
    takeaways: `Extract 5-7 key takeaways from this content as bullet points. Each takeaway should be actionable and specific.

Title: ${title}
Content: ${body}`,
    
    promo_post: `Create a short promotional social media post (under 280 characters) that teases this content and drives clicks.

Title: ${title}
Content: ${body}`,
  };

  return prompts[format] || `Transform this content for ${format} format:\n\nTitle: ${title}\nContent: ${body}`;
}

function getRepurposePrompt(format: string, content: string): string {
  const prompts: Record<string, string> = {
    summary: `Create a concise summary (2-3 paragraphs) of the following content:\n\n${content}`,
    
    takeaways: `Extract 5-7 key takeaways as bullet points from this content:\n\n${content}`,
    
    twitter: `Convert this content into an engaging Twitter thread (8-12 tweets). Start with a compelling hook:\n\n${content}`,
    
    linkedin: `Transform this into a professional LinkedIn post with personal storytelling:\n\n${content}`,
    
    newsletter: `Adapt this for an email newsletter with a conversational tone:\n\n${content}`,
    
    quotes: `Extract 4-6 quotable moments or key statements from this content that would work well as standalone social media posts:\n\n${content}`,
  };

  return prompts[format] || `Transform this content for ${format}:\n\n${content}`;
}
