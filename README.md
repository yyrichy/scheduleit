# UMD Course Scheduler

# Notes for team

## Done/Mostly Working
- Create a vector database system to store and search through course information
- Implement a search function that returns relevant courses based on user queries

## Issues/To Do
- User adding already taken classes
- User adding currently planned classes
- UI showing time conflicts and other info
- Friend schedules


## Info

Fetches course data from UMD.io and PlanetTerp APIs and stores in a vector database/json.
Creates embeddings of course descriptions using HuggingFace's sentence transformers.
Stores in vector stores for similarity search later.
> npm run train

Run website locally
> npm run dev

## How It Works

### Vector Database System
Our course recommendation system uses FAISS (Facebook AI Similarity Search) to create and search through vector embeddings of course information. Here's how it works:

1. **Data Collection**
   - Fetches UMD Computer Science course data from UMD.io API
   - Collects course information including descriptions, prerequisites, and sections
   - Retrieves grade data from PlanetTerp API

2. **Vector Embeddings**
   - Converts course information into numerical vectors using HuggingFace's sentence transformers
   - Each course becomes a high-dimensional vector that captures its semantic meaning
   - Similar courses will have similar vector representations

3. **FAISS Vector Store**
   - Stores these vectors in a FAISS database
   - Enables extremely fast similarity searches
   - Can find the most relevant courses based on natural language queries

4. **Search Process**
   - User inputs a natural language query (e.g., "programming courses with data structures")
   - Query is converted into the same vector space as the courses
   - FAISS finds the most similar course vectors to the query vector
   - Returns the top matching courses

### Example Usage
When you search for courses:
1. Your search query is converted to a vector
2. The system finds courses with similar vectors
3. Results are ranked by similarity
4. You get course recommendations that semantically match your query

### Technical Stack
- FAISS for vector storage and similarity search
- HuggingFace's sentence transformers for embeddings
- Next.js for the web interface
- UMD.io and PlanetTerp APIs for course data
