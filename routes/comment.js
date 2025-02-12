// ahile ko lagi blog routes mai define garechu, it is not used anywhere

const express = require("express");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { verifyToken } = require("../middlewares/auth");
const router = express.Router();

//get blog page and comment
router.get("/:id", async (req, res) => {
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  // console.log("comments ", comment);

  return res.render("blog", { comments });
});

//post comment
router.post("/comment/:blogId", verifyToken, async (req, res) => {
  const comment = await Comment.create({
    content: req.body.content,
    createdBy: req.user._id,
    blogId: req.params.blogId,
  });
  console.log("comment issss", comment);
  return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
