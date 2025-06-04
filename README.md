# Car Marketplace Backend

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)](https://www.mongodb.com/)

## Core Features

### 🚘 Vehicle Management
- CRUD operations for car listings
- Image uploads to Cloudinary
- Advanced search indexing
- Comparison data endpoints

### 🤝 User System
- Seller/Buyer role management
- JWT authentication
- Bcrypt password hashing
- Social media link storage

### 💬 Real-Time Communication
- Socket.IO chat system
- Message history storage
- Notification service

### 🔍 Discovery Features
- Recommendation engine
- Search history tracking
- Wishlist synchronization

## Tech Stack

**Server**  
- Node.js  
- Express  

**Database**  
- MongoDB  

**Real-Time**  
- Socket.IO  

**Security**  
- Bcrypt  
- JWT  

**Media Handling**  
- Cloudinary  
- Multer  

## Core Packages

```json
"dependencies": {
  "express": "^4.x",
  "mongoose": "^7.x",
  "socket.io": "^4.x",
  "bcrypt": "^5.x",
  "jsonwebtoken": "^9.x",
  "cloudinary": "^1.x",
  "multer": "^1.x"
}
