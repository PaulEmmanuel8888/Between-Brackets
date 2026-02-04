import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  getAllPosts,
  getPostById,
  getPostsByCategory,
  getLatestPosts,
  createPost,
} from "./db/index.js";
import session from "express-session";
import bcrypt from "bcrypt";
import { formatDateHuman, getSlug } from "./helpers.js";

//For markdown
import { marked } from "marked";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Setup DOMPurify in Node
const window = new JSDOM("").window;
const purify = DOMPurify(window);

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

//Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    req.session.redirectTo = req.originalUrl;
    return res.redirect("/admin/login");
  }
  next();
}

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
  // Convert Markdown first to HTML, then sanitize
  const htmlContent = purify.sanitize(marked.parse(post.content));

  post.content = htmlContent;

  res.render("post.ejs", { post: post });
});

app.get("/categories", (req, res) => {
  res.render("categories");
});
app.get("/category/:slug", async (req, res) => {
  const slug = req.params.slug;

  const page = parseInt(req.query.page) || 1;
  const postsPerPage = 6;

  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  const posts = await getPostsByCategory(slug);

  const paginatedPosts = posts.slice(startIndex, endIndex);

  const column1Posts = paginatedPosts.filter((_, i) => i % 2 === 0);
  const column2Posts = paginatedPosts.filter((_, i) => i % 2 !== 0);

  const totalPages = Math.ceil(posts.length / postsPerPage);

  res.render("category.ejs", {
    column1Posts,
    column2Posts,
    page,
    totalPages,
    baseUrl: `/category/${slug}`,
  });
});

//Admin Pages
app.get("/admin/login", (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect("/admin");
  }
  res.render("admin/login");
});
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  const validUser =
    username === process.env.ADMIN_USERNAME &&
    (await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH));

  if (!validUser) {
    return res.redirect("/admin/login");
  }

  req.session.isAdmin = true;

  const redirectTo = req.session.redirectTo || "/admin";
  delete req.session.redirectTo;

  res.redirect(redirectTo);
});
app.get("/admin", requireAdmin, async (req, res) => {
  const latestPosts = await getLatestPosts();

  res.render("admin/dashboard", { posts: latestPosts });
});
app.get("/admin/create", requireAdmin, (req, res) => {
  res.render("admin/create");
});
app.post("/admin/create", async (req, res) => {
  const {
    title,
    short_desc,
    content,
    author,
    category,
    img_url,
    publish_date,
  } = req.body;
  const formattedPublishDate = formatDateHuman(publish_date);
  const slug = getSlug(category);
  const newPost = {
    title: title,
    short_desc: short_desc,
    content: content,
    author: author,
    slug: slug,
    category: category,
    img_url: img_url,
    publish_date: formattedPublishDate,
  };
  console.log(newPost);
  createPost(newPost);
  res.redirect("/admin");
});
app.get("/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/admin");
    }
    res.redirect("/admin/login");
  });
});

//Admin Image Finder
app.get("/admin/image-search", requireAdmin, (req, res) => {
  res.render("admin/image-search");
});
app.get("/api/search-images", requireAdmin, async (req, res) => {
  const { query, page = 1 } = req.query;

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&client_id=${process.env.UNSPLASH_API_KEY}&page=${page}&per_page=12&fm=jpg&w=3000&fit=max`,
    );

    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// Listener
app.listen(PORT, () => {
  console.log(`Server running successfully at http://localhost:${PORT}`);
});
