
"use client";

import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Contact Form:", formData);

    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <section
      id="contact"
      className="bg-[#F8F8F1] px-6 py-20 md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-14">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gray-500">
            Get In Touch
          </p>

          <h2 className="text-4xl font-semibold tracking-tight text-black md:text-5xl">
            Contact Time Aura
          </h2>

          <p className="mt-4 max-w-xl text-gray-600">
            Have a question about our watches or your order?
            We would love to hear from you.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-14 lg:grid-cols-2">

          {/* Contact Information */}
          <div className="space-y-8">

            {/* Email */}
            <div className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-black">
                <Mail size={20} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-black">
                  Email
                </h3>

                <p className="mt-1 text-gray-600">
                  support@timeaura.com
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-black">
                <Phone size={20} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-black">
                  Phone
                </h3>

                <p className="mt-1 text-gray-600">
                  +91 98765 43210
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-black">
                <MapPin size={20} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-black">
                  Address
                </h3>

                <p className="mt-1 max-w-sm text-gray-600">
                  Time Aura Studio,
                  <br />
                  Kochi, Kerala, India
                </p>
              </div>
            </div>

          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-black"
              >
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-black"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
                required
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-black"
              >
                Message
              </label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                rows={5}
                required
                className="w-full resize-none border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group flex items-center gap-3 bg-black px-7 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Send Message

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}
