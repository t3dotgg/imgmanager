// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

// import {
//   mysqlTable,
//   serial,
//   uniqueIndex,
//   index,
//   varchar,
//   timestamp,
// } from "drizzle-orm/mysql-core";

// declaring enum in database
// export const utOld = mysqlTable(
//   "uploaded_image",
//   {
//     id: serial("id").primaryKey(),

//     // Always useful info
//     createdAt: timestamp("createdAt").notNull().defaultNow(),
//     completedAt: timestamp("completedAt"),
//     userId: varchar("userId", { length: 256 }).notNull(),

//     orgId: varchar("orgId", { length: 256 }),

//     // "on upload start" info
//     originalName: varchar("original_name", { length: 256 }).notNull(),
//     fileKey: varchar("file_key", { length: 256 }).notNull(),

//     // Added afterwards
//     originalUrl: varchar("ogUrl", { length: 800 }),
//     removedBgUrl: varchar("transparentUrl", { length: 800 }),
//   },
//   (randomNumber) => ({
//     fileKeyIndex: uniqueIndex("file_key_IDX").on(randomNumber.fileKey),
//     userIdIndex: index("user_id_index").on(randomNumber.userId),
//   })
// );

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const uploadedImage = sqliteTable(
  "uploaded_image",
  {
    id: integer("id").primaryKey(),
    userId: text("userId", { length: 256 }).notNull(),

    orgId: text("orgId", { length: 256 }),

    // "on upload start" info
    originalName: text("original_name", { length: 256 }).notNull(),
    fileKey: text("file_key", { length: 256 }).notNull(),

    // Added afterwards
    originalUrl: text("ogUrl", { length: 800 }),
    removedBgUrl: text("transparentUrl", { length: 800 }),

    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    completedAt: text("completed_at"),
  },
  (randomNumber) => ({
    fileKeyIndex: uniqueIndex("file_key_IDX").on(randomNumber.fileKey),
    userIdIndex: index("user_id_index").on(randomNumber.userId),
  })
);
