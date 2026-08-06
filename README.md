# 🎓 Scholarship Management System (Jenkins DevOps CI/CD Project)

An end-to-end, full-stack **Scholarship Management System** built with Node.js/Express REST API backend, modern responsive frontend UI, and a complete **Jenkins Declarative Pipeline** (`Jenkinsfile`).

---

## 🌟 Key Features

### 👨‍🎓 Student Portal
- **Interactive Search & Filter**: Search by title, keywords, major, or minimum GPA requirement.
- **Online Application Form**: Input validation ensuring minimum GPA eligibility before submission.
- **Application Status Tracker**: Live status search by Application ID or Email.

### 🛡️ Admin Dashboard
- **Live KPI Metrics**: Total scholarship budget, applicant counts, and approval ratios.
- **Scholarship Management**: Create and publish new scholarship listings instantly.
- **Application Decision Center**: One-click status management (`Approved`, `Under Review`, `Rejected`, `Pending`).

### ⚙️ Jenkins CI/CD Pipeline (`Jenkinsfile`)
- **Declarative Pipeline**: Structured stages for checkout, dependency installation, static code verification, API automated testing (`npm test`), build packaging, and deployment simulation.

---

## 📁 Repository Structure

```
.
├── server.js               # Express REST API & static server
├── public/                 # Frontend Web Application
│   ├── index.html          # HTML5 layout (Student & Admin views)
│   ├── styles.css          # Modern dark glassmorphism design system
│   └── app.js              # Vanilla JS frontend controller & REST integration
├── test/                   # Automated API Test Suite
│   └── api.test.js         # Integration tests for Jenkins execution
├── Jenkinsfile             # Jenkins CI/CD pipeline definition
├── package.json            # Node scripts & dependencies
└── README.md               # Documentation
```

---

## 🚀 Quick Start (Local Setup)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated API Tests (Jenkins Test Command)
```bash
npm test
```

### 3. Start the Server
```bash
npm start
```
Open your browser and navigate to: **`http://localhost:3000`**

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/scholarships` | Fetch scholarships with optional `search`, `category`, and `minGpa` filters |
| `GET` | `/api/scholarships/:id` | Fetch specific scholarship details |
| `POST` | `/api/scholarships` | Create a new scholarship listing (Admin) |
| `GET` | `/api/applications` | Fetch student applications with `status` and `search` filters |
| `POST` | `/api/applications` | Submit a new scholarship application (Student) |
| `PATCH` | `/api/applications/:id` | Update application status (`Approved`, `Rejected`, `Under Review`) |
| `GET` | `/api/stats` | Fetch real-time dashboard KPIs & system statistics |

---

## 🛠️ Setting up in Jenkins

1. Open Jenkins Dashboard -> **New Item**.
2. Enter item name: `Scholarship-Management-System`.
3. Select **Pipeline** project and click **OK**.
4. Scroll to the **Pipeline** section:
   - Select **Pipeline script from SCM**.
   - SCM: **Git**.
   - Repository URL: Path to this Git repository.
   - Script Path: `Jenkinsfile`.
5. Click **Save** and select **Build Now** to execute the CI/CD pipeline.
