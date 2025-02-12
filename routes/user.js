const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { generateTokenForUser, verifyToken } = require("../middlewares/auth");
const router = express.Router();

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  // console.log(req.body);

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Please Enter all fields" });
    }

    // await User.create({ name, email, password });

    const user = new User({ name, email, password });
    await user.save();

    const token = generateTokenForUser(user);
    return res.cookie("token", token, { httpOnly: true }).redirect("/");
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({ message: "server error" });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate that both fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    //Compare password
    user.comparePassword(password, (err, isMatch) => {
      // if (err) throw err;
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!isMatch)
        return res.status(400).render("signin", {
          error: "Invalid username or Password",
        });

      const token = generateTokenForUser(user);
      // console.log("token", token);

      //Authentication Successful
      return res.cookie("token", token).redirect("/");
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/signout", (req, res) => {
  return res.clearCookie("token").redirect("/");
});

module.exports = router;
