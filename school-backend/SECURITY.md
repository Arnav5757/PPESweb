# Security Policy and Guidelines

This document outlines backend security configurations, credential management policies, rotation guidelines, and setup procedures for Pareek Public English School.

---

## 1. Environment Variables Configuration

The backend enforces strict startup checks to ensure secrets are loaded. The application refuses to start and exits immediately if any of these are missing:

| Variable Name  | Purpose                                                       | Example Value / Format                                                  |
| -------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `PORT`         | Port the server listens on                                    | `5000`                                                                  |
| `MONGODB_URI`  | MongoDB connection URI. Can be set to `offline` for In-Memory  | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` or `offline`       |
| `JWT_SECRET`   | String used for signing authentication tokens                 | A cryptographically secure random string                                |
| `CLIENT_URL`   | CORS origin policy to permit request authorization.           | `http://localhost:5173`                                                 |

---

## 2. Generating a Secure JWT Secret

For production environments, generating a cryptographically secure random string is mandatory. Do not use plain text sentences or predictable words.

You can generate a secure secret key using Node.js in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated hex string and assign it to `JWT_SECRET` inside your production `.env` file.

---

## 3. Configuring MongoDB Connection Securely

* Use unique database accounts with the **least privileges** required (read/write access only to target collection).
* Never reuse administrator credentials for application execution.
* Ensure database clusters are restricted to authorized client IPs using IP Access Lists (Whitelisting).
* In development/test environments, you may set `MONGODB_URI=offline` to bypass connection checks and run the server using the high-performance in-memory fallback.

---

## 4. Credential Rotation Guidelines

To prevent unauthorized access or minimize the impact of key leaks, schedule regular credential rotation every 90 days or immediately upon key compromise:

### Rotation Steps:
1. **Prepare New Keys**: Generate a new `JWT_SECRET` and set up secondary database users on MongoDB Atlas.
2. **Apply Changes (Zero-Downtime)**:
   * If using orchestrators (e.g. AWS, Heroku, Docker Swarm), set the new environment values and trigger a rolling update.
   * If manually deployed, apply new credentials to `.env` and perform a server reload.
3. **Verify Connection**: Check audit and startup logs to confirm the server initialized cleanly.
4. **Invalidate Old Secrets**: Revoke access for the old MongoDB user accounts. Note: Rotating `JWT_SECRET` will automatically invalidate all existing client tokens, requiring users to log back in.

---

## 5. Deployment Setup Checklist

Before deploying this backend to staging or production, verify:
* [ ] `.env` is omitted from Git tracking (verify via `.gitignore`).
* [ ] No default or fallback JWT keys are hardcoded in source files.
* [ ] CORS is restricted to target domain origins (e.g., `https://school.pareek.edu`) via `CLIENT_URL`.
* [ ] Error handler is configured to return generic status messages to client APIs to avoid path or database structure leakage.
* [ ] Internal console logs are sanitized (no passwords, headers, connection strings, or user information is logged).
