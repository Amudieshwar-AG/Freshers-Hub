# 🏫 Rajalakshmi Institute of Technology — Freshers-Hub

Welcome to the **Freshers-Hub Portal**, a multi-service campus assistant and student utility ecosystem designed for Rajalakshmi Institute of Technology (RIT). The platform provides student services including live transit tracking, study guides, competitive programming leaderboards, developer collaboration networks, and an automated AI assistant.

---

## 🏗️ System Architecture & Service Stack

The system is built on a distributed microservice architecture utilizing four primary runtimes:

```
                  ┌───────────────────────────────┐
                  │       Nginx Web Server        │
                  │       (Ports 80 / 443)        │
                  └───────────────┬───────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│  React Frontend   │   │Spring Boot Backend│   │Go Chatbot Service │
│   (Vite App)      │   │   (Port 8085)     │   │   (Port 8081)     │
└───────────────────┘   └─────────┬─────────┘   └───────────────────┘
                                  │
                                  ▼
                        ┌───────────────────┐   ┌───────────────────┐
                        │   Python Gateway  │◄──┤  Telegram Bot &   │
                        │    (Port 8082)    │   │    Discord Bot    │
                        └───────────────────┘   └───────────────────┘
```

### Stack Components:
1. **Frontend**: React, TypeScript, Vite, Tailwind CSS, Leaflet Maps, and Framer Motion.
2. **Core API Backend**: Spring Boot, Java 21, Hibernate/JPA, and PostgreSQL.
3. **Go Chatbot Engine**: Go microservice performing spelling correction (Levenshtein Distance) and BM25 ranking queries.
4. **Python Bot Gateway**: FastAPI HTTP listener interfacing with Telegram and Discord bot APIs.

---

## ⚙️ Service Ports & Deployments

| Component | Dev Port | Production Port | Daemon Service | Description |
| :--- | :---: | :---: | :---: | :--- |
| **React App** | `5173` | `80` / `443` | `nginx` | Frontend web client |
| **Spring Boot API** | `8085` | `8085` | `springboot` | Core business logic & database API |
| **Go Chatbot API** | `8081` | `8081` | `chatbot` | Keyword lookup & campus Q&A engine |
| **Python Bot Server** | `8082` | `8082` | `telegram-bot` | Telegram/Discord webhook router |
| **PostgreSQL Database** | `5432` | `5432` | `postgresql` | Primary database cluster |

---

## 📑 Feature Documentation Directories

For full functional breakdowns, REST API schemas, and technical setup guides for each platform feature, refer to the guides inside [docs/features/](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features):

- 📚 **[Academic Resources Sync](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features/academic_resources.md)**: Syncs static uploads on the VPS directly to database catalog endpoints.
- 🛠️ **[Interactive Student Toolkit](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features/student_toolkit.md)**: Contains SGPA/CGPA formulas and college internal marks calculation algorithms.
- 🚌 **[Live Bus GPS Tracking](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features/live_bus_tracking.md)**: Renders live bus coordinates with custom Leaflet overlays and static JSON fail-safes.
- 🤖 **[AI Chatbot Microservice](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features/ai_chatbot_engine.md)**: Custom Go BM25 NLP search engine and spelling correction pipeline details.
- 💬 **[Moderated Q&A Forum](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features/community_qa_forum.md)**: Moderation workflow linking student web queries with Telegram Senior Helper channels.
- 🤝 **[Developer Collab Hub](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features/developer_collab_hub.md)**: Project listings filtered by RIT subdomains and linked with Telegram/Discord bot accept/decline callback requests.
- 🏆 **[LeetCode Leaderboard](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features/leetcode_leaderboard.md)**: LeetCode GraphQL polling details using spaced request queues to avoid rate limit bans.
- 🗺️ **[Interactive Campus Blueprint](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features/campus_map.md)**: Percentage-based blueprint vector coordinates system.
- 👩‍🏫 **[Faculty Directory](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features/faculty_directory.md)**: Unified campus-wide search and sorting directories for RIT professors.
- 🏆 **[Clubs & Centers Explorer](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features/campus_events.md)**: Extracurricular search matching tool with a built-in interest matching quiz.
- 🚀 **[RAISE Incubator Landing](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features/raise_incubator.md)**: Startup slot pitch reservation system.
- 🔑 **[Admin Panel & Service Watchdog](file:///c:/Users/deves/OneDrive/project_main/Freshers-Hub/docs/features/admin_dashboard.md)**: Operations watchdog script, notification lists, and system health status pipelines.

---

## 🛠️ Verification & Building

To verify that the system compiles successfully after local configurations:

1. **Verify Frontend Build**:
   ```bash
   npm run build
   ```
2. **Verify Java Backend Compilation**:
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```
3. **Verify Go Microservice Compilation**:
   ```bash
   cd chatbot-service
   go build -o chatbot
   ```
