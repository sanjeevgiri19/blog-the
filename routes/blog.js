const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const { verifyToken } = require("../middlewares/auth");
const Comment = require("../models/comment");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  res.render("addBlog", {
    currentUrl: req.originalUrl,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  return res.render("blog", { blog, comments, user: req.user });
});

// get edit post -> fetch post and render edit form
router.get("/edit/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(400).send("Blog not found");
    }
    res.render("edit", { blog });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//post edit blog post -> updates the post in db
router.post("/edit/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const { title, body } = req.body;
    await Blog.findByIdAndUpdate(id, { title, body });
    res.redirect("/");
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

//delete blog post
router.post("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await Blog.findByIdAndDelete(id);
    res.redirect("/");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// post comment
router.post("/comment/:blogId", verifyToken, async (req, res) => {
  const comment = await Comment.create({
    content: req.body.content,
    createdBy: req.user._id,
    blogId: req.params.blogId,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.put("/comment/edit/:id", async (req, res) => {
  try {
    const { content } = req.body;
    await Comment.findByIdAndUpdate(req.params.id, { content });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.delete("/comment/delete/:id", async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// new post
router.post(
  "/add-new",
  verifyToken,
  upload.single("coverImage"),
  async (req, res) => {
    try {
      const { title, body } = req.body;
      const coverImage = req.file ? req.file.filename : null;

      if (!title || !body) {
        return res.status(400).send("Please fill in all required fields.");
      }

      const newBlog = new Blog({
        title,
        body,
        coverImage,
        createdBy: req.user._id,
      });
      await newBlog.save();
      res.redirect(`/blog/${newBlog._id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
