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

## 📋 Step 2: Workload & Branch Assignments (5-Member Team)

Since we have a 5-member team (You + 4 friends) to manage the 9 modules, the workload is grouped logically below. Write your names next to your assigned roles:

| Team Member | Assigned Modules | Git Branch Name(s) | Database Table(s) to Use |
| :--- | :--- | :--- | :--- |
| **You (Lead)** | 🤖 **AI Assistant** & Core APIs | `feature/ai-assistant` | `ai_chat_messages` |
| **Friend 1** | 📚 **Notes & PYQs** & 🧰 **Toolkit** | `feature/notes-pyqs`, `feature/student-toolkit` | `notes_pyqs`, `toolkit_items` |
| **Friend 2** | 💬 **Q&A Forum** & 🤫 **Confessions** | `feature/freshers-qa`, `feature/anonymous-confessions` | `community_questions`, `community_answers`, `confessions` |
| **Friend 3** | 🗺️ **Campus Map** & 🚌 **Bus Routes** | `feature/campus-map`, `feature/bus-routes` | `campus_locations`, `bus_routes`, `bus_stops` |
| **Friend 4** | 👩‍🏫 **Faculty Directory** & 🎉 **Events** | `feature/faculty-directory`, `feature/clubs-events` | `faculty`, `clubs`, `events` |

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
