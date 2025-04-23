// Central configuration file for artist/business information

export const artistConfig = {
  // Basic information
  name: "Gay Solomon",
  businessName: "Gay Solomon Interior Design",
  
  // Contact information
  contact: {
    email: "gay.solomon@sbcglobal.net",
    phone: "+1 (214) 521-1933",
  },
  
  // SEO and metadata
  seo: {
    title: "Gay Solomon Interior Design",
    description: "Design for the modern but comfortable home, office, and retreat"
  },
  
  // Marketing content
  marketing: {
    tagline: "Design for the modern but comfortable home, office, and retreat",
    subTagline: "Gay Solomon designs spaces for vacation homes, mountain homes, and urban homes",
    aboutDescription: [
      "With a focus on contemporary, simple, and functional design, Gay Solomon creates interiors that are both beautiful and livable.",
      "Each project is approached with careful consideration of the client's lifestyle, the architecture of the space, and the surrounding environment."
    ],
  },
  
  // Social media links
  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
    houzz: "",
  },
  
  // Site configuration
  siteConfig: {
    copyright: `© ${new Date().getFullYear()} Gay Solomon Interior Design. All rights reserved.`,
    adminRoute: "/admin",
  }
}