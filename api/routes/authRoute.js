import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// --------------------------Verify existing User Token on every request---------------------------------------

router.get("/check-user", (req, res) => {
  prisma.user
    .findUnique({
      where: { id: 1001 },
    })
    .then((user) => {
      if (user) {
        res.status(200).json(true);
      } else {
        res.status(200).json(false);
      }
    })
    .catch((err) => {
      console.log(err);

      res.status(404).json(false);
    });
});

export const verifyJWT = async (req, res, next) => {
  try {
    // console.log("verify JWT middleware");

    // console.log("Token: ", req.headers.authorization);

    const authHeader = req.headers.authorization;
    // console.log(authHeader);

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// --------------------------Register new User----------------------------------------------------

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------Login existing User----------------------------------------------------

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password);

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    // console.log(user);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
      // { expiresIn: "1m" }
    );

    const refreshToken = jwt.sign(
      { email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1h" }
      // { expiresIn: "5m" }
    );

    res.cookie("token", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      // maxAge: 5 * 60 * 1000, // 5 min
    });

    res.status(200).json({
      message: "User logged in successfully",
      accessToken,
      userInfo: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------------Sending access-token after expiring---------------------------------------

router.get("/refresh-token", async (req, res) => {
  try {
    const refreshToken = req.cookies.token;
    // console.log(req);

    if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const accessToken = jwt.sign(
      { email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
});

// --------------------------LogOut existing User----------------------------------------------------

router.delete("/logout", async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.sendStatus(204); // No content
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  res.status(200).json({ message: "User logged out successfully" });
});

export default router;
