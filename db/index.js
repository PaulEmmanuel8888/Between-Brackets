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

export async function updatePost(id, updatedPost) {
  const {
    title,
    short_desc,
    content,
    author,
    slug,
    category,
    img_url,
    publish_date,
  } = updatedPost;

  const query = `
    UPDATE posts
    SET
      title = $1,
      short_desc = $2,
      content = $3,
      author = $4,
      slug = $5,
      category = $6,
      img_url = $7,
      publish_date = $8
    WHERE id = $9
    RETURNING *;
  `;

  const values = [
    title,
    short_desc,
    content,
    author,
    slug,
    category,
    img_url,
    publish_date,
    id,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
}

export async function deletePost(id) {
  const result = await db.query("DELETE FROM posts WHERE id = $1", [id]);
}
export async function searchPostsByTitle(searchTerm) {
  const query = `
    SELECT *
    FROM posts
    WHERE title ILIKE '%' || $1 || '%'
    ORDER BY created_at DESC
  `;
  const result = await db.query(query, [searchTerm]);
  return result.rows;
}
