import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();
const authController = new AuthController();

router.post("/validate", authController.validateLicense);
router.post("/licenses", authController.createLicense);
router.get("/licenses", authController.getAllLicenses);
router.put("/licenses/:license_key", authController.updateLicense);
router.delete("/licenses/:license_key", authController.deleteLicense);
router.post("/licenses/:license_key/ips", authController.updateIps);
router.get("/logs", authController.getAllLogs);
router.get("/scripts", authController.getAvailableScripts);

export default router;