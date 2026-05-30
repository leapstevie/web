import db   from "../config/db.js";
import User from "../models/user.model.js";

// CREATE
export const createUser = async (req, res) => {
    try {
        const { name, email, age, salary } = req.body;
        const [result] = await db.execute(
            "INSERT INTO users (name, email, age, salary) VALUES (?, ?, ?, ?)",
            [name, email, age, salary]
        );
        const user = new User(result.insertId, name, email, age, salary);
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET ALL
export const getUsers = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM users");
        const users  = rows.map(r => new User(r.id, r.name, r.email, r.age, r.salary));
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const renderUsersPage = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM users");
        const users  = rows.map(r => new User(r.id, r.name, r.email, r.age, r.salary)).slice(0, 5);
        res.render("app", { users, error: null });
    } catch (err) {
        res.render("app", { users: [], error: "Something went wrong. Please try again later." });
    }
};

// GET ONE
export const getUserById = async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const r    = rows[0];
        const user = new User(r.id, r.name, r.email, r.age, r.salary);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE (PUT)
export const updateUser = async (req, res) => {
    try {
        const { name, email, age, salary } = req.body;
        await db.execute(
            "UPDATE users SET name=?, email=?, age=?, salary=? WHERE id=?",
            [name, email, age, salary, req.params.id]
        );
        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE
export const deleteUser = async (req, res) => {
    try {
        await db.execute("DELETE FROM users WHERE id=?", [req.params.id]);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
