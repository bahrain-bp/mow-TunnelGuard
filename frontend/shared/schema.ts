import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  status: true
});

// Tunnel Table
export const tunnels = pgTable("tunnels", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  riskLevel: text("risk_level").notNull(),
  waterLevel: integer("water_level").notNull(),
  barrierStatus: text("barrier_status").notNull(),
  lastUpdate: timestamp("last_update").notNull().defaultNow(),
  guidanceDisplayEnabled: boolean("guidance_display_enabled").default(false),
  activeGuidanceSymbol: text("active_guidance_symbol").default("none"),
  mapEmbedHtml: text("map_embed_html"),
});

export const insertTunnelSchema = createInsertSchema(tunnels).omit({
  lastUpdate: true
});

// Sensor Table
export const sensors = pgTable("sensors", {
  id: serial("id").primaryKey(),
  tunnelId: text("tunnel_id").notNull().references(() => tunnels.id),
  type: text("type").notNull(), // water_level, air_quality, temperature, structural, traffic, rainfall, rainfall_intensity
  value: integer("value").notNull(),
  unit: text("unit").notNull().default("mm"),
  status: text("status").notNull(),
  lastCalibrated: timestamp("last_calibrated", { mode: 'date' }).defaultNow(),
  nextMaintenance: timestamp("next_maintenance").notNull(),
  alertThreshold: integer("alert_threshold"),
  rainfallDuration: text("rainfall_duration"),
  description: text("description"),
});

export const insertSensorSchema = createInsertSchema(sensors).omit({
  id: true
});

// Tunnel Closure Request Table
export const closureRequests = pgTable("closure_requests", {
  id: serial("id").primaryKey(),
  tunnelId: text("tunnel_id").notNull().references(() => tunnels.id),
  requestedById: integer("requested_by_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  reviewedById: integer("reviewed_by_id").references(() => users.id),
  reviewNotes: text("review_notes"),
});

export const insertClosureRequestSchema = createInsertSchema(closureRequests).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  reviewedById: true,
  reviewNotes: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tunnel = typeof tunnels.$inferSelect;
export type InsertTunnel = z.infer<typeof insertTunnelSchema>;

export type Sensor = typeof sensors.$inferSelect;
export type InsertSensor = z.infer<typeof insertSensorSchema>;

export type ClosureRequest = typeof closureRequests.$inferSelect;
export type InsertClosureRequest = z.infer<typeof insertClosureRequestSchema>;

// Operations Log Table
export const operationsLogs = pgTable("operations_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  category: text("category").notNull(), // tunnel, user, sensor, system, etc.
  details: jsonb("details"), // JSON data for additional context
  entityId: text("entity_id"), // ID of the entity being operated on (tunnel ID, user ID, etc.)
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  environmentData: jsonb("environment_data"), // Optional environmental data at time of operation
  hardwareImpact: jsonb("hardware_impact"), // Hardware usage and maintenance impact data
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const insertOperationsLogSchema = createInsertSchema(operationsLogs).omit({
  id: true,
  timestamp: true,
});

export type OperationsLog = typeof operationsLogs.$inferSelect;
export type InsertOperationsLog = z.infer<typeof insertOperationsLogSchema>;
