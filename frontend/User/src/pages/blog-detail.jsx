import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/blog-detail.css";


const BLOG_CONTENT = {
  1: {
    title: "Crypto Forgets Where Reality Lies",
    category: "INSIGHTS",
    author: "Alex Chen",
    date: "Jan 8, 2026",
    imageUrl: "/purple-crypto-header.jpg",
    content: `
# The Structural Problem in Blockchain Architecture

Every system begins by resolving fundamental questions about how it stores and manages data.

## Files, Tokens, and Structures

The confusion in many blockchain implementations stems from conflating files, tokens, and structure.

## The Reality Check

Blockchain systems must first be systems.

## Building Better Foundations

Forget hype. Remember fundamentals.
    `,
  },
  2: {
    title: "How to Build a Data Feed Platform",
    category: "TUTORIAL",
    author: "Sarah Mitchell",
    date: "Jan 5, 2026",
    imageUrl: "/orange-data-feed.jpg",
    content: `
# Building Scalable Data Feed Platforms

Modern applications require real-time data feeds.

## Architecture Overview

Ingestion → Processing → Distribution.

## Scaling Considerations

Redundancy, caching, and smart batching.
    `,
  },
  // others remain same
};

export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const blog = BLOG_CONTENT[id];

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog not found</h1>
          <button
            onClick={() => navigate("/blog")}
            className="text-blue-600 underline"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white"
          >
            <ArrowLeft size={18} />
            Back to Blog
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div
          className="w-full h-96 rounded-xl mb-8 bg-cover bg-center"
          style={{ backgroundImage: `url(${blog.imageUrl})` }}
        />

        <div className="mb-8">
          <div className="flex gap-3 text-sm mb-3">
            <span className="font-bold">{blog.category}</span>
            <span>{blog.date}</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">{blog.title}</h1>
          <p className="text-gray-500">By {blog.author}</p>
        </div>

        <article className="space-y-6 leading-relaxed">
          {blog.content.split("\n\n").map((block, i) => {
            if (block.startsWith("# ")) {
              return <h2 key={i} className="text-2xl font-bold">{block.replace("# ", "")}</h2>;
            }
            if (block.startsWith("## ")) {
              return <h3 key={i} className="text-xl font-semibold">{block.replace("## ", "")}</h3>;
            }
            return <p key={i}>{block}</p>;
          })}
        </article>
      </main>
    </div>
  );
}