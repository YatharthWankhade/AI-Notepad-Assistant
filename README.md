# 📝 AI Notepad Assistant

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-green)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-18-red)](https://angular.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://www.docker.com/)

A smart, AI-powered notepad application that transforms your rough bullet points into structured, actionable tasks. Now **Production Ready** with secure authentication, cloud sync, and a guest mode for quick access.

![App Screenshot](https://via.placeholder.com/800x450?text=AI+Notepad+Dashboard)

---

## ✨ Key Features

### 🧠 Smart Analysis & Grouping
- **Context-Aware**: Intelligently groups related loose points (e.g., "Buy milk", "Sort cables") into logical categories.
- **Actionable Plans**: Automatically generates titles and step-by-step solutions for each group.
- **Powered by Gemini**: Uses Google's Gemini 1.5 Flash model for lightning-fast analysis.

### � Secure Authentication & Sync
- **User Accounts**: Sign up and log in to save your notes securely in the database.
- **Cloud Sync**: Access your notes history from any device when logged in.
- **Guest Mode**: Use the full power of AI analysis instantly without creating an account (Data not saved).
- **JWT Security**: Stateless, secure authentication using JSON Web Tokens.

### � Modern UI/UX
- **Multi-Tab Interface**: Work on multiple ideas simultaneously.
- **Split View**: Compose on the left, view AI insights on the right.
- **Real-time Feedback**: Instant analysis with loading states and polished animations.

---

## 🛠️ Technology Stack

- **Backend**: Java 21, Spring Boot 3, Spring Security (JWT), Spring Data JPA.
- **Database**: PostgreSQL 16 (Containerized via Docker).
- **Frontend**: Angular 18 (Standalone Components), RxJS, TypeScript.
- **AI**: Google Gemini API.

---

## 🚀 Getting Started

### Prerequisites
- **Java 21+**
- **Node.js 18+** & npm
- **Docker Desktop** (for Database)
- **Google Gemini API Key**

### 1. Database Setup
Start the PostgreSQL database using Docker Compose:
```bash
docker-compose up -d
```
This will spin up a Postgres instance on port `5432` with user `postgres` and password `password`.

### 2. Backend Setup
 Configure your API Key in `backend/src/main/resources/application.properties` (or set `GEMINI_API_KEY` env var).

```bash
cd backend
mvn spring-boot:run
```
The server will start on `http://localhost:8080`.

### 3. Frontend Setup
```bash
cd frontend
npm install
ng serve
```
Access the application at `http://localhost:4200`.

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup`: Register a new user.
- `POST /api/auth/signin`: Login and get JWT token.

### Notes
- `POST /api/notes/analyze`: Analyze text (Authenticated or Guest).
- `GET /api/notes`: Fetch saved notes history (Authenticated ONLY).

---
*Built with ❤️ by [Yatharth Wankhade](https://github.com/YatharthWankhade)*