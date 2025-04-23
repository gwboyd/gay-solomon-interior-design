"use server"

export async function submitContactForm(formData: FormData) {
  // In a real app, this would send an email or store the message in a database
  const name = formData.get("name")
  const email = formData.get("email")
  const message = formData.get("message")

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return success response
  return {
    success: true,
    message: "Thank you for your message. We will get back to you soon.",
  }
}
