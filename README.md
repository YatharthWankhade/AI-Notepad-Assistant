# 📝 AI Notepad Assistant

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-green)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-18-red)](https://angular.io/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue)](https://deepmind.google/technologies/gemini/)

A smart, AI-powered notepad application that transforms your rough bullet points into structured, actionable tasks. Built with **Spring Boot** and **Angular**, it leverages **Google Gemini 1.5 Flash** for intelligent grouping and analysis.

---

## ✨ Key Features

### 🧠 Smart Grouping & Analysis
- **Context-Aware**: Intelligently groups related loose points (e.g., "Buy milk", "Sort cables") into logical categories (e.g., "Groceries", "Home Office").
- **Actionable Plans**: Automatically generates titles and step-by-step solutions for each group.
- **Optimized**: Uses a single-request architecture to process entire documents instantly, bypassing API rate limits.

### 📑 Multi-Tab Interface
- **Parallel Workflows**: Work on multiple contexts simultaneously with a dynamic tab bar.
- **Tab Management**: Add (`+`), Rename (Double-click), and Close tabs effortlessly.
- **Isolated State**: Each tab maintains its own content and AI analysis results independently.

### 🚀 Developer Tools
- **Daily Activity Script**: Includes `daily_activity.sh` to automate routine git commits for activity tracking.
- **Robust Parsing**: Resilient to non-JSON AI outputs, ensuring consistent UI rendering.

---

## 🛠️ Technology Stack

- **Backend**: Java 21, Spring Boot 3.3.4, Maven.
- **Frontend**: Angular 18 (Standalone Components), RxJS, TypeScript.
- **AI Provider**: Google Gemini API (`gemini-1.5-flash`).

---

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Node.js & npm
- Google Gemini API Key

### Backend Setup
```bash
cd backend
# Add your API Key in src/main/resources/application.properties
# ai.api.key=YOUR_KEY_HERE
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Access the app at `http://localhost:4200`.