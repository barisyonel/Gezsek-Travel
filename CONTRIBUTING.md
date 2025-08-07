# 🤝 Contributing to Gezsek Travel

We love your input! We want to make contributing to Gezsek Travel as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### 1. Fork & Clone
```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/yourusername/gezsek-travel.git
cd gezsek-travel

# Add upstream remote
git remote add upstream https://github.com/originaluser/gezsek-travel.git
```

### 2. Set Up Development Environment
```bash
# Backend setup
cd backend
npm install
cp .env.example .env  # Configure your environment variables
node create-test-user.js  # Create test users

# Frontend setup
cd ../frontend
npm install
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 📝 Pull Request Process

### Before Submitting
- [ ] Code follows the existing style
- [ ] Tests pass (if applicable)
- [ ] Documentation is updated
- [ ] Commit messages are clear

### PR Guidelines
1. **Title**: Use clear, descriptive titles
   - ✅ `Add real-time notification system`
   - ❌ `Fix stuff`

2. **Description**: Include:
   - What changes were made
   - Why the changes were needed
   - How to test the changes
   - Screenshots (if UI changes)

3. **Size**: Keep PRs focused and reasonably sized
   - Prefer multiple small PRs over one large PR
   - Each PR should address one feature/fix

### PR Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested this change locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
```

## 🐛 Bug Reports

### Before Reporting
1. **Search existing issues** to avoid duplicates
2. **Update to latest version** to see if it's already fixed
3. **Check documentation** to ensure it's not expected behavior

### Bug Report Template
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS, Windows, Linux]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]
 - Node.js version
 - npm version

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 🎨 Code Style Guidelines

### JavaScript/React
- Use **ES6+** features
- Use **functional components** with hooks
- Use **arrow functions** for consistency
- Use **camelCase** for variables and functions
- Use **PascalCase** for components
- Use **UPPER_SNAKE_CASE** for constants

### Code Formatting
```javascript
// ✅ Good
const fetchUserData = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// ❌ Bad
function fetchUserData(userId){
    return api.get('/users/'+userId).then(response=>{
        return response.data
    }).catch(error=>{
        console.log(error)
        throw error
    })
}
```

### CSS Guidelines
- Use **CSS custom properties** for theming
- Use **BEM methodology** for class naming
- Use **mobile-first** responsive design
- Prefer **Flexbox/Grid** over floats

```css
/* ✅ Good */
.message-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.message-container__header {
  padding: var(--spacing-sm);
  background-color: var(--color-primary);
}

/* ❌ Bad */
.messageContainer {
  display: block;
  padding: 10px;
}
```

### Backend Guidelines
- Use **async/await** instead of callbacks
- Use **try/catch** for error handling
- Use **middleware** for common functionality
- Use **validation** for all inputs
- Use **meaningful variable names**

```javascript
// ✅ Good
const createTour = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    
    // Validation
    if (!title || !description || !price) {
      return res.status(400).json({ 
        message: 'Title, description, and price are required' 
      });
    }
    
    const tour = new Tour({ title, description, price });
    await tour.save();
    
    res.status(201).json({ 
      message: 'Tour created successfully', 
      data: tour 
    });
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
```

## 📁 Project Structure

### Adding New Features

#### Backend
```
backend/
├── models/          # Add new Mongoose models
├── routes/          # Add new API routes
├── middleware/      # Add new middleware
├── services/        # Add business logic
└── utils/           # Add utility functions
```

#### Frontend
```
frontend/src/
├── components/      # Add new React components
│   ├── common/      # Shared components
│   ├── admin/       # Admin-specific components
│   └── user/        # User-specific components
├── hooks/           # Custom React hooks
├── services/        # API service functions
├── context/         # React Context providers
└── utils/           # Utility functions
```

## 🧪 Testing Guidelines

### Writing Tests
- Write tests for new features
- Update tests when modifying existing code
- Use descriptive test names
- Test both success and error cases

### Test Structure
```javascript
describe('User Authentication', () => {
  describe('POST /api/auth/login', () => {
    it('should return token for valid credentials', async () => {
      // Test implementation
    });
    
    it('should return error for invalid credentials', async () => {
      // Test implementation
    });
  });
});
```

## 📚 Documentation

### Code Comments
- Comment **why**, not **what**
- Use JSDoc for functions
- Keep comments up-to-date

```javascript
/**
 * Creates a new conversation ID between user and admin
 * @param {string} userId - The user's ObjectId
 * @param {string} adminId - The admin's ObjectId
 * @returns {string} Formatted conversation ID
 */
const createConversationId = (userId, adminId) => {
  const ids = [userId.toString(), adminId.toString()].sort();
  return `conv_${ids.join('_')}`;
};
```

### README Updates
- Update README.md for new features
- Include usage examples
- Update API documentation

## 🚀 Release Process

### Version Numbering
We use [Semantic Versioning](http://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version number bumped
- [ ] Git tag created

## 🏷️ Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `documentation` | Improvements to documentation |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention is needed |
| `question` | Further information is requested |
| `wontfix` | This will not be worked on |

## 👥 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community

### Code of Conduct
This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## 🎯 Priority Areas

### High Priority
- **Performance optimizations**
- **Security improvements**
- **Bug fixes**
- **Documentation improvements**

### Medium Priority
- **New features**
- **UI/UX improvements**
- **Test coverage**
- **Code refactoring**

### Low Priority
- **Nice-to-have features**
- **Code style improvements**
- **Minor optimizations**

## 🔧 Development Tools

### Recommended VSCode Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

### Useful Scripts
```bash
# Backend
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm test            # Run tests

# Frontend
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## ❓ Getting Help

### Where to Ask Questions
1. **GitHub Discussions** - General questions and discussions
2. **GitHub Issues** - Bug reports and feature requests
3. **Code Reviews** - Ask for feedback on your PRs
4. **Documentation** - Check README and code comments first

### Response Times
- **Issues**: We aim to respond within 48 hours
- **PRs**: We aim to review within 1 week
- **Questions**: We aim to respond within 24 hours

## 🙏 Recognition

### Contributors
All contributors will be:
- Listed in the README.md
- Mentioned in release notes
- Invited to be maintainers (for significant contributions)

### Types of Contributions
- **Code**: New features, bug fixes, optimizations
- **Documentation**: README, comments, tutorials
- **Testing**: Writing tests, reporting bugs
- **Design**: UI/UX improvements, assets
- **Community**: Helping others, moderation

---

## 📞 Contact

- **Project Maintainer**: [Your Name](mailto:your.email@example.com)
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/gezsek-travel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gezsek-travel/discussions)

---

**Thank you for contributing to Gezsek Travel! 🎉**