# 🎓 Student Search Portal — Apache Solr + React

A full-stack web application that demonstrates **real-time search, indexing, and querying** using Apache Solr as the search engine, a Node.js Express proxy server as the backend, and React.js as the frontend.

> **Course:** CS-347 Parallel & Distributed Computing  
> **Lab:** Lab 13 — Open Ended Lab: Indexing, Importing and Searching data in Apache Solr  
> **Institution:** Faculty of Computing  

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Dataset](#dataset)
- [Solr Configuration](#solr-configuration)
- [Search Queries](#search-queries)
- [Project Structure](#project-structure)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project was built as part of an Open-Ended Lab to explore Apache Solr's capabilities for indexing and searching large datasets. It includes:

- **Task 1:** Indexing a student records dataset into Apache Solr and executing various search queries (filtering, sorting, faceting, highlighting, fuzzy search, pagination, and stats)
- **Task 2:** A fully functional web-based search interface built with React.js, connected to Solr via a Node.js proxy server

---

## Features

- 🔍 **Full-text search** across all fields
- 🏷️ **Faceted navigation** — filter by department
- ↕️ **Sorting** — by GPA (high/low) and Name (A-Z)
- 📄 **Pagination** — 3 results per page with page number buttons
- ✨ **Highlighted search terms** in results
- 📊 **GPA progress bar** with color coding (Excellent / Good / Below Average)
- ❌ **Clear search** button to reset results
- 📱 **Responsive UI** built with plain CSS

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                         │
│              http://localhost:3000                       │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              React Frontend                      │   │
│   │   - Search Bar      - Facet Filters             │   │
│   │   - Sort Dropdown   - Pagination                │   │
│   │   - Results Grid    - GPA Progress Bars         │   │
│   └──────────────────────┬──────────────────────────┘   │
└─────────────────────────-│───────────────────────────── ┘
                           │ HTTP Request
                           ▼
┌──────────────────────────────────────────────────────────┐
│              Node.js Express Proxy Server                │
│                  http://localhost:4000                    │
│                                                          │
│   - Handles CORS (Cross-Origin Resource Sharing)         │
│   - Forwards /solr/* requests to Solr                    │
│   - Returns Solr JSON response to React                  │
└──────────────────────────┬───────────────────────────────┘
                           │ Forwards Request
                           ▼
┌──────────────────────────────────────────────────────────┐
│                  Apache Solr 10.0.0                      │
│                  http://localhost:8983                    │
│                                                          │
│   Collection: students                                   │
│   ┌────────────────────────────────────────────────┐     │
│   │  Indexed Fields:                               │     │
│   │  id | name | age | department | gpa | city     │     │
│   └────────────────────────────────────────────────┘     │
│                                                          │
│   ZooKeeper (SolrCloud): localhost:9983                  │
└──────────────────────────────────────────────────────────┘
```

**Why a Proxy Server?**
Browsers block direct requests from `localhost:3000` (React) to `localhost:8983` (Solr) due to CORS policy. The Node.js proxy at port 4000 sits in between, forwarding requests to Solr and returning the response to React — bypassing the CORS restriction.

> **Note for macOS users:** Port 5000 is reserved by Apple AirPlay. Always use port 4000 for the proxy.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Search Engine | Apache Solr | 10.0.0 |
| Frontend | React.js | 18+ |
| Proxy Server | Node.js + Express | v22+ |
| Package Manager | npm | 9+ |
| OS Tested | macOS (Apple Silicon) | Sonoma |

---

## Prerequisites

Make sure you have the following installed before proceeding:

### 1. Homebrew (macOS)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Java 17 (Required by Solr)
```bash
brew install openjdk@17
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
java -version
```

### 3. Apache Solr
```bash
brew install solr
```

### 4. Node.js
```bash
brew install node
node --version   # Should be v16+
```

---

## Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/PDC---OEL.git
cd PDC---OEL
```

### Step 2: Start Apache Solr
```bash
solr start
```
Verify Solr is running by visiting: **http://localhost:8983/solr**

### Step 3: Create the Solr Collection
```bash
solr create -c students
```

### Step 4: Configure the Schema
```bash
curl -X POST -H "Content-Type: application/json" \
  http://localhost:8983/solr/students/schema \
  -d '{
    "add-field": [
      {"name":"name","type":"text_general","stored":true},
      {"name":"age","type":"pint","stored":true},
      {"name":"department","type":"string","stored":true,"docValues":true},
      {"name":"gpa","type":"pfloat","stored":true},
      {"name":"city","type":"string","stored":true}
    ]
  }'
```

### Step 5: Index the Dataset
```bash
curl "http://localhost:8983/solr/students/update?commit=true" \
  --data-binary @/full/path/to/students.csv \
  -H "Content-type:application/csv"
```
> ⚠️ Replace `/full/path/to/students.csv` with the actual path. Do not use `~` — curl does not expand it.

Verify indexing:
```
http://localhost:8983/solr/students/select?q=*:*&wt=json
```
You should see `"numFound": 8` in the response.

### Step 6: Install Proxy Server Dependencies
```bash
cd server
npm install
```

### Step 7: Install React Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## Dataset

A custom CSV dataset (`students.csv`) containing 8 student records:

| id | name | age | department | gpa | city |
|---|---|---|---|---|---|
| 1 | Hanzla Kalim | 21 | Computer Science | 3.3 | Faisalabad |
| 2 | Sara Khan | 22 | Software Engineering | 3.5 | Lahore |
| 3 | Ahmed Raza | 20 | Data Science | 3.9 | Islamabad |
| 4 | Fatima Malik | 23 | Computer Science | 3.2 | Karachi |
| 5 | Usman Tariq | 21 | Software Engineering | 3.7 | Peshawar |
| 6 | Zara Sheikh | 22 | Data Science | 3.6 | Quetta |
| 7 | Bilal Ahmad | 24 | Computer Science | 3.1 | Multan |
| 8 | Hina Noor | 20 | Software Engineering | 3.4 | Faisalabad |

---

## Solr Configuration

### Field Types Used

| Field | Solr Type | Purpose |
|---|---|---|
| `text_general` | Tokenized, case-insensitive | Full-text search on name |
| `string` | Exact match | Filtering by department/city |
| `pint` | Integer | Age field |
| `pfloat` | Float | GPA field with range queries |

### Key Solr Concepts Used
- **Core/Collection:** Named `students`, created in SolrCloud mode
- **Schema API:** Used REST API to define fields dynamically
- **DocValues:** Enabled on `department` for faceting support
- **Commit:** `?commit=true` ensures data is immediately searchable after indexing

---

## Search Queries

All queries can be tested directly in the browser:

| Query Type | URL |
|---|---|
| All records | `http://localhost:8983/solr/students/select?q=*:*&wt=json` |
| Search by name | `http://localhost:8983/solr/students/select?q=name:Sara&wt=json` |
| Filter by department | `http://localhost:8983/solr/students/select?q=*:*&fq=department:"Computer Science"&wt=json` |
| GPA above 3.5 | `http://localhost:8983/solr/students/select?q=*:*&fq=gpa:[3.5 TO *]&wt=json` |
| Sort by GPA desc | `http://localhost:8983/solr/students/select?q=*:*&sort=gpa+desc&wt=json` |
| Faceted search | `http://localhost:8983/solr/students/select?q=*:*&facet=true&facet.field=department&wt=json` |
| Highlighted search | `http://localhost:8983/solr/students/select?q=name:Hina&hl=true&hl.fl=name&wt=json` |
| Pagination page 1 | `http://localhost:8983/solr/students/select?q=*:*&rows=3&start=0&wt=json` |
| Fuzzy search | `http://localhost:8983/solr/students/select?q=name:Ahmd~&wt=json` |
| GPA stats | `http://localhost:8983/solr/students/select?q=*:*&stats=true&stats.field=gpa&wt=json` |
| Boolean query | `http://localhost:8983/solr/students/select?q=department:"Computer Science" AND gpa:[3.5 TO *]&wt=json` |
| Exclusion query | `http://localhost:8983/solr/students/select?q=*:*&fq=-department:"Computer Science"&wt=json` |

---

## Project Structure

```
PDC---OEL/
│
├── students.csv              # Dataset used for indexing
│
├── server/                   # Node.js Proxy Server
│   ├── server.js             # Express server (port 4000)
│   ├── package.json
│   └── node_modules/
│
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   └── App.css           # Styling
│   ├── public/
│   ├── package.json
│   └── node_modules/
│
└── README.md
```

---

## Running the Application

You need **3 terminals open simultaneously:**

**Terminal 1 — Start Solr:**
```bash
solr start
```

**Terminal 2 — Start Proxy Server:**
```bash
cd server
node server.js
# You should see: ✅ Proxy running at http://localhost:4000
# Keep this terminal open — do not close it
```

**Terminal 3 — Start React App:**
```bash
cd frontend
npm start
# Browser opens automatically at http://localhost:3000
```

### To Stop Everything
```bash
# Stop Solr
solr stop -all

# Stop proxy and React: press Ctrl+C in their terminals
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `curl: Failed to open ~/Desktop/students.csv` | curl doesn't expand `~` | Use full path: `/Users/yourname/Desktop/students.csv` |
| Proxy exits immediately | `http-proxy-middleware` incompatible with Node v22 | Use custom `fetch`-based Express proxy (already in `server.js`) |
| `PathError` on Express routes | Express v5 doesn't support `/*` wildcards | Use `app.use('/solr', ...)` instead of `app.get` |
| Port 5000 returns HTTP 403 | Apple AirPlay occupies port 5000 on macOS | Use port 4000 for the proxy server |
| React shows 0 students | `SOLR_URL` in App.js pointed to wrong port | Update `SOLR_URL` to `http://localhost:4000/solr/students/select` |
| Solr returns 403 Forbidden | Solr authentication enabled | Remove `security.json` from Solr home directory |

---

## 📄 License

This project was created for academic purposes as part of CS-347 Parallel & Distributed Computing Lab at the Faculty of Computing.
