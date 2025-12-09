# collab-editor

A real-time collaborative document editor built with React, Node.js, and Socket.io.

## Features

- **Real-time Collaboration**: Multiple users can edit the same document simultaneously.
- **Live Presence**: See who is currently viewing the document.
- **Access Control**: Private documents with Invite-only access (Admin, Editor, Viewer roles).
- **Responsive Design**: Optimized for desktop, tablet, and mobile.
- **Clean UI**: Paper-like editing experience with a focus on content.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Quill.js
- **Backend**: Node.js, Express, Socket.io
- **Storage**: In-memory (for demo purposes)

## Getting Started

### Prerequisites

- Node.js installed

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd collab-editor
    ```

2.  **Setup Backend**
    ```bash
    cd server
    npm install
    npm start
    ```
    The server will run on `http://localhost:5000`.

3.  **Setup Frontend**
    ```bash
    cd client
    npm install
    npm run dev
    ```
    The application will run on `http://localhost:5173`.

## Usage

1.  Open the application in your browser.
2.  Enter your email to login.
3.  Create a new document or open an existing one.
4.  Share the link or invite others via email to collaborate!
