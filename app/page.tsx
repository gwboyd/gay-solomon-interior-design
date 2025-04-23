import Image from "next/image"
import Link from "next/link"
import { getHomepageSettings, getProjectsWithImages } from "./actions/project"
import type { HomepageSettings } from "@/types/project"
import { artistConfig } from "@/lib/config"

export default async function Home() {
  const homepageSettings = await getHomepageSettings()
  const projects = await getProjectsWithImages()

  // Get the first project's first image as default hero image
  const defaultHeroImage = projects[0]?.images?.[0]?.image_url || "/placeholder.svg?height=800&width=1200"
  // Get the second project's first image as default about image
  const defaultAboutImage = projects[1]?.images?.[0]?.image_url || "/placeholder.svg?height=600&width=800"

  // Use homepage settings images if set, otherwise use defaults
  const heroImage = homepageSettings?.hero_image?.image_url || defaultHeroImage
  const aboutImage = homepageSettings?.about_image?.image_url || defaultAboutImage

  // Get the first three projects by display_order for featured section
  const featuredProjects = projects.slice(0, 3).map(project => ({
    image: project.images?.[0]?.image_url || "/placeholder.svg?height=600&width=800",
    title: project.name,
    location: project.location || "Location TBD"
  }))

  return (
    <>
      <section className="hero-section relative flex items-center">
        <Image
          src={heroImage}
          alt={`Elegant interior design by ${artistConfig.name}`}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container relative z-10">
          <div className="max-w-2xl text-white">
            <h1 className="mb-4">{artistConfig.marketing.tagline}</h1>
            <p className="text-lg md:text-xl mb-8">
              {artistConfig.marketing.subTagline}
            </p>
            <Link
              href="/portfolio"
              className="inline-block px-8 py-3 bg-white text-primary hover:bg-gray-100 transition-colors"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6">Creating spaces that inspire</h2>
              {artistConfig.marketing.aboutDescription.map((paragraph, index) => (
                <p key={index} className={index < artistConfig.marketing.aboutDescription.length - 1 ? "mb-4" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="relative h-[400px]">
              <Image
                src={aboutImage}
                alt="Thoughtfully designed interior space"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-light">
        <div className="container text-center">
          <h2 className="mb-12">Featured Projects</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProjects.map((item, index) => (
              <div key={index}>
                <div className="image-container mb-4">
                  <Image
                    src={item.image}
                    alt={`${item.title} project`}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl mb-2">{item.title}</h3>
                <p className="text-secondary">{item.location}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link
              href="/portfolio"
              className="inline-block px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            >
              View All Projects
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}