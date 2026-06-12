import express              from "express";
import dotenv               from "dotenv";
import path                 from "path";
import { fileURLToPath }    from "url";
import userRoutes           from "./routes/user.routes.js";
import { ensureAuthAccountsTable, renderUsersPage } from "./controllers/user.controller.js";

dotenv.config();

const app           = express();
const __filename    = fileURLToPath(import.meta.url);
const __dirname     = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "view"));
app.set("view engine", "ejs");
app.use("/api/users", userRoutes);
app.get("/", renderUsersPage);

const PORT = process.env.PORT || 3000;

ensureAuthAccountsTable()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to initialize auth_accounts table:", error.message);
        process.exit(1);
    });
