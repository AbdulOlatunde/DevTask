DevTask is a Node.js-based automation agent that integrates with Telex via a Mastra AI agent to process and schedule tasks automatically.  
It listens to incoming task prompts, parses them intelligently, and stores them in MongoDB for future reference running on a Mastra-powered agent.


## Features
-  Parses task instructions and due times using natural language.
-  Integrates with Mastra AI to understand user intent.
-  Schedules and executes reminders using a built-in cron scheduler.
-  Handles Telex webhooks automatically.
-  MongoDB persistence for all created tasks.
-  Admin endpoint to view all saved tasks.

## Setup Instructions

### 1. Clone the Repository

git clone https://github.com/AbdulOlatunde/DevTask

## 2. Install Dependencies
npm install

## 3. Set Up Environment Variables

Create a .env file in your project root and add:

PORT=7000
MONGO_URI=mongodb+srv://olatundeabdullah21:Olatunde23@cluster0.sjoaszq.mongodb.net/?appName=Cluster0
MASTRA_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZWFtSWQiOiJhOWY2ZWNjNS00YTY3LTQ1MTQtYWE4NS0xOTJjN2MwNTEzYjUiLCJwcm9qZWN0SWQiOiJjNjBhODJmYi02ZTA0LTQ1MjQtYjJlNy03ZTg2OWI3ZjRmZDQiLCJ1bmlxdWVJZCI6IjRhNzI4YzBhLTE0ODMtNGQxMC1hNGZlLTlkZTA0MmQ2MjJkNCIsImlhdCI6MTc2MjE2MDM3M30.fFOOC0n6U5BFbzcaEZjCvgmOu0IfzX6r5Po7bdJElvQ