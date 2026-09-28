const { Client } = require('pg');
const connectionString = "postgresql://neondb_owner:npg_igGLhnPCd25e@ep-shy-union-b89imx6f.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require";

const client = new Client({ connectionString });

async function seed() {
  try {
    await client.connect();
    
    // Get Ali and Sara's teacher IDs
    const tpRes = await client.query(`SELECT user_id, first_name FROM teacher_profiles`);
    const teachers = tpRes.rows;

    for (const t of teachers) {
      // Add 2 slots for each teacher (starting tomorrow)
      for (let i = 1; i <= 2; i++) {
        const start = new Date();
        start.setDate(start.getDate() + i);
        start.setHours(16, 0, 0, 0); // 4 PM
        
        const end = new Date(start);
        end.setHours(17, 0, 0, 0); // 5 PM

        await client.query(
          `INSERT INTO availabilities (teacher_id, start_time, end_time, is_booked) VALUES ($1, $2, $3, false)`,
          [t.user_id, start.toISOString(), end.toISOString()]
        );
      }
    }
    console.log("Availabilities seeded successfully.");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}
seed();
