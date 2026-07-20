# Jharokha Artisan Marketplaces


A customized marketplace platform for local artisans to showcase and sell their products.

## Project Structure

This workspace is divided into two main components:
- **`backend/`**: A FastAPI application powered by SQLModel and SQLite.
- **`frontend/`**: A Next.js (React) application styled with Tailwind CSS.

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+

### Running the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment and start the development server:
   ```bash
   source .venv/bin/activate
   uvicorn main:app --port 8000 --reload
   ```

### Running the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
