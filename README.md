# Real-Time Database with MongoDB and Socket.io

This project demonstrates how to create a real-time database using MongoDB, Node.js, and Socket.io.

## Prerequisites

- Node.js installed
- MongoDB installed or MongoDB Atlas account
- GitHub account

## Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/gauravprajapati23/Realtime-Database.git
   cd Realtime-Database
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file with the following content:
   ```sh
   MONGODB_URI=mongodb+srv://mrrc0923:gaurav0923@cluster0.3v1fp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

4. Create a `Procfile` with the following content:
   ```sh
   web: node index.js
   ```

5. Push changes to GitHub:
   ```sh
   git add .
   git commit -m "Set up GitHub Actions for deployment"
   git push origin main
   ```

6. Access the application:
   - Navigate to the GitHub Pages URL for the `public` directory to see the real-time database.
   - Navigate to `/admin` appended to the URL to access the admin panel.

## Deployment

Deploy your application using GitHub Actions.