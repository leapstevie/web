# User CRUD + Auth Sample

## Setup

1. Create `.env`
2. Copy from `env.example`
3. Install packages

```bash
npm install
```

4. Start server

```bash
node index.js
```

## Auth Table

This project auto-creates this table when server starts:

```sql
CREATE TABLE IF NOT EXISTS auth_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Auth Endpoints

### Register

`POST /api/users/register`

```json
{
  "email": "student@example.com",
  "name": "Student Demo",
  "phoneNumber": "01700000001",
  "password": "123456"
}
```

### Login

`POST /api/users/login`

Login with email:

```json
{
  "emailOrPhone": "student@example.com",
  "password": "123456"
}
```

Login with phone:

```json
{
  "emailOrPhone": "01700000001",
  "password": "123456"
}
```

### Decode / Verify Current JWT

`GET /api/users/me`

Header:

```text
Authorization: Bearer your_token_here
```

### Get Registered Accounts

`GET /api/users/auth-accounts`

Header:

```text
Authorization: Bearer your_token_here
```

## Postman

Import:

- `postman/User Auth Sample.postman_collection.json`
- `postman/Local Auth.postman_environment.json`

Flow:

1. Run `Register Account`
2. Run `Login With Email` or `Login With Phone`
3. Copy `token` from login response
4. Paste token into Postman environment `jwtToken`
5. Run `Get Current User From JWT`
6. Run `Get Registered Accounts`
