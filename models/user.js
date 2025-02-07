const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const { generateTokenForUser } = require("../middlewares/auth");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      required: false,
      default: "./public/profile.jpg",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

// Hash password before saving user
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  try {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

// Compare candidate password with stored hash

userSchema.methods.comparePassword = async function (
  candidatePassword,
  callback
) {
  await bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

const User = mongoose.model("User", userSchema);
module.exports = User;



//little Knowledge
// This method is added to the user schema so that any User document instance can use it.
// It takes in two arguments:
// - candidatePassword: the plain text password that the user is trying to log in with.
// - callback: a function that will be called after the comparison is complete.
// userSchema.methods.comparePassword = function (candidatePassword, callback) {
//   // 'this.password' refers to the hashed password stored in the database for this user.
//   // We use bcrypt.compare to compare the candidatePassword (plain text) with the hashed password.
//   bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
//     // If there is an error during comparison (e.g., bcrypt issues), pass the error to the callback.
//     if (err) return callback(err);

//     // If no error, the callback is called with 'null' for error and 'isMatch' as the result.
//     // 'isMatch' is a boolean: true if the candidatePassword matches the hashed password, false otherwise.
//     callback(null, isMatch);
//   });
// };
