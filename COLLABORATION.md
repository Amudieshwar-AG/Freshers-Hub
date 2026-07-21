# 🤝 RIT Freshers Hub Collaboration Guide

Welcome to the team! This guide explains how to get set up, which Git branch you should work on, and which database tables you are responsible for.

---

## 🚀 Step 1: Getting Started

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd "Freshers Hub"
   ```

2. **Select your module's branch**:
   Find your assigned module below, and check out your branch:
   ```bash
   git checkout feature/<your-branch-name>
   ```

3. **Install frontend dependencies**:
   ```bash
   npm install
   npm run dev
   ```
   *(The frontend dev server will run on http://localhost:5173)*

4. **Connect your Spring Boot backend to PostgreSQL**:
   Configure your local `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/rit_freshers_hub
   spring.datasource.username=your_postgres_username
   spring.datasource.password=your_postgres_password
   spring.jpa.hibernate.ddl-auto=validate
   ```

---

## 📋 Step 2: Module to Branch & Database Table Mapping

| Assignee Name | Portal Module | Git Branch Name | Database Table(s) to Use |
| :--- | :--- | :--- | :--- |
| **Friend 1** | 📚 Notes & PYQs | `feature/notes-pyqs` | `notes_pyqs` |
| **Friend 2** | 🤖 AI Fresher Assistant | `feature/ai-assistant` | `ai_chat_messages` |
| **Friend 3** | 🗺️ Campus Map | `feature/campus-map` | `campus_locations` |
| **Friend 4** | 🚌 Bus Routes | `feature/bus-routes` | `bus_routes`, `bus_stops` |
| **Friend 5** | 👩‍🏫 Faculty Directory | `feature/faculty-directory` | `faculty` |
| **Friend 6** | 💬 Freshers Q&A | `feature/freshers-qa` | `community_questions`, `community_answers` |
| **Friend 7** | 🎉 Clubs & Events | `feature/clubs-events` | `clubs`, `events` |
| **Friend 8** | 🧰 Student Toolkit | `feature/student-toolkit` | `toolkit_items` |
| **Friend 9** | 🤫 Anonymous Confession | `feature/anonymous-confessions` | `confessions` |

---

## 🛠️ Step 3: Git Workflow Guidelines

To ensure smooth merging into `main` later without conflicts, please follow these rules:

1. **Keep commits focused**: Only commit changes relating to your assigned module.
2. **Sync with Main regularly**: Before committing or pushing, merge the latest `main` into your branch to stay up to date:
   ```bash
   git fetch origin
   git merge origin/main
   ```
3. **Pushing code**:
   ```bash
   git push origin feature/<your-branch-name>
   ```
4. **Merge to Main**: When your module is fully tested and complete, create a Pull Request on GitHub to merge your feature branch into `main`.
