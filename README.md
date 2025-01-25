# drizzle-gen

>### ⚠️ **ALPHA SOFTWARE**: 
>#### This package is in early development. Use at your own risk.
>#### Only versions marked with `-alpha` are functional.

Automatically generates Drizzle ORM relations based on your schema file.

## Usage




```bash
npx drizzle-gen@alpha
```

### Options

- `--UNSAFE_auto`: Automatically updates schema file with generated relations

### Requirements
- Drizzle ORM project with PostgreSQL. (MySQL and SQLite support in the works)
- Valid drizzle.config.ts file
- Schema file with table definitions

### Example

```typescript
// Input: schema.ts with table definitions
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name")
});

// Output: Generated relations
export const usersRelations = dzorm.relations(users, ({one, many}) => ({
  posts: many(posts)
}));
```


