# Matrimony App 💍

A modern web application for finding life partners. This matrimony application allows users to browse profiles, search for compatible matches, and create their own profiles.

## Features

- 📋 Browse profiles of potential life partners
- 🔍 Search and filter profiles by name, location, and gender
- ➕ Create new profiles
- 💻 Clean and responsive UI
- 🚀 Simple REST API backend

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Data Storage**: In-memory (can be extended to use a database)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sachinwalunjb4/matrimony-app.git
cd matrimony-app
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get a specific profile by ID
- `POST /api/profiles` - Create a new profile

## Project Structure

```
matrimony-app/
├── src/
│   └── server/
│       └── index.js        # Express server and API routes
├── public/
│   ├── index.html          # Main HTML page
│   ├── styles.css          # Styling
│   └── app.js              # Frontend JavaScript
├── package.json            # Project dependencies
└── README.md               # This file
```

## Usage

1. **Browse Profiles**: View all available profiles on the main page
2. **Search**: Use the search box to find profiles by name or location
3. **Filter**: Filter profiles by gender using the dropdown
4. **Create Profile**: Fill out the form at the bottom to create your own profile

## Future Enhancements

- Add user authentication
- Implement persistent database storage
- Add profile photos
- Implement matching algorithms
- Add messaging between users
- Email notifications
- Advanced search filters (age range, education level, etc.)

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

