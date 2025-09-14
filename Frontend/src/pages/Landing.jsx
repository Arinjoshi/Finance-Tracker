import { Link } from "react-router-dom";

const LandingPage = () => {
  const features = [
    { icon: "📊", title: "Track Expenses", desc: "Easily add income & expenses with categories." },
    { icon: "🧾", title: "Upload Receipts", desc: "Scan & store receipts securely in the cloud." },
    { icon: "📈", title: "Reports & Insights", desc: "View spending trends with beautiful charts." },
    { icon: "🔒", title: "Secure & Private", desc: "Your data is encrypted and safe with us." },
  ];

  const testimonials = [
    "This app helped me save 20% more each month! – Priya",
    "The receipt upload is a game-changer. – Rahul",
    "Clean, simple, and effective finance tracking. – Anita",
  ];

  return (
    <div className="landing-page">

      {/* Hero Section */}
      <section className="hero-section">
        <h1>Personal Finance Assistant</h1>
        <h2>Track income, expenses & receipts — all in one place</h2>
        <p>Join thousands of users saving smarter every month.</p>
        
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Us</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      {/* <section className="demo-section">
        <h2>See it in action</h2>
        <p>A quick preview of your personal finance dashboard</p>
        <div className="demo-placeholder">[ Dashboard Screenshot / Demo Image Here ]</div>
      </section>

      <section className="testimonials-section">
        <h2>What users say</h2>
        <div className="testimonials-grid">
          {testimonials.map((quote, index) => (
            <blockquote key={index}>{quote}</blockquote>
          ))}
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to take control of your finances?</h2>
        <p>Start your free trial today and manage your money smarter.</p>

        <div className="cta-buttons">
          <Link to="/signup" className="btn btn-primary">Start Free Trial</Link>
        </div>

        <p className="cta-note">✅ 30-day free trial • ✅ No credit card required • ✅ Cancel anytime</p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <h3>Personal Finance Assistant</h3>
            <p>Transform your financial life with AI-powered insights, smart tracking, and clear analytics.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">API</a></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><a href="#">Careers</a></li>
                <li><Link to="/privacy">Privacy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Personal Finance Assistant. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;


