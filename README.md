# UMD Course Scheduler

### Plan smarter. Schedule faster.

## Table of Contents
- [Inspiration](#inspiration)
- [What It Does](#what-it-does)
- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Current Progress](#current-progress)
- [Challenges](#challenges)
- [What's Next](#whats-next)
- [Run Locally](#run-locally)

---

## Inspiration

As students at UMD, we were frustrated with how difficult it was to plan future semesters, especially with the advisor-to-student ratio. Whether it was finding courses that align with our interests, avoiding time conflicts, or syncing with friends, existing tools just didn’t cut it. So we built one.

---

## What It Does

UMD Course Scheduler helps students:
- Find relevant courses using natural language queries (e.g., "programming courses with data structures")
- Visualize time conflicts
- Track planned and taken classes
- Compare with friends' schedules *(coming soon!)*

---

## How It Works

### 🧠 Vector-Based Search

1. **Data Collection**
   - Course data from **UMD.io**
   - Grade distributions and reviews from **PlanetTerp**

2. **Embedding Generation**
   - HuggingFace’s `sentence-transformers` converts course descriptions into high-dimensional vectors

3. **Search with FAISS**
   - Vectors are stored in a **FAISS** index for fast similarity search
   - A natural language query is also embedded and compared against stored vectors to find semantically relevant courses

---

## Features

- 🔍 Natural language course search
- 📈 Integration with real-time UMD/PlanetTerp APIs
- 🧠 Smart recommendations using embeddings
- 📅 UI coming soon for:
  - Class planning
  - Conflict detection
  - Friend schedule comparison

---

## Tech Stack

- **Next.js** – frontend framework  
- **FAISS** – fast similarity search  
- **HuggingFace Transformers** – semantic embeddings  
- **UMD.io** & **PlanetTerp API** – real course and review data  
- **Node.js** – backend logic  

---

## Current Progress

### ✅ Done / Mostly Working
- Create a vector database system to store and search through course information
- Implement a search function that returns relevant courses based on user queries

### 🛠️ For Team: To Do/Issues
- Add UI components for:
  - Adding “taken” and “planned” courses
  - Time conflict detection
  - Friend schedule comparisons
 
- User adding already taken classes
- User adding currently planned classes
- UI showing time conflicts and other info
- Friend schedules

---

## Challenges

- Creating an intuitive search from plain text queries  
- Designing the embedding and similarity system from scratch  
- Integrating multiple APIs with different formats  
- Building this while learning new frameworks

---

## What's Next

We’re currently working on:
-

We’d also love to implement:
-

---

## Run Locally

Stores in vector stores for similarity search later.
> npm run train

Run website locally
> npm run dev
