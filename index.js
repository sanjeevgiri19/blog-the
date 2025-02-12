require("dotenv").config();
const express = require("express");
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
// const commentRoute = require('./routes/comment')
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { verifyToken } = require("./middlewares/auth");

// const cors = require('cors')
// const User = require("./models/user");
// const bcrypt = require("bcrypt");
// const { checkForAuthCookie } = require("./middlewares/authverify");

const app = express();
PORT = process.env.PORT || 8000;

const cors = require("cors");
const Blog = require("./models/blog");
app.use(cors({ credentials: true, origin: "http://localhost:8000" }));
app.use(express.static(path.resolve("./public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// app.use(checkForAuthCookie("token"));

const mongoURL = process.env.MONGODB_URL;

mongoose
  .connect(mongoURL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);
// app.use('/blog',commentRoute);

app.get("/", verifyToken, async (req, res) => {
  const allBlogs = await Blog.find({});
  // console.log(process.env);
  // console.log(allBlogs);
  const user = req.user;
  return res.render("home", { user: req.user, blogs: allBlogs });
});

app.listen(PORT, () => console.log(`Connected to PORT: ${PORT}`));
