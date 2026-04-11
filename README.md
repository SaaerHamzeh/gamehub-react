# GameHub - Premium Gaming Center UI

This is the frontend component of the GameHub Mini-ERP system. It features a modern, responsive dashboard built with React and Tailwind CSS, now fully integrated with a server-authoritative Django backend.

## Key Enhancements

- **Backend Integration**: Completely swapped `localStorage` for a live Django API using `axios`.
- **Enhanced Security**: Implemented a secure Login system using Username/Password with DRF Token Authentication.
- **Real-Time Accuracy**: All session calculations (costs, durations) are now driven by server-side logic, ensuring 100% financial integrity.
- **Bulk Sync**: Retains the user-friendly "Save All" settings flow while persisting data to a remote database.

## Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd gamehub-react
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API Endpoint**:
   Ensure `axios.defaults.baseURL` in `src/context/AppContext.jsx` points to your running Django server (default: `http://127.0.0.1:8000/api`).

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## Development

- **Stack**: React, Vite, Tailwind CSS, Axios.
- **Context API**: Centralized state management for sessions, devices, and authentication.

---
Part of the GameHub ERP Suite.
