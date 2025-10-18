# Ground Booking Platform - Microservices Architecture

A comprehensive real-time ground booking platform built with Node.js, Express, and MongoDB, enabling ground owners to manage facilities and users to book them seamlessly.

## 📋 Overview

This platform provides a complete solution for ground/facility booking with real-time availability management, merchant onboarding, and user booking capabilities. 
The system is built using a microservices architecture to ensure scalability, maintainability, and separation of concerns.

## 🏗️ Architecture

The application follows a microservices architecture with the following services:

### Core Services

- **Merchant Service** - Authentication and subscription management for facility owners
- **Facility Service** - Ground/facility management, availability, academies, discounts, marketing mails and promo codes
- **User Service** - User authentication and management
- **Booking Service** - Real-time booking creation, verification, and management
- **Notification Service** - File uploads (S3) and real-time notifications

### Gateway Services

- **Browser Gateway Service** - API Gateway for merchant-related services (Merchant + Facility)
- **Mobile Gateway Service** - API Gateway for user-related services (User + Booking)

## ✨ Key Features

### For Merchants (Ground Owners)
- JWT-based authentication and authorization
- Merchant subscription management
- Facility/ground creation and management
- Academy management within facilities
- Flexible timing and slot configuration
- Calendar-based availability management
- Discount and promo code creation (date-specific and slot-specific)
- Marketing tools and analytics
- Real-time booking notifications
- Push notifications for booking updates

### For Users
- JWT and OAuth2 Social authentication
- Location-based facility discovery
- Real-time slot availability checking
- Instant booking with verification
- Booking history and management
- Push notifications for booking updates

### Platform Features
- Real-time availability synchronization
- Automated job scheduling with BullMQ
- File upload and management with S3
- Caching with Redis
- Microservices communication
- Type-safe development with TypeScript

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Caching & Queue**: Redis, BullMQ
- **Authentication**: JWT, OAuth2
- **File Storage**: AWS S3
- **File Upload**: Multer
- **Winston**: Logging
- **Swagger**: DocsAPI

### Development Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky
- **Architecture**: Microservices

## 📦 Service Details

### 1. Merchant Service
- Merchant authentication (JWT)
- Merchant registration and onboarding
- Subscription management
- Profile management

### 2. Facility Service
- Facility/ground CRUD operations
- Facility availability management
- Academy creation and management
- Timing and slot configuration
- Discount and promo code management
- Marketing campaign management
- BullMQ cron jobs for automated tasks
- Redis caching for performance

### 3. User Service
- User authentication (JWT + OAuth2)
- User registration and profile management
- Location-based services
- User preferences

### 4. Booking Service
- Real-time booking creation
- Booking verification and validation
- Slot availability checking
- Booking status management
- Booking history

### 5. Notification Service
- Real-time notifications to merchants and users
- Email/SMS/Push notification support
- S3 integration for file uploads
- Multer for multipart form data handling

### 6. Browser Gateway Service
- Routes requests to Merchant Service
- Routes requests to Facility Service
- Request validation and rate limiting
- Authentication middleware

### 7. Mobile Gateway Service
- Routes requests to User Service
- Routes requests to Booking Service
- Mobile-optimized responses
- Authentication middleware

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Redis
- AWS Account (for S3)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd folder-name
```

2. Install dependencies for all services
```bash
# Install dependencies for each service
cd merchant-service && npm install
cd ../facility-service && npm install
cd ../user-service && npm install
cd ../booking-service && npm install
cd ../notification-service && npm install
cd ../browser-gateway-service && npm install
cd ../mobile-gateway-service && npm install
```

3. Configure environment variables
```bash
# Create .env file in each service directory
# See .env.example in each service for required variables
```

4. Start MongoDB and Redis
```bash
# Start MongoDB
mongod

# Start Redis
redis-server
```

5. Run services
```bash
# Start each service (development mode)
cd merchant-service && npm run dev
cd facility-service && npm run dev
cd user-service && npm run dev
cd booking-service && npm run dev
cd notification-service && npm run dev
cd browser-gateway-service && npm run dev
cd mobile-gateway-service && npm run dev
```

## 🔧 Configuration

Each service requires its own environment configuration. Create a `.env` file in each service directory:

```env
# Common variables
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/service_name
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# AWS S3 (Notification Service)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
S3_BUCKET_NAME=your_bucket_name

# OAuth2 (User Service)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📝 Development Guidelines

### Code Quality
- **TypeScript**: All services use TypeScript for type safety
- **ESLint**: Code linting configured across all services
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for code quality checks

### Running Checks
```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npm run type-check
```

## 🧪 Testing

```bash
# Run tests for a service
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 BullMQ Cron Jobs

The Merchant and Facility services use BullMQ with Redis for scheduled tasks:

- Availability slot generation
- Expired booking cleanup
- Discount validity checking
- Notification scheduling
- Analytics aggregation

## 🔐 Authentication Flow

### Merchant Authentication
1. Merchant registers via Merchant Service
2. JWT token issued upon successful authentication
3. Token validated through Browser Gateway
4. Access to facility management endpoints

### User Authentication
1. User registers via User Service (JWT or OAuth2)
2. Token issued and stored
3. Token validated through Mobile Gateway
4. Access to booking endpoints

## 🌐 API Gateway Pattern

Both gateways implement:
- Request routing to appropriate services
- Authentication middleware
- Rate limiting
- Request/response logging
- Error handling

## 📱 Real-Time Features

- WebSocket connections for live updates
- Real-time slot availability updates
- Instant booking confirmations
- Live notification delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support, email vinaychoudhary2401@gmail.com.

## 🗺️ Roadmap

- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (iOS/Android)
- [ ] AI-based pricing recommendations
- [ ] Multi-language support
- [ ] Reporting and insights

## 📞 Contact

Project Link: [https://github.com/VinayChoudhary24/Real-Time-Ground-Booing-App-Microservices-Architecture]


---

Made with ❤️ by Vinay Choudhary
