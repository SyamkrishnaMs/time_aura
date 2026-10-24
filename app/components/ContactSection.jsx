"use client";

import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
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
      className="bg-white px-6 py-20 md:px-12 lg:px-20 text-black"
    >
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-amber-600">
            Get In Touch
          </p>

          <h2 className="font-serif text-4xl font-bold tracking-tight text-black md:text-5xl">
            Contact Time Aura
          </h2>

          <p className="mt-4 max-w-xl text-gray-600 text-sm md:text-base leading-relaxed font-light">
            Have a question about our watches or your order?
            We would love to hear from you.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-14 lg:grid-cols-2">

          {/* Contact Information */}
          <div className="space-y-6">

            {/* Email */}
            <div className="flex gap-5 rounded-2xl border border-gray-200 bg-[#f9f9f6] p-6 transition-all duration-300 hover:border-amber-500/50 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 shadow-sm">
                <Mail size={20} />
              </div>

              <div>
                <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black">
                  Email
                </h3>

                <p className="mt-1 text-xs text-amber-600 font-semibold">
                  support@timeaura.com
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-5 rounded-2xl border border-gray-200 bg-[#f9f9f6] p-6 transition-all duration-300 hover:border-amber-500/50 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 shadow-sm">
                <Phone size={20} />
              </div>

              <div>
                <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black">
                  Phone
                </h3>

                <p className="mt-1 text-xs text-amber-600 font-semibold">
                  +91 98765 43210
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex gap-5 rounded-2xl border border-gray-200 bg-[#f9f9f6] p-6 transition-all duration-300 hover:border-amber-500/50 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 shadow-sm">
                <MapPin size={20} />
              </div>

              <div>
                <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black">
                  Address
                </h3>

                <p className="mt-1 max-w-sm text-xs text-gray-600 leading-relaxed">
                  Time Aura Studio,
                  <br />
                  Kochi, Kerala, India
                </p>
              </div>
            </div>

          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-[24px] border border-gray-200 bg-[#f9f9f6] p-8 shadow-xl"
          >

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700"
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-amber-600"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700"
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-amber-600"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700"
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
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-amber-600"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-black px-7 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg transition hover:bg-gray-800 active:scale-95"
            >
              Send Message

              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}