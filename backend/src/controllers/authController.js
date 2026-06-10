const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, message: "Password must be at least 8 characters" },
  { test: (p) => /[A-Z]/.test(p), message: "Password must include an uppercase letter" },
  { test: (p) => /[a-z]/.test(p), message: "Password must include a lowercase letter" },
  { test: (p) => /\d/.test(p), message: "Password must include a number" },
  {
    test: (p) => /[!@#$%^&*]/.test(p),
    message: "Password must include a special character (!@#$%^&*)",
  },
];

function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return "Password is required";
  }

  const failedRule = PASSWORD_RULES.find((rule) => !rule.test(password));
  return failedRule ? failedRule.message : null;
}

// ================= REGISTER =================

const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // CHECK USER EXISTS
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // CREATE USER
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    // CREATE TOKEN
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User Registered Successfully",
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= LOGIN =================

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // FIND USER
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    if (user.role !== role) {
      return res.status(400).json({
      message: "Invalid role selected",
      });
}

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // TOKEN
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login Successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};
