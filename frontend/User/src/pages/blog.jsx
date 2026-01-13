import React from "react";
import { Link } from "react-router-dom";
import "../styles/blog.css";
import Footer from "../components/Footer.jsx";

const BLOGS = [
  {
    id: 1,
    category: "INSIGHTS",
    title: "Crypto Forgets Where Reality Lies",
    description:
      "Files, Tokens, and the Structural Mistake Behind Blockchains. Every system begins by resolving...",
  },
  {
    id: 2,
    category: "TUTORIAL",
    title: "How to Build a Data Feed Platform",
    description:
      "Leveraging x402 and Pinata recently released our x402 implementation that lets...",
  },
  {
    id: 3,
    category: "CASE STUDY",
    title: "How Edge & Node Cut Engineering Hours by 80%",
    description:
      "By migrating to Pinata, engineers spent less time maintaining infrastructure...",
  },
  {
    id: 4,
    category: "GUIDE",
    title: "Understanding Web3 Infrastructure",
    description:
      "A comprehensive guide to building scalable Web3 applications with modern tooling...",
  },
  {
    id: 5,
    category: "RESEARCH",
    title: "The Future of Decentralized Storage",
    description:
      "Exploring the latest advancements in IPFS and decentralized content delivery networks...",
  },
  {
    id: 6,
    category: "INSIGHTS",
    title: "API Design Best Practices",
    description:
      "Learn how to design APIs that scale, from REST to GraphQL implementations...",
  },
];

export default function BlogPage() {
  return (
    <div className="blog-page">
      {/* Search */}
      <div className="blog-search">
        <input placeholder="Search blogs..." />
        <button>Join Community</button>
      </div>

      {/* Tabs */}
      <div className="blog-tabs">
        <span className="active">For you</span>
        <span>Featured</span>
      </div>

      {/* Header */}
      <div className="blog-heading">
        <h1>For you</h1>
        <p>Personalized blog posts curated for you</p>
      </div>

      {/* Blog Cards */}
      <div className="blog-grid">
        {BLOGS.map((blog) => (
          <div key={blog.id} className="blog-card">
            <div className="blog-image" />

            <div className="blog-content">
              <span className="blog-category">{blog.category}</span>
              <h3>{blog.title}</h3>
              <p>{blog.description}</p>

              <Link to={`/blog/${blog.id}`} className="read-more">
                Read more <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}