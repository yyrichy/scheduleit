# TestudoMatch

### Find your perfect class schedule match at UMD. Swipe right on courses not people


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
We felt like finding the right courses to take as a UMD student was often confusing and frustrating. Reading through the major website, scrolling through the endless prerequisites and requirements. That's why we wanted a tool to help inspire and guide us students on finding the best, tailored schedule for them.

## What it does
Testudo Match is a website where students can input their schedule wants using natural language (e.g. I want machine learning and database classes), find the most interesting "matches" 

## How we built it
### 🧠 Vector-Based Search
1. Data Collection
   
   - Course data from UMD.io
   - Grade distributions and reviews from PlanetTerp
2. Embedding Generation
   
   - HuggingFace’s sentence-transformers converts course descriptions into high-dimensional vectors
3. Search with FAISS
   
   - Vectors are stored in a FAISS index for fast similarity search
   - A natural language query is also embedded and compared against stored vectors to find semantically relevant courses

## Challenges we ran into
- Creating an intuitive search from plain text queries
- Designing the embedding and similarity system from scratch
- Integrating multiple APIs with different formats
- Building this while learning new frameworks

## Accomplishments that we're proud of
- Successfully implemented a vector database system to store and search through course information.
- Developed a search function that returns relevant courses based on user queries.

## What we learned
- How to effectively use embeddings for semantic search.
- The intricacies of integrating multiple APIs.
- The importance of designing user-friendly interfaces.

## What's next for Testudo Match 
- Add UI components for:
- Adding “taken” and “planned” courses
- Time conflict detection
- Friend schedule comparisons
- Enhance the user experience by showing time conflicts and other info.
- Implement features for comparing friend schedules.


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

## Run Locally

Stores in vector stores for similarity search later.
> npm run train

Run website locally
> npm run dev
