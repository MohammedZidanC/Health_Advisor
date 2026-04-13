# Disease Predictor (Health Advisor AI)

A modern, fast web application acting as a medical assistant AI. This project uses the **Google Gemini API** to analyze patient symptoms, suggest possible common conditions, and provide conversational health guidance using natural language processing. 

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd disease_predictor
   ```

2. **Install Node.js Dependencies:**
   Ensure you have Node.js installed, then install server packages:
   ```bash
   npm install
   ```

## Adding your Gemini API Key

This project requires a Google Gemini API Key to function correctly. 

1. Create a `.env` file in the root of your project directory based on the provided `.env.example` file.
2. Add your API key to the `.env` file!

**Example `.env` file:**
```env
GEMINI_API_KEY=your_api_key_here
```

> **Warning:** NEVER commit your `.env` file to version control. It is already safely included in the `.gitignore`.

## Running Locally

To start the application, either use the provided batch script or run it manually:

1. **Quick Start (Windows)**
   ```bash
   start.bat
   ```

2. **Manual Start**
   ```bash
   node server.js
   ```
   *The frontend application will be available at http://localhost:3005*
