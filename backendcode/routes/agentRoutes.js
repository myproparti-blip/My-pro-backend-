import express from "express";
import {
  registerAgent,
  getAllAgents,
  getAgentById,
  deleteAgent,
  updateAgent,
} from "../controllers/agentController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(protect);
router.get("/", getAllAgents);
router.get("/:id", getAgentById);
router.post("/", registerAgent);
router.put("/:id", updateAgent);
router.delete("/:id", deleteAgent);
export default router;
