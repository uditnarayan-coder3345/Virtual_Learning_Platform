# Virtual Learning Platform

A minimal full-stack college project for a virtual learning platform.

## Project structure

- `client/` - React + Vite frontend
- `server/` - Express.js backend API
- `package.json` - root scripts for running both apps together

## Phase 1 foundation

This repository currently contains the initial project foundation only:

- React + Vite frontend setup
- Express API setup
- Basic routing and health-check API
- Environment example files
- Development scripts

## Frontend

```bash
cd client
npm install
npm run dev
```

## Backend

```bash
cd server
npm install
npm run dev
```

### Create an admin account

Public registration creates Student or Teacher accounts only. To create or update an admin account, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env` (optionally set `ADMIN_NAME` and `ADMIN_PHONE`), then run:

```bash
cd server
npm run seed:admin
```

The seed script does not contain default login credentials.

For the one-time initial admin account, use `npm run seed:initial-admin` from `server/`. The script is bound to the configured initial admin identity, checks for an existing account before creating anything, prompts for the password without echoing it, and makes no changes when the account already exists.

## Root development

```bash
npm install
npm run dev
```
