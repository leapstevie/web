import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db   from "../config/db.js";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";

export const ensureAuthAccountsTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS auth_accounts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            phone_number VARCHAR(30) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};

const signToken = (account) =>
    jwt.sign(
        {
            sub: account.id,
            name: account.name,
            email: account.email,
            phone_number: account.phone_number,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

const extractBearerToken = (req) => {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
        return null;
    }

    return authHeader.slice("Bearer ".length).trim();
};

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
export const getUsers = async (_req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM users");
        const users  = rows.map(r => new User(r.id, r.name, r.email, r.age, r.salary));
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const renderUsersPage = async (_req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM users");
        const users  = rows.map(r => new User(r.id, r.name, r.email, r.age, r.salary)).slice(0, 5);
        res.render("app", { users, error: null });
    } catch (err) {
        res.render("app", { users: [], error: "Something went wrong. Please try again later." });
    }
};

// REGISTER ACCOUNT
export const registerAccount = async (req, res) => {
    try {
        const { email, name, phoneNumber, password } = req.body;

        if (!email || !name || !phoneNumber || !password) {
            return res.status(400).json({
                message: "email, name, phoneNumber and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPhone = phoneNumber.trim();

        const [existingRows] = await db.execute(
            "SELECT id FROM auth_accounts WHERE email = ? OR phone_number = ? LIMIT 1",
            [normalizedEmail, normalizedPhone]
        );

        if (existingRows.length > 0) {
            return res.status(409).json({
                message: "Email or phone number already exists",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            "INSERT INTO auth_accounts (name, email, phone_number, password_hash) VALUES (?, ?, ?, ?)",
            [name.trim(), normalizedEmail, normalizedPhone, passwordHash]
        );

        const [rows] = await db.execute(
            "SELECT id, name, email, phone_number, created_at FROM auth_accounts WHERE id = ?",
            [result.insertId]
        );

        const account = rows[0];
        const token = signToken(account);

        res.status(201).json({
            message: "Register successful",
            account,
            token,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGIN ACCOUNT
export const loginAccount = async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;

        if (!emailOrPhone || !password) {
            return res.status(400).json({
                message: "emailOrPhone and password are required",
            });
        }

        const value = emailOrPhone.trim().toLowerCase();
        const [rows] = await db.execute(
            "SELECT id, name, email, phone_number, password_hash, created_at FROM auth_accounts WHERE email = ? OR phone_number = ? LIMIT 1",
            [value, emailOrPhone.trim()]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email/phone or password",
            });
        }

        const account = rows[0];
        const passwordMatches = await bcrypt.compare(
            password,
            account.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email/phone or password",
            });
        }

        const token = signToken(account);

        res.json({
            message: "Login successful",
            account: {
                id: account.id,
                name: account.name,
                email: account.email,
                phone_number: account.phone_number,
                created_at: account.created_at,
            },
            token,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DECODE CURRENT TOKEN
export const getCurrentAccount = async (req, res) => {
    try {
        const token = extractBearerToken(req);

        if (!token) {
            return res.status(401).json({ message: "Missing Bearer token" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        res.json({
            message: "Token valid",
            decoded,
        });
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

// GET REGISTERED ACCOUNTS
export const getAuthAccounts = async (req, res) => {
    try {
        const token = extractBearerToken(req);

        if (!token) {
            return res.status(401).json({ message: "Missing Bearer token" });
        }

        jwt.verify(token, JWT_SECRET);

        const [rows] = await db.execute(
            "SELECT id, name, email, phone_number, created_at FROM auth_accounts ORDER BY id DESC"
        );

        res.json(rows);
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
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
