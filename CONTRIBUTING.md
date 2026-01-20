# Contributing to City Bus Tracker

Thank you for your interest in contributing to the City Bus Tracker project!

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/city_bus_tracker.git
   cd city_bus_tracker
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your Oracle credentials
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   ```

## 📋 Development Workflow

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Backend code goes in `backend/src/`
   - Frontend code goes in `frontend/src/`
   - Database migrations go in `oracle/migrations/`

3. **Test your changes**
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

## 📝 Code Standards

### Backend (TypeScript/Node.js)
- Use TypeScript for all new code
- Follow existing code structure
- Add error handling for all API endpoints
- Use async/await for asynchronous operations

### Frontend (React/TypeScript)
- Use functional components with hooks
- Follow existing component structure
- Use TypeScript for type safety
- Keep components focused and reusable

### Database
- Place all SQL scripts in `oracle/migrations/`
- Follow naming convention: `YYYYMMDD_description.sql`
- Test migrations before committing

## 🐛 Reporting Bugs

Please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 💡 Feature Requests

We welcome feature requests! Please create an issue describing:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
