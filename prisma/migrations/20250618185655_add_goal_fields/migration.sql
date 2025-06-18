-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "timeframe" TEXT NOT NULL DEFAULT 'Short',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("category", "createdAt", "description", "id", "progress", "status", "title", "updatedAt", "userId") SELECT "category", "createdAt", "description", "id", "progress", "status", "title", "updatedAt", "userId" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
