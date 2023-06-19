// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  mysqlTable,
  serial,
  uniqueIndex,
  index,
  varchar,
  timestamp,
} from "drizzle-orm/mysql-core";

// declaring enum in database
export const uploadedImage = mysqlTable(
  "uploaded_image",
  {
    id: serial("id").primaryKey(),

    // Always useful info
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    completedAt: timestamp("completedAt"),
    userId: varchar("userId", { length: 256 }).notNull(),

    // "on upload start" info
    originalName: varchar("original_name", { length: 256 }).notNull(),
    fileKey: varchar("file_key", { length: 256 }).notNull(),

    // Added afterwards
    originalUrl: varchar("ogUrl", { length: 800 }),
    removedBgUrl: varchar("transparentUrl", { length: 800 }),
  },
  (randomNumber) => ({
    fileKeyIndex: uniqueIndex("file_key_IDX").on(randomNumber.fileKey),
    userIdIndex: index("user_id_index").on(randomNumber.userId),
  })
);
