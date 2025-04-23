# Gay Solomon Interior Design Website

A website to showcase my grandmother's interior design portfolio. This is a fully-functional design website that can be repurposed for any interior designer, architect, or creative professional who needs to display their work beautifully, but was originally made for her.

## Features

- **Modern, Responsive Design:** Clean layout with a neutral color palette that works beautifully on all devices
- **Portfolio Gallery:** Displays projects in a visually appealing grid with filtering by project type
- **Project Details:** Clickable project images with descriptions and metadata
- **Contact Form:** Simple contact form for potential clients to get in touch
- **Admin Dashboard:** Password-protected admin area for content management
  - Manage portfolio projects and images
  - Upload and organize new images
  - Configure homepage settings with featured projects

## Technology Stack

- **Frontend:** Next.js 15 with React 19, TypeScript
- **Styling:** Tailwind CSS, custom components based on Radix UI primitives
- **Database:** Supabase (PostgreSQL)
- **Image Storage:** Vercel Blob
- **Form Handling:** React Hook Form with Zod validation
- **Deployment:** Configured for Vercel deployment

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- Supabase account for database functionality
- Vercel account for deployment and Blob storage

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gay-solomon-interior-design.git
   cd gay-solomon-interior-design
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the site

### Database Setup

1. Create the necessary tables in your Supabase database using the schema defined in the project
2. Access `/admin` and use your admin password to log in

## Usage

- **Public Site:** Access the main website to view the portfolio and contact information
- **Admin Portal:** Access `/admin` and log in with your password to manage content
- **Portfolio Management:** Add, edit, and remove projects and images through the admin dashboard

## Customization

This project was created for my grandmother but is designed to be easily customizable:

### Artist Configuration

The site has a centralized artist configuration file at `lib/config.ts` that contains all artist-specific information:

```typescript
// Update this file to customize for different artists
export const artistConfig = {
  // Basic information
  name: "Your Name",
  businessName: "Your Business Name",
  
  // Contact information
  contact: {
    email: "your.email@example.com",
    phone: "+1 (123) 456-7890",
  },
  
  // SEO and metadata
  seo: {
    title: "Your Business Name",
    description: "Your business description",
  },
  
  // Marketing content
  marketing: {
    tagline: "Your tagline here",
    subTagline: "Secondary tagline or description",
    aboutDescription: [
      "First paragraph about your business.",
      "Second paragraph with more details."
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
    copyright: `© ${new Date().getFullYear()} Your Business Name. All rights reserved.`,
    adminRoute: "/admin",
  }
}
```

This configuration is used throughout the application, making it easy to adapt the site for different artists without modifying multiple files.

Additional customizations:
- Update the logo, colors, and typography in the relevant CSS files
- Customize the admin dashboard for your specific needs
- Add additional features like testimonials, services pages, or blog functionality

## Deployment

The project is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure the environment variables in the Vercel dashboard
3. Deploy the project

## Project Structure

- `app/` - Next.js app router pages and server components
- `components/` - Reusable UI components
- `lib/` - Utility functions and configuration
- `public/` - Static assets including images
- `types/` - TypeScript type definitions
- `styles/` - Global CSS and styling utilities

## Acknowledgements

- I wrote very little of this code, almost all vibe coded
- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Database by [Supabase](https://supabase.io/)
- Image hosting by [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)