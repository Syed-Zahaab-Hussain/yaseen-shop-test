import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/check", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ isAuthenticated: false });
    }

    jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ isAuthenticated: false });
      }

      return res.status(200).json({ isAuthenticated: true });
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ isAuthenticated: false });
  }
});

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    // console.log(req);

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, decoded) => {
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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

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

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_TOKEN_SECRET,
      // { expiresIn: "1m" }
      // { expiresIn: "5m" }
      { expiresIn: "1h" }
      // { expiresIn: "1d" }
    );
    console.log(token);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      // maxAge: 1 * 60 * 1000, // 1 min
      // maxAge: 5 * 60 * 1000, // 5 min
      maxAge: 60 * 60 * 1000, // 1 hours
      // maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    console.log(user);
    res.status(200).json({
      message: "User logged in successfully",
      userInfo: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/logout", async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.sendStatus(204); // No content
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  res.status(200).json({ message: "User logged out successfully" });
});

export default router;
