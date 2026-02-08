# drizzle-gen

Automatically generates Drizzle ORM relations based on your Drizzle ORM schema file.

## Installation

No installation required! Use directly with your favorite package manager:

```bash
# Using npx (npm)
npx drizzle-gen

# Using pnpx (pnpm)
pnpx drizzle-gen

# Using bunx (bun)
bunx drizzle-gen
```

Or install globally:

```bash
npm install -g drizzle-gen
# Then run:
drizzle-gen
```

## Usage

Run in your project directory (where `drizzle.config.ts` is located):

```bash
npx drizzle-gen
```

For development with auto-regeneration on file changes:

```bash
npx drizzle-gen --watch
```

> **NOTE:** Import from `{schema_path}.gen.ts` in your code. Drizzle-gen will auto-update the `.gen.ts` file as you work on your schema.

### Supported Package Managers

- ✅ npm (`npx drizzle-gen`)
- ✅ pnpm (`pnpx drizzle-gen`)
- ✅ bun (`bunx drizzle-gen`)
- ✅ yarn (`yarn dlx drizzle-gen`)

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
