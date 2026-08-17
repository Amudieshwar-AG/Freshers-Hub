# IMS–Nexus Integration & Architecture Guide

---

## 1. How This Simulates the Actual Production Workflow

In the architecture documented in your design files, **Freshers-Hub (Nexus)** is the *Student Experience Layer* running on your VPS, while **IMS** is the *Authoritative System of Record* hosted and managed separately by the college.

### The Real-World Request Flow

```
[Student Browser]
       │
       │ 1. Submits Reg No ("2114251001") + Password ("rit@2026")
       ▼
[Nexus Frontend (React)]
       │
       │ 2. POST /api/v1/ims/auth/login
       ▼
[Nexus Backend (Spring Boot Proxy)]
       │
       │ 3. Secure HTTPS Call with 2 Identities:
       │    • Identity 1 (Application): "X-Nexus-App-Secret: <shared_secret>"
       │    • Identity 2 (Student): Reg No & Password
       ▼
[College Firewall & IMS API Gateway] ◄── [Gate 1: HTTPS & Gate 2: IP Allowlist]
       │
       │ 4. Authenticates credentials against IMS DB
       │ 5. Enforces Scopes (e.g. student.read, timetable.read)
       ▼
[IMS Database (Locked Source of Truth)]
       │
       │ 6. Returns Student Profile, Day Schedule, Room Info
       ▼
[Nexus Backend] ──(Session Cached)──► [Nexus Frontend Dashboard]
```

### What the Mock Layer is Simulating Today

| Production Component | How Our Code Simulates It Locally |
| :--- | :--- |
| **IMS Server & Database** | `MockImsClientImpl.java` holds an in-memory repository of realistic student records (CSE, AI&DS, ECE), timetables, and classroom blocks. |
| **Credential Authentication** | The mock checks Reg No & Password and generates a structured session token (`ims_session_<regNo>_<uuid>`). |
| **Dynamic Timetable Engine** | Calculates current time vs. class slots to determine real-time period status (`COMPLETED`, `ONGOING`, `UPCOMING`). |
| **Security Boundary** | The frontend **never** talks to IMS directly. It always routes through the Nexus backend interface `ImsClient.java`. |

---

## 2. On Deployment: What Actually Changes on Your End?

Because we used the **Strategy / Adapter Pattern**, your application is built so that switching to the live college server requires **zero code rewrites in the frontend, controllers, or database models**.

### Step 1: Switch the Configuration Property
In `backend/src/main/resources/application.properties` (or via Linux environment variables on your VPS):

```properties
# 1. Flip client type from "mock" to "real"
ims.client.type=real

# 2. Provide the live IMS API Gateway URL
ims.base-url=https://api.ims.ritchennai.edu.in

# 3. Provide the shared secret given to you by the college IMS team
ims.api-key=${IMS_CLIENT_SECRET:production_secret_key_here}
```

### Step 2: What Spring Boot Does Automatically
- Spring Boot detects `ims.client.type=real`.
- It deactivates `MockImsClientImpl` and activates `RealImsClientImpl.java`.
- `RealImsClientImpl` starts dispatching live HTTP requests with the required headers (`X-Nexus-App-Secret`, `X-Student-Id`).

### Step 3: Network & Security Setup on the VPS
1. **SSL/TLS**: Ensure your Nexus domain (e.g., `nexus.ritchennai.edu.in`) has an active HTTPS certificate.
2. **Fixed Static IP**: Give your VPS public IP (e.g., `103.xxx.xxx.xxx`) to the college network administrator for IP whitelisting.

---

## 3. What Information Do You Need from the IMS Team?

Since IMS is an independent standalone application managed by a separate team or vendor with no public APIs exposed yet, you need to request the following **4 items** from them:

### 📋 The Integration Checklist

```
+─────────────────────────────────────────────────────────────────────────────+
|                          IMS INTEGRATION CHECKLIST                          |
+───┬──────────────────────────────────┬──────────────────────────────────────+
| 1 | Static IP Whitelisting           | Whitelist your Nexus VPS outbound IP |
| 2 | Application Secret / API Key     | A secure shared secret key / token   |
| 3 | API Endpoint Base URL            | e.g. https://api.ims.college.edu     |
| 4 | API Contract & Response Format   | JSON schema for login & timetable   |
+───┴──────────────────────────────────┴──────────────────────────────────────+
```

---

### Endpoints the IMS Team Needs to Expose for You

You can hand the IMS development team this exact list of endpoints:

#### 1. Student Authentication
- **Endpoint**: `POST /api/v1/auth/student-login`
- **Headers**: `X-Nexus-App-Secret: <your_secret_key>`
- **Request Body**:
  ```json
  {
    "regNumber": "2114251001",
    "password": "student_password"
  }
  ```
- **Response Expected**:
  ```json
  {
    "success": true,
    "token": "ims_jwt_token_here",
    "student": {
      "regNumber": "2114251001",
      "name": "Anbu Kathir",
      "degree": "B.E.",
      "department": "Computer Science & Engineering",
      "year": 1,
      "semester": 2,
      "section": "A",
      "batch": "2025 - 2029"
    }
  }
  ```

#### 2. Student Dashboard / Today's Timetable & Venue
- **Endpoint**: `GET /api/v1/dashboard/me` (or `GET /api/v1/timetable/me?date=YYYY-MM-DD`)
- **Headers**:
  - `X-Nexus-App-Secret: <your_secret_key>`
  - `X-Student-Id: 2114251001` (or `Authorization: Bearer <token>`)
- **Response Expected**:
  ```json
  {
    "classLocation": {
      "roomNumber": "LH-204",
      "buildingName": "Dr. APJ Abdul Kalam Academic Block",
      "floor": "2nd Floor",
      "wing": "East Wing",
      "landmark": "Next to CSE Department Library"
    },
    "classIncharge": {
      "name": "Dr. R. Arunkumar",
      "cabin": "APJ Block, Cabin 208-B",
      "email": "arunkumar.r@ritchennai.edu.in"
    },
    "todaySchedule": {
      "dayOfWeek": "MONDAY",
      "periods": [
        {
          "periodNumber": 1,
          "timeSlot": "08:45 AM - 09:40 AM",
          "subjectCode": "CS3201",
          "subjectName": "Data Structures",
          "type": "THEORY",
          "facultyName": "Dr. R. Arunkumar",
          "venue": "LH-204"
        }
      ]
    }
  }
  ```

---

## 4. What If the IMS Team Cannot Provide REST APIs Immediately?

If the IMS team is slow to build custom REST APIs, here are the standard industry workarounds in order of preference:

```
                      ┌────────────────────────────────────────┐
                      │   If REST API is not ready today:      │
                      └───────────────────┬────────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
| Option A:        |            | Option B:        |            | Option C:        |
| Read-Only DB     |            | Automated Nightly|            | LDAP / Active    |
| View / Replica   |            | JSON/CSV Export  |            | Directory Auth   |
| (Direct read of  |            | (Sync timetable  |            | (Single Sign-On  |
| class schedule)  |            | & room data)     |            | integration)     |
└──────────────────┘            └──────────────────┘            └──────────────────┘
```

1. **Option A (Read-Only Database View)**:
   - Ask the database administrator for a **read-only database view** restricted strictly to timetable and room allocation tables. Your backend connects via JDBC read-only credentials.
2. **Option B (Scheduled JSON / CSV Sync)**:
   - The IMS team runs a nightly cron job that dumps timetable/classroom data as an encrypted JSON/CSV file to a private S3 bucket or SFTP server. Your Spring Boot backend parses and caches it every 24 hours.
3. **Option C (LDAP / Active Directory)**:
   - If the college uses Active Directory or LDAP for campus Wi-Fi/portals, students authenticate through LDAP, and timetable structures are matched using department & section mapping.

---

## 5. Ready-to-Send Request Template for the IMS Team

You can copy and email this directly to the college IT / IMS team:

```text
Subject: API Integration Request for Nexus Freshers-Hub Portal

Dear IMS / IT Team,

We are developing the Nexus Student Portal (Freshers-Hub) to provide students with quick access to their daily timetables, classroom venue directions, and academic tools.

To integrate seamlessly with the college IMS without duplicating data, we have implemented a secure server-to-server API client following standard enterprise security practices (IP Allowlisting + Shared Application Secret + Encrypted HTTPS).

Could you please provide us with the following integration details:
1. Staging/Production API Base URL (e.g., https://api.ims.ritchennai.edu.in)
2. Application API Key / Client Secret for the Nexus backend
3. IP Whitelisting for our VPS outbound IP: [INSERT_YOUR_VPS_IP]
4. Endpoints for:
   - POST /api/v1/auth/student-login (Register Number & Password authentication)
   - GET /api/v1/timetable/me (Student's daily schedule & classroom venue)

We have our Spring Boot backend proxy and mock test suites ready to plug into your API contract as soon as endpoints are available.

Thank you,
Nexus Engineering Team
```
