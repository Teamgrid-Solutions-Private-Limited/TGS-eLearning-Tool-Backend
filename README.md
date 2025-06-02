# E-Learning Authoring Tool Backend

A robust backend system for an e-learning authoring tool built with Node.js, Express, and MongoDB.

## Features

- JWT-based Authentication & Authorization
- Course Management
- Organization Management
- User Management
- Content Management
- Assessment System
- File Storage Integration
- xAPI Integration
- Email Service

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- Jest for Testing
- Winston for Logging

## Project Structure

```
server/
├── config/                   # Environment/config files
├── api/                     # Feature-based modules
├── middleware/              # Global middleware
├── services/                # Shared business logic
├── utils/                   # Utility functions
├── models/                  # Database models
├── loaders/                 # Application loaders
└── tests/                   # Test files
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory and add your environment variables:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

4. Start the development server:
```bash
npm run dev
```

### Running Tests

```bash
npm test
```

## API Documentation

API documentation will be available at `/api-docs` when the server is running.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 