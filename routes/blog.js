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
  // console.log("this is blog page");

  return res.render("addBlog");
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  // console.log("blog id", blog);
  // console.log("comments ", comment);

  return res.render("blog", { blog, comments });
});

router.post("/comment/:blogId", verifyToken, async (req, res) => {
  const comment = await Comment.create({
    content: req.body.content,
    createdBy: req.user._id,
    blogId: req.params.blogId,
  });
  // console.log("comment issss", comment);
  return res.redirect(`/blog/${req.params.blogId}`);
});

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
        // coverImage:`/uploads/${req.file.filename}`,   view ma nai ramro sanga path cha
        coverImage,
        createdBy: req.user._id, // Assuming user is authenticated
      });
      // console.log(newBlog);
      await newBlog.save();
      res.redirect(`/blog/${newBlog._id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
