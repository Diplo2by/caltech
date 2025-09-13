import { neon } from "@neondatabase/serverless";

export async function GET() {
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL value:', process.env.DATABASE_URL);

    if (!process.env.DATABASE_URL) {
        return Response.json({ error: "DATABASE_URL not found" }, { status: 500 });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        const response = await sql`SELECT version()`;
        return Response.json({ version: response[0].version });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}