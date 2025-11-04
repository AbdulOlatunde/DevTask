import express from "express";
import { handleIncomingTelex } from "../controllers/telex.controller.js";

const router = express.Router();

// Telex webhook endpoint
router.post("/webhook", handleIncomingTelex);

export default router;
