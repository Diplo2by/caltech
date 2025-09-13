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
// Get daily totals for a date range (for charts and trends)
export async function getDailyTotals(userId, startDate, endDate) {
    try {
        const result = await sql`
      SELECT 
        date,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbs) as total_carbs,
        SUM(fat) as total_fat,
        COUNT(*) as entry_count
      FROM food_entries
      WHERE user_id = ${userId}
        AND date >= ${startDate}
        AND date <= ${endDate}
      GROUP BY date
      ORDER BY date ASC
    `;
        return result;
    } catch (error) {
        console.error("Get daily totals error:", error);
        return [];
    }
}

// Get last N days of data (most common use case)
export async function getLastNDaysTotals(userId, days = 7) {
    try {
        // Calculate start date (N days ago)
        const endDate = new Date().toLocaleDateString('en-CA', {
            timeZone: 'Asia/Kolkata'
        });

        const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
            .toLocaleDateString('en-CA', {
                timeZone: 'Asia/Kolkata'
            });

        const result = await sql`
      SELECT 
        date,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbs) as total_carbs,
        SUM(fat) as total_fat,
        COUNT(*) as entry_count
      FROM food_entries
      WHERE user_id = ${userId}
        AND date >= ${startDate}
        AND date <= ${endDate}
      GROUP BY date
      ORDER BY date ASC
    `;
        return result;
    } catch (error) {
        console.error("Get last N days error:", error);
        return [];
    }
}

// Get weekly averages for longer term trends
export async function getWeeklyAverages(userId, weeks = 4) {
    try {
        const result = await sql`
      SELECT 
        DATE_TRUNC('week', date) as week_start,
        AVG(daily_calories) as avg_calories,
        AVG(daily_protein) as avg_protein,
        AVG(daily_carbs) as avg_carbs,
        AVG(daily_fat) as avg_fat,
        COUNT(*) as days_logged
      FROM (
        SELECT 
          date,
          SUM(calories) as daily_calories,
          SUM(protein) as daily_protein,
          SUM(carbs) as daily_carbs,
          SUM(fat) as daily_fat
        FROM food_entries
        WHERE user_id = ${userId}
          AND date >= CURRENT_DATE - INTERVAL '${weeks} weeks'
        GROUP BY date
      ) daily_data
      GROUP BY DATE_TRUNC('week', date)
      ORDER BY week_start ASC
    `;
        return result;
    } catch (error) {
        console.error("Get weekly averages error:", error);
        return [];
    }
}
