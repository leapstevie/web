import express from "express";
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    registerAccount,
    loginAccount,
    getCurrentAccount,
    getAuthAccounts,
    renderUsersPage,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/app",    renderUsersPage);
router.post("/register", registerAccount);
router.post("/login",    loginAccount);
router.get("/me",        getCurrentAccount);
router.get("/auth-accounts", getAuthAccounts);
router.get("/",       getUsers);
router.get("/:id",    getUserById);
router.post("/",      createUser);
router.put("/:id",    updateUser);
router.delete("/:id", deleteUser);

export default router;
