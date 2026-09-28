const { Client } = require('pg');
const fs = require('fs');

const connectionString = "postgresql://neondb_owner:npg_igGLhnPCd25e@ep-shy-union-b89imx6f.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require";

const client = new Client({
  connectionString,
});

async function seed() {
  try {
    await client.connect();
    console.log("Connected to Neon DB for seeding...");
    
    // Insert Users
    const u1 = await client.query(`INSERT INTO users (email, password_hash, role, status) VALUES ('ali@test.com', 'mockhash', 'TEACHER', 'ACTIVE') RETURNING id`);
    const u2 = await client.query(`INSERT INTO users (email, password_hash, role, status) VALUES ('sara@test.com', 'mockhash', 'TEACHER', 'ACTIVE') RETURNING id`);
    
    const aliId = u1.rows[0].id;
    const saraId = u2.rows[0].id;

    // Insert Teacher Profiles
    await client.query(`INSERT INTO teacher_profiles (user_id, first_name, last_name, subjects, base_hourly_rate, average_rating, total_lectures, approval_status) 
      VALUES ($1, 'Ali', 'Khan', '{"Mathematics", "Physics"}', 1500, 4.9, 120, 'APPROVED')`, [aliId]);
      
    await client.query(`INSERT INTO teacher_profiles (user_id, first_name, last_name, subjects, base_hourly_rate, average_rating, total_lectures, approval_status) 
      VALUES ($1, 'Sara', 'Ahmed', '{"English Literature", "Urdu"}', 1200, 4.8, 85, 'APPROVED')`, [saraId]);

    console.log("Mock teachers seeded into Neon Database successfully!");
    
  } catch (err) {
    console.error("Seeding failed (maybe already seeded?):", err.message);
  } finally {
    await client.end();
  }
}

seed();
