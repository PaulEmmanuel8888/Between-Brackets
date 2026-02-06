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
  const result = await db.query("SELECT * FROM posts ORDER BY created_at DESC");

  return result.rows;
}

export async function getPostById(id) {
  const result = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
  return result.rows[0];
}
export async function getPostsByCategory(slug) {
  const result = await db.query("SELECT * FROM posts WHERE slug = $1", [slug]);
  return result.rows;
}
export async function getLatestPosts() {
  const result = await db.query(
    "SELECT * FROM posts ORDER BY created_at DESC FETCH FIRST 10 ROWS ONLY",
  );

  return result.rows;
}
export async function createPost(newPost) {
  const query = `
  INSERT INTO posts
  (title, short_desc, content, author, slug, category, img_url, publish_date)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *;
`;

  const values = [
    newPost.title,
    newPost.short_desc,
    newPost.content,
    newPost.author,
    newPost.slug,
    newPost.category,
    newPost.img_url,
    newPost.publish_date,
  ];

  const result = await db.query(query, values);
}
export async function deletePost(id) {
  const result = await db.query("DELETE FROM posts WHERE id = $1", [id]);
}
