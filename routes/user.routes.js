import express from "express";
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    renderUsersPage,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/app",    renderUsersPage);
router.get("/",       getUsers);
router.get("/:id",    getUserById);
router.post("/",      createUser);
router.put("/:id",    updateUser);
router.delete("/:id", deleteUser);

export default router;
