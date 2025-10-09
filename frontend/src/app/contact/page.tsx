"use client";
import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // For now, just show success message
    // In a real app, you'd send this to your backend
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Message Sent!</h1>
          <p className="text-gray-700 mb-6">
            Thank you for your message. We'll get back to you as soon as possible.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Send Another Message
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      
      <div className="mb-8">
        <p className="text-gray-700 mb-4">
          Have questions about the platform? Want to submit a race or report an issue? 
          We'd love to hear from you!
        </p>
        
        <div className="grid gap-4">
          <div>
            <h3 className="font-semibold">General Inquiries</h3>
            <p className="text-gray-600">For general questions about the platform</p>
          </div>
          <div>
            <h3 className="font-semibold">Race Submissions</h3>
            <p className="text-gray-600">Submit races through the platform or contact us for bulk submissions</p>
          </div>
          <div>
            <h3 className="font-semibold">Technical Support</h3>
            <p className="text-gray-600">Report bugs or request new features</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full border rounded p-2"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border rounded p-2"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text"
            required
            className="w-full border rounded p-2"
            value={form.subject}
            onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            required
            rows={6}
            className="w-full border rounded p-2"
            value={form.message}
            onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
          />
        </div>
        
        {error && <p className="text-red-600">{error}</p>}
        
        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          Send Message
        </button>
      </form>
    </main>
  );
}
