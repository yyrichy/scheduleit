# TestudoMatch

### Find your perfect class schedule match at UMD. Generates tailored schedules based on your single text input. Swipe right on courses not people

https://www.youtube.com/watch?v=6bT9nYnErYg

## Table of Contents
- [Inspiration](#inspiration)
- [What it does](#what-it-does)
- [How we built it](#how-we-built-it)
- [Challenges we ran into](#challenges-we-ran-into)
- [Accomplishments that we're proud of](#accomplishments-that-were-proud-of)
- [What we learned](#what-we-learned)
- [What's next for Testudo Match](#whats-next-for-testudo-match)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Run Locally](#run-locally)

---

## Inspiration
We felt like finding the right courses to take as a UMD student was often confusing and frustrating. Reading through the major website, scrolling through the endless prerequisites and requirements. That's why we wanted a tool to help inspire and guide us students on finding the best, tailored schedule for them.

## What it does
Testudo Match is a web application designed to help students at the University of Maryland efficiently plan their class schedules. By leveraging natural language processing, students can input their schedule preferences in plain language, such as "I want machine learning and database classes." The application then processes these inputs with semantic similarity search to generate schedules that students can "swipe" on.

## How we built it
### 🧠 Vector-Based Search
- Data Collection
   
   - Course data from UMD.io
   - Grade distributions and reviews from PlanetTerp
- Embedding Generation
   
   - HuggingFace’s sentence-transformers converts course descriptions into high-dimensional vectors
- Semantic Search with HuggingFace and LangChain
   
   - Course data is serialized and stored, then created into vector embeddings using HuggingFace's transformer and LangChain's MemoryVectorStore for fast similarity search
   - A natural language query is also embedded and compared against stored vectors to find semantically relevant courses. Embeddings contain semantic meaning of course data and query.

- Gemini NLP
  - Gemini used to determine user's major's course level based on text input

## Challenges we ran into
- Creating an intuitive search from plain text queries
- Designing the embedding and similarity system from scratch
- Integrating multiple APIs with different formats
- Cleaning incorrect and malformed API data, mapping complex prerequisites relationships

## Accomplishments that we're proud of
- Successfully implemented the user of vector stores and serializing course data.
- Developed a search function that returns relevant courses based on user queries.
- Generating and ranking best schedules with optimal section times.

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

- 🔍 Natural language course search for suggested courses
- 📈 Integration with real-time UMD/PlanetTerp APIs
- 🧠 Contextual course recommendations using vector store embeddings and similarity search
- Understanding course difficulty and level requests using Gemini
- Ranking courses based on professor ratings and average GPA
- Creating optimal schedules without time conflicts
- Editing schedules and adding/deleting courses
- 📅 UI coming soon for:
  - Class planning
  - Friend schedule comparison

---

## Tech Stack

- **Next.js** – frontend & backend framework  
- **Gemini** - interpreting student's desired course difficulty and course level
- **LangChain MemoryVectorStore** –  perform similarity search and rank courses
- **HuggingFace Sentence Transformers** – converting course description and user query into numerical vecteors
- **UMD.io** & **PlanetTerp API** – real course and review data  
---

## Run Locally

Scrape data from APIs and save data as Hugging Face embeddings in vector stores for searching later.
> npm run train

Run website locally
> npm run dev
