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
} from "./db/index.js";
import session from "express-session";
import bcrypt from "bcrypt";

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
  console.log(post);
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

  console.log(validUser);

  req.session.isAdmin = true;

  const redirectTo = req.session.redirectTo || "/admin";
  delete req.session.redirectTo;

  res.redirect(redirectTo);
});
app.get("/admin", requireAdmin, async (req, res) => {
  const latestPosts = await getLatestPosts();
  console.log(latestPosts);

  res.render("admin/dashboard", { posts: latestPosts });
});
app.get("/admin/create", requireAdmin, (req, res) => {
  res.render("admin/create");
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
// Listener
app.listen(PORT, () => {
  console.log(`Server running successfully at port ${PORT}`);
});
