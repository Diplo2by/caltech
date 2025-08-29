import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set in .env.local");
}

const sql = neon(process.env.DATABASE_URL);

export async function createUser(userId, email) {
    try {
        await sql`
      INSERT INTO users (id, email) 
      VALUES (${userId}, ${email})
      ON CONFLICT (id) DO NOTHING
    `;
        return { success: true };
    } catch (error) {
        console.error("Create user error:", error);
        return { success: false, error: error.message };
    }
}

export async function getUserGoal(userId) {
    try {
        const result = await sql`
      SELECT daily_goal FROM users WHERE id = ${userId}
    `;
        return result[0]?.daily_goal || 2000;
    } catch (error) {
        console.error("Get user goal error:", error);
        return 2000;
    }
}

export async function updateUserGoal(userId, goal) {
    try {
        await sql`
      UPDATE users SET daily_goal = ${goal} WHERE id = ${userId}
    `;
        return { success: true };
    } catch (error) {
        console.error("Update goal error:", error);
        return { success: false, error: error.message };
    }
}

export async function getFoodEntries(userId, date) {
    try {
        // Convert the requested date to Indian timezone for comparison
        const indianDate = new Date(date + "T12:00:00").toLocaleDateString('en-CA', {
            timeZone: 'Asia/Kolkata'
        });

        const result = await sql`
      SELECT *, date::text as date FROM food_entries 
      WHERE user_id = ${userId} 
      AND date = ${indianDate}
      ORDER BY created_at DESC
    `;
        return result;
    } catch (error) {
        console.error("Get entries error:", error);
        return [];
    }
}

export async function createFoodEntry(userId, entry) {
    try {
        // Ensure date is in YYYY-MM-DD format using Indian timezone
        const indianDate = new Date(entry.date + "T12:00:00").toLocaleDateString('en-CA', {
            timeZone: 'Asia/Kolkata'
        });

        await sql`
      INSERT INTO food_entries (id, user_id, name, calories, protein, carbs, fat, date)
      VALUES (${entry.id}, ${userId}, ${entry.name}, ${entry.calories}, ${entry.protein}, ${entry.carbs}, ${entry.fat}, ${indianDate})
    `;
        return { success: true };
    } catch (error) {
        console.error("Create entry error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateFoodEntry(userId, entryId, entry) {
    try {
        await sql`
      UPDATE food_entries 
      SET name = ${entry.name}, calories = ${entry.calories}, protein = ${entry.protein}, carbs = ${entry.carbs}, fat = ${entry.fat}
      WHERE id = ${entryId} AND user_id = ${userId}
    `;
        return { success: true };
    } catch (error) {
        console.error("Update entry error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteFoodEntry(userId, entryId) {
    try {
        await sql`
      DELETE FROM food_entries WHERE id = ${entryId} AND user_id = ${userId}
    `;
        return { success: true };
    } catch (error) {
        console.error("Delete entry error:", error);
        return { success: false, error: error.message };
    }
}