# TunnelGuard - Tunnel Monitoring System

A comprehensive tunnel monitoring system providing advanced sensor management and intelligent user interfaces for real-time infrastructure safety assessment.

## Features

- Role-based access control and authentication
- Real-time sensor data tracking and visualization
- Responsive and dynamic UI components
- Enhanced user experience with interactive design elements
- Secure system configuration and user management
- Dark mode toggle integration
- Interactive map embeds for tunnel locations
- Guidance display system for traffic officers
- Operations logging system for administrative actions
- Hardware impact monitoring for maintenance planning

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (optional for production environments)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tunnelguard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/tunnelguard
   ```
   
   Note: The application uses in-memory storage by default for development. For production, configure the PostgreSQL database.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup (For Production)

1. If using PostgreSQL, create a database:
   ```sql
   CREATE DATABASE tunnelguard;
   ```

2. The application will automatically set up tables on first run when using the DatabaseStorage provider.

3. To switch from MemStorage to DatabaseStorage, uncomment the relevant line in `server/storage.ts`.

## User Roles

- **Administrator**: Full system access including user management
- **Ministry of Works**: Access to tunnel management, maintenance requests
- **Traffic Department**: Access to barrier control, guidance display systems
- **Public User**: View-only access to tunnel status and alerts

## Default Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin    | Admin123 | Administrator |
| ministry | Work123  | Ministry of Works |
| traffic  | Road123  | Traffic Department |
| public   | View123  | Public User |

## Development Notes

- The application is built using React with TypeScript for the frontend
- Bootstrap 5 is used for styling and responsive components
- Express.js is used for the backend API
- Authentication is handled through Passport.js
- Maps are embedded using iframes for tunnel locations

## Known Issues

- Map iframes don't persist when using in-memory storage after app restarts
- When running the project locally in VS Code, you need to create the `.env` file with DATABASE_URL as mentioned above