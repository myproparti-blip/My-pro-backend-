import express from "express";
import {
  getConsultants,
  addConsultant,
  deleteConsultant,
  updateConsultant,
  getConsultantById,
} from "../controllers/consultantController.js";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(protect);


router.get("/", getConsultants);
router.get("/:id", getConsultantById);

router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
  ]),
  addConsultant
);

router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
  ]),
  updateConsultant
);

router.delete("/:id", deleteConsultant);

export default router;
