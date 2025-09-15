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

    await sql`
      INSERT INTO food_entries (id, user_id, name, calories, protein, carbs, fat, date, quantity, unit)
      VALUES (${entry.id}, ${userId}, ${entry.name}, ${entry.calories}, ${entry.protein}, ${entry.carbs}, ${entry.fat}, ${entry.date}, ${entry.quantity}, ${entry.unit})
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
      SET name = ${entry.name}, calories = ${entry.calories}, protein = ${entry.protein}, carbs = ${entry.carbs}, fat = ${entry.fat}, quantity = ${entry.quantity}, unit = ${entry.unit}
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
    const endDate = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata'
    });

    const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata'
      });

    return getDailyTotals(userId, startDate, endDate);
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

// Get monthly summary statistics
export async function getMonthlySummary(userId, year, month) {
  try {
    const result = await sql`
      SELECT 
        AVG(daily_calories) as avg_calories,
        MIN(daily_calories) as min_calories,
        MAX(daily_calories) as max_calories,
        AVG(daily_protein) as avg_protein,
        AVG(daily_carbs) as avg_carbs,
        AVG(daily_fat) as avg_fat,
        COUNT(*) as days_logged,
        SUM(daily_calories) as total_calories
      FROM (
        SELECT 
          date,
          SUM(calories) as daily_calories,
          SUM(protein) as daily_protein,
          SUM(carbs) as daily_carbs,
          SUM(fat) as daily_fat
        FROM food_entries
        WHERE user_id = ${userId}
          AND EXTRACT(YEAR FROM date) = ${year}
          AND EXTRACT(MONTH FROM date) = ${month}
        GROUP BY date
      ) daily_data
    `;
    return result[0] || {};
  } catch (error) {
    console.error("Get monthly summary error:", error);
    return {};
  }
}

// Get goal achievement data (how many days user met their goal)
export async function getGoalAchievementData(userId, days = 30) {
  try {
    const result = await sql`
      SELECT 
        fe.date,
        SUM(fe.calories) as daily_calories,
        u.daily_goal,
        CASE 
          WHEN SUM(fe.calories) >= u.daily_goal THEN 1 
          ELSE 0 
        END as goal_met
      FROM food_entries fe
      JOIN users u ON u.id = fe.user_id
      WHERE fe.user_id = ${userId}
        AND fe.date >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY fe.date, u.daily_goal
      ORDER BY fe.date ASC
    `;
    return result;
  } catch (error) {
    console.error("Get goal achievement error:", error);
    return [];
  }
}

// Get macro distribution trends (percentage of calories from each macro)
export async function getMacroDistribution(userId, days = 7) {
  try {
    const result = await sql`
      SELECT 
        date,
        SUM(calories) as total_calories,
        SUM(protein * 4) as protein_calories,
        SUM(carbs * 4) as carbs_calories,
        SUM(fat * 9) as fat_calories,
        ROUND((SUM(protein * 4) / NULLIF(SUM(calories), 0) * 100)::numeric, 1) as protein_percentage,
        ROUND((SUM(carbs * 4) / NULLIF(SUM(calories), 0) * 100)::numeric, 1) as carbs_percentage,
        ROUND((SUM(fat * 9) / NULLIF(SUM(calories), 0) * 100)::numeric, 1) as fat_percentage
      FROM food_entries
      WHERE user_id = ${userId}
        AND date >= CURRENT_DATE - (INTERVAL '1 day' * ${days})
      GROUP BY date
      HAVING SUM(calories) > 0
      ORDER BY date ASC
    `;
    return result;
  } catch (error) {
    console.error("Get macro distribution error:", error);
    return [];
  }
}

// Get top foods by frequency (most logged foods)
export async function getTopFoodsByFrequency(userId, days = 30, limit = 10) {
  try {
    const result = await sql`
      SELECT 
        name,
        COUNT(*) as frequency,
        AVG(calories) as avg_calories,
        SUM(calories) as total_calories
      FROM food_entries
      WHERE user_id = ${userId}
        AND date >= CURRENT_DATE - (INTERVAL '1 day' * ${days})
      GROUP BY name
      ORDER BY frequency DESC, total_calories DESC
      LIMIT ${limit}
    `;
    return result;
  } catch (error) {
    console.error("Get top foods error:", error);
    return [];
  }
}

// Get streak data (consecutive days of logging)
export async function getLoggingStreak(userId) {
  try {
    const result = await sql`
            WITH daily_logs AS (
                -- 1. Get all unique days the user logged food
                SELECT DISTINCT date
                FROM food_entries
                WHERE user_id = ${userId}
            ),
            date_diffs AS (
                -- 2. (FIX) First, calculate the difference from the previous day using LAG()
                --    This isolates the first window function.
                SELECT
                    date,
                    date - LAG(date) OVER (ORDER BY date) as diff
                FROM daily_logs
            ),
            streak_identifier AS (
                -- 3. (FIX) Now, use the pre-calculated 'diff' to identify streaks
                --    This uses the second window function on a simple column.
                SELECT
                    date,
                    SUM(CASE WHEN diff > 1 THEN 1 ELSE 0 END) OVER (ORDER BY date) as streak_id
                FROM date_diffs
            )
            -- 4. Group by the streak ID and find the most recent one
            SELECT
                COUNT(*) as streak_length,
                MAX(date) as last_date
            FROM streak_identifier
            GROUP BY streak_id
            ORDER BY last_date DESC
            LIMIT 1
        `;

    // Ensure we got a result
    if (result.length === 0) {
      return 0;
    }

    const { streak_length, last_date } = result[0];

    // A streak is only "current" if the last log was today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = new Date(last_date);
    lastDate.setHours(0, 0, 0, 0);

    const timeDiff = today.getTime() - lastDate.getTime();
    const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));

    // If the last log was today or yesterday, the streak is active
    if (dayDiff <= 1) {
      return streak_length;
    }

    // Otherwise, the streak is broken
    return 0;

  } catch (error) {
    console.error("Get logging streak error:", error);
    return 0;
  }
}

// Get calorie trends with goal comparison
export async function getCalorieTrends(userId, days = 7) {
  try {
    const result = await sql`
      SELECT 
        fe.date,
        SUM(fe.calories) as daily_calories,
        u.daily_goal,
        (SUM(fe.calories) - u.daily_goal) as goal_difference,
        ROUND(((SUM(fe.calories)::float / u.daily_goal) * 100)::numeric, 1) as goal_percentage
      FROM food_entries fe
      JOIN users u ON u.id = fe.user_id
      WHERE fe.user_id = ${userId}
        AND fe.date >= CURRENT_DATE - (INTERVAL '1 day' * ${days})
      GROUP BY fe.date, u.daily_goal
      ORDER BY fe.date ASC
    `;
    return result;
  } catch (error) {
    console.error("Get calorie trends error:", error);
    return [];
  }
}