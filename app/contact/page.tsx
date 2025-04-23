"use client"

import { useState } from "react"
import { createMessage } from "@/app/actions/message"
import { artistConfig } from "@/lib/config"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createMessage(formData)

      if (result.success) {
        setSubmitted(true)
        setFormData({ name: "", email: "", message: "" })
      } else {
        alert(result.error || "Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("An error occurred while sending your message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-16">
      <div className="container">
        <h1 className="text-center mb-12">Contact</h1>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div>
            <h2 className="text-2xl mb-6">Get in Touch</h2>
            <p className="mb-6">
              Interested in working together? Fill out the form with some information about your project, and I will get
              back to you as soon as possible.
            </p>

            <div className="mb-6">
              <h3 className="text-lg mb-2">Contact Information</h3>
              <p className="mb-1">
                <a href={`mailto:${artistConfig.contact.email}`} className="text-primary hover:underline">
                  {artistConfig.contact.email}
                </a>
              </p>
              <p>
                <a href={`tel:${artistConfig.contact.phone.replace(/\D/g, '')}`} className="text-primary hover:underline">
                  {artistConfig.contact.phone}
                </a>
              </p>
            </div>
          </div>

          <div>
            {submitted ? (
              <div className="max-w-xl">
                <h2 className="text-2xl mb-4">Thank you for your message!</h2>
                <p className="text-gray-600 mb-6">We'll get back to you as soon as possible.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block mb-2 text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}