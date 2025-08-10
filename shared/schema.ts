import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  phone: text("phone"),
  address: text("address"),
  avatar: text("avatar"), // Base64 encoded image data
  patreonId: text("patreon_id"),
  patreonUsername: text("patreon_username"),
  patreonTier: text("patreon_tier"),
  patreonVerified: boolean("patreon_verified").default(false),
  isAdmin: boolean("is_admin").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dogs = pgTable("dogs", {
  id: serial("id").primaryKey(),
  nfcTagId: text("nfc_tag_id").unique(),
  name: text("name").notNull(),
  description: text("description"),
  age: text("age"),
  weight: text("weight"),
  coat: text("coat"),
  coatColor: text("coat_color"),
  sex: text("sex"),
  eyeColor: text("eye_color"),
  neutered: text("neutered"),
  breed: text("breed"),
  personality: text("personality"),
  loves: text("loves"),
  routine: text("routine"),
  training: text("training"),
  quirks: text("quirks"),
  medicalInfo: jsonb("medical_info"),
  socials: jsonb("socials"),
  testimonials: jsonb("testimonials"),
  gallery: jsonb("gallery"),
  photoUrl: text("photo_url"),
  ownerId: integer("owner_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  dogId: integer("dog_id").references(() => dogs.id),
  deviceName: text("device_name"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  timestamp: timestamp("timestamp").defaultNow(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDogSchema = createInsertSchema(dogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const patreonVerifySchema = z.object({
  patreonId: z.string().min(1),
  accessToken: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDog = z.infer<typeof insertDogSchema>;
export type Dog = typeof dogs.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type PatreonVerifyData = z.infer<typeof patreonVerifySchema>;
