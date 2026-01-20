import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getAllPosts, getPostById } from "./db/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

//Get Routes
app.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const postsPerPage = 6;

  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  const posts = await getAllPosts();

  const paginatedPosts = posts.slice(startIndex, endIndex);

  const column1Posts = paginatedPosts.filter((_, i) => i % 2 === 0);
  const column2Posts = paginatedPosts.filter((_, i) => i % 2 !== 0);

  const totalPages = Math.ceil(posts.length / postsPerPage);

  res.render("index.ejs", {
    column1Posts,
    column2Posts,
    page,
    totalPages,
    baseUrl: "/",
  });
});
app.get("/posts/:id", async (req, res) => {
  const postId = req.params.id;
  const post = await getPostById(postId);
  res.render("post.ejs", { post: post });
});

app.get("/categories", (req, res) => {
  res.render("categories");
});

// Listener
app.listen(PORT, () => {
  console.log(`Server running successfully at port ${PORT}`);
});
