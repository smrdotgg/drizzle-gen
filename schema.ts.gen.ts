import {  pgTable, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  profileId: text("profile__id")
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
  authorId: text("author_id").references(() => users.id), // not adding unique makes it one-to-many,
});

