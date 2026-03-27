import { Router, type IRouter } from "express";

const router: IRouter = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "restaurant2024";

declare module "express-serve-static-core" {
  interface Request {
    session?: { authenticated?: boolean; username?: string };
  }
}

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    if (req.session) {
      req.session.authenticated = true;
      req.session.username = username;
    }
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.authenticated = false;
    req.session.username = undefined;
  }
  res.json({ success: true, message: "Logged out" });
});

router.get("/me", (req, res) => {
  const authenticated = req.session?.authenticated === true;
  res.json({
    authenticated,
    username: authenticated ? (req.session?.username ?? null) : null,
  });
});

export default router;
