import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

//Setting up the Postgresql Database
const db = new pg.Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

export async function getAllPosts() {
  const result = await db.query("SELECT * FROM posts");
  return result.rows;
}
export async function getPostById(id) {
  const result = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
  return result.rows;
}
