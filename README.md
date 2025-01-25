# drizzle-gen

>### ⚠️ **ALPHA SOFTWARE**: 
>#### This package is in active development and in the early stages.
>#### Only versions marked with `-alpha` are functional.

Automatically generates Drizzle ORM relations based on your schema file.

## Usage




```bash
npx drizzle-gen@alpha
```


### Requirements
- Drizzle ORM project with PostgreSQL or MySQL. (More DB Support in the works)
- Valid drizzle.config.ts file that has the schema file specified as a **single string**. (List schema not yet supported)

### Example

##### Input Schema
```typescript
// Input: schema.ts with table definitions
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .references(() => profiles.id)
    .unique(), // adding unique makes it one-to-one
});

export const profiles = pgTable("profile", {
  id: text("id").primaryKey(),
  content: text("content"),
});

export const posts = pgTable("post", {
  id: text("id").primaryKey(),
  content: text("content"),
  authorId: text("authorId").references(() => users.id), // not adding unique makes it one-to-many,
});
```

##### Output Relations
```typescript
// Output: Generated relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profiles: one(profiles, {
    fields: [users.profileId],
    references: [profiles.id],
  }),
  posts: many(posts),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  users: one(users),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  users: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```
