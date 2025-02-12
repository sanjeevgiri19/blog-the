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

//g et new blog
router.get("/add-new", (req, res) => {
  // console.log("this is blog page");

  return res.render("addBlog");
});

//get blog page and comment
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  // console.log("blog id", blog);
  // console.log("comments ", comment);

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
  // console.log("comment issss", comment);
  return res.redirect(`/blog/${req.params.blogId}`);
});

// edit comment
// Backend route to update a comment
// router.post("/comment/edit/:commentId", verifyToken, async (req, res) => {
//   try {
//     const comment = await Comment.findById(req.params.commentId);

//     // Ensure the user is the one who created the comment
//     if (comment.createdBy.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ success: false, message: "You can only edit your own comments." });
//     }

//     // Update the content of the comment
//     comment.content = req.body.content;
//     await comment.save();

//     return res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Error updating comment." });
//   }
// });

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
