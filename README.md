# AmaKart - Modern E-commerce Portfolio Website

A comprehensive e-commerce portfolio website built with modern web technologies to showcase full-stack development skills and best practices.

## 🚀 Project Overview

AmaKart is a demo e-commerce platform inspired by Amazon and Flipkart, designed as a portfolio project to demonstrate modern web development capabilities. The website features a complete shopping experience with user authentication, product management, cart functionality, and a multi-step checkout process.

## ⚠️ Important Disclaimer

**This is a demo portfolio website for educational purposes only.**
- All data, products, and transactions are simulated
- No real commercial activities occur
- No actual products are sold
- All user data is for demonstration purposes only

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Flexbox and Grid
- **JavaScript (ES6+)** - Interactive functionality and DOM manipulation
- **Responsive Design** - Mobile-first approach

### Backend & Services
- **Firebase** - Authentication and database services
- **Firebase Auth** - User authentication and session management
- **Firestore** - NoSQL database for user data and orders
- **Local Storage** - Client-side data persistence

### Security Features
- **TLS/SSL Encryption** - Secure data transmission
- **Data Validation** - Input sanitization and validation
- **Password Hashing** - Secure password storage
- **Rate Limiting** - Protection against abuse
- **XSS Protection** - Cross-site scripting prevention

## 📁 Project Structure

```
amakart-portfolio/
├── styles.css              # Shared CSS styles
├── shared.js               # Common JavaScript functions and Firebase config
├── home.html               # Homepage with carousel and categories
├── home.js                 # Homepage functionality
├── signin.html             # User sign-in page
├── signin.js               # Authentication logic
├── register.html           # User registration page
├── register.js             # Registration functionality
├── forgotpassword.html     # Password reset page
├── forgotpassword.js       # Password reset logic
├── product.html            # Product detail page
├── product.js              # Product display and cart functionality
├── cart.html               # Shopping cart page
├── cart.js                 # Cart management
├── addresses.html          # Address management (checkout step 1)
├── addresses.js            # Address functionality
├── payment.html            # Payment selection (checkout step 2)
├── payment.js              # Payment processing
├── ordersummary.html       # Order confirmation (checkout step 3)
├── ordersummary.js         # Order placement
├── catalog.html            # Product catalog with filtering
├── catalog.js              # Catalog functionality
├── account.html            # User dashboard
├── account.js              # Account management
├── orders.html             # Order history
├── orders.js               # Order management
├── wishlist.html           # User wishlist
├── wishlist.js             # Wishlist functionality
├── about.html              # About page
├── about.js                # About page functionality
├── contact.html            # Contact page
├── contact.js              # Contact form
├── customerservice.html    # Customer service page
├── customerservice.js      # Help and support
└── README.md               # Project documentation
```

## 🎯 Key Features

### E-commerce Functionality
- **Product Catalog** - Dynamic product listing with search and filtering
- **Shopping Cart** - Add/remove items, quantity management
- **Wishlist** - Save products for later
- **Multi-step Checkout** - Address, payment, and order confirmation
- **Order Management** - Order history and tracking

### User Experience
- **Responsive Design** - Works on all devices
- **Modern UI/UX** - Clean, intuitive interface
- **Search Functionality** - Product search across categories
- **Category Filtering** - Filter products by category, price, rating
- **Product Carousel** - Featured products on homepage

### User Management
- **User Registration** - Create new accounts
- **Authentication** - Secure sign-in/sign-out
- **Password Reset** - Forgot password functionality
- **Account Dashboard** - User profile and settings
- **Address Management** - Save multiple shipping addresses

### Security & Best Practices
- **Input Validation** - Client and server-side validation
- **Data Encryption** - Secure data transmission and storage
- **Authentication Security** - Secure user authentication
- **Error Handling** - Comprehensive error management
- **Loading States** - User feedback during operations

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for development)
- Firebase project (for full functionality)

### Installation

1. **Clone or download the project**
   ```bash
   git clone [repository-url]
   cd amakart-portfolio
   ```

2. **Set up Firebase (Optional)**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update Firebase configuration in `shared.js`

3. **Run the project**
   - Open `home.html` in a web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx http-server
     ```

### Demo Credentials
- **Email:** demo@amakart.com
- **Password:** Demo123456

## 📱 Pages Overview

### Core Pages
- **Home** - Landing page with featured products and categories
- **Catalog** - Product listing with search and filters
- **Product Detail** - Individual product information
- **Cart** - Shopping cart management
- **Checkout** - Multi-step order process

### User Pages
- **Sign In** - User authentication
- **Register** - Account creation
- **Account** - User dashboard and settings
- **Orders** - Order history and tracking
- **Wishlist** - Saved products

### Support Pages
- **About** - Project and developer information
- **Contact** - Contact form and information
- **Customer Service** - Help center and FAQ

## 🔧 Customization

### Adding New Products
Edit the `getSampleProducts()` function in `shared.js` to add new products:

```javascript
function getSampleProducts() {
    return [
        {
            id: 1,
            title: "Product Name",
            price: 99.99,
            category: "Category",
            image: "image-url",
            rating: 4.5,
            description: "Product description"
        },
        // ... more products
    ];
}
```

### Styling
- Modify `styles.css` for global styles
- Individual page styles are in `<style>` tags within HTML files
- Uses CSS Grid and Flexbox for responsive layouts

### Firebase Integration
Update the Firebase configuration in `shared.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    // ... other config
};
```

## 🛡️ Security Considerations

### Implemented Security Measures
- **Input Validation** - All user inputs are validated
- **XSS Prevention** - Data sanitization before display
- **CSRF Protection** - Secure form handling
- **Password Requirements** - Strong password policies
- **Rate Limiting** - Protection against abuse
- **Data Encryption** - Sensitive data encryption

### Security Best Practices
- Never store sensitive data in localStorage
- Always validate data on both client and server
- Use HTTPS in production
- Implement proper error handling
- Regular security audits

## 📊 Performance Features

- **Lazy Loading** - Images load as needed
- **Debounced Search** - Optimized search performance
- **Efficient DOM Manipulation** - Minimal reflows and repaints
- **Responsive Images** - Optimized for different screen sizes
- **Caching** - Local storage for better performance

## 🌐 Browser Support

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 📝 Development Notes

### Code Organization
- **Modular JavaScript** - Separate files for each page
- **Shared Functions** - Common functionality in `shared.js`
- **CSS Architecture** - Organized styles with utility classes
- **Responsive Design** - Mobile-first approach

### Future Enhancements
- **PWA Features** - Service workers and offline support
- **Advanced Search** - Elasticsearch integration
- **Payment Gateway** - Real payment processing
- **Admin Panel** - Product and order management
- **API Integration** - External product data

## 🤝 Contributing

This is a portfolio project, but suggestions and improvements are welcome:

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and portfolio purposes. Feel free to use it as a reference for your own projects.

## 👨‍💻 Developer

**Portfolio Developer**
- **Email:** developer@amakart-demo.com
- **LinkedIn:** linkedin.com/in/amakart-developer
- **GitHub:** github.com/amakart-developer

## 🙏 Acknowledgments

- **Design Inspiration** - Amazon, Flipkart, and modern e-commerce platforms
- **Icons** - Unicode emojis and symbols
- **Images** - Placeholder images for demonstration
- **Fonts** - System fonts for optimal performance

---

**Remember:** This is a demo portfolio website. All data is simulated and no real transactions occur. Use it responsibly and for educational purposes only.
