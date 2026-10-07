'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, HelpCircle, ShieldCheck } from 'lucide-react';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Enterprise Sales',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <MessageSquare className="w-3.5 h-3.5 mr-1" /> Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight theme-text">
          Contact Camzy Jobs Enterprise Support
        </h1>
        <p className="text-xs sm:text-sm theme-muted leading-relaxed">
          Have questions about company onboarding, recruiter seat billing, custom branding, or candidate support? Our team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl theme-surface border theme-border space-y-6 shadow-sm">
            <h3 className="text-base font-extrabold theme-text">Contact Information</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold theme-text">Enterprise Support Email</p>
                  <p className="theme-muted">support@camzyjobs.com</p>
                  <p className="theme-muted">sales@camzyjobs.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold theme-text">Phone Support & Sales</p>
                  <p className="theme-muted">+1 (800) 555-CAMZY</p>
                  <p className="text-[11px] theme-muted">Mon-Fri: 9am - 6pm EST</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold theme-text">Global Headquarters</p>
                  <p className="theme-muted">500 Howard Street, Suite 400</p>
                  <p className="theme-muted">San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-500/20 space-y-2 text-xs">
            <p className="font-extrabold theme-text flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Enterprise SLA Guarantee
            </p>
            <p className="theme-muted leading-relaxed">
              Enterprise customer inquiries receive priority response within 2 business hours.
            </p>
          </div>
        </div>

        {/* Contact Inquiry Form */}
        <div className="lg:col-span-2 p-8 rounded-2xl theme-surface border theme-border shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold theme-text">Send Us a Direct Message</h2>
            <p className="text-xs theme-muted">Fill out the form below and an enterprise representative will contact you.</p>
          </div>

          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h3 className="text-xl font-bold theme-text">Message Received!</h3>
              <p className="text-xs theme-muted max-w-md mx-auto">
                Thank you for reaching out to Camzy Jobs. A support executive has been assigned to your ticket.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold theme-text uppercase tracking-wider mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold theme-text uppercase tracking-wider mb-1.5">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold theme-text uppercase tracking-wider mb-1.5">Inquiry Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Enterprise Sales">Enterprise Sales & Pricing Plans</option>
                  <option value="Company Verification">Company Tax ID & Tenant Verification</option>
                  <option value="Candidate Support">Candidate Application Support</option>
                  <option value="Technical Issue">Technical Support & API Integration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold theme-text uppercase tracking-wider mb-1.5">Message Details *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe your inquiry or requirement..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
