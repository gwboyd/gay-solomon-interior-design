"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog } from "@/components/ui/dialog"
import type { Project, ProjectImage } from "@/types/project"

interface PortfolioClientProps {
  initialProjects: Project[]
}

export default function PortfolioClient({ initialProjects }: PortfolioClientProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const openDialog = (project: Project, image: ProjectImage) => {
    setSelectedProject(project)
    setSelectedImage(image)
    setIsDialogOpen(true)
  }

  return (
    <>
      <section className="py-16">
        <div className="container">
          <h1 className="text-center mb-12">Portfolio</h1>

          {initialProjects.map((project) => (
            <div key={project.id} className="mb-16">
              <h2 className="text-2xl mb-6">{project.name}</h2>
              {project.description && <p className="mb-8">{project.description}</p>}

              <div className="portfolio-grid">
                {project.images?.map((image) => (
                  <div key={image.id} className="cursor-pointer" onClick={() => openDialog(project, image)}>
                    <div className="image-container mb-3">
                      <Image
                        src={image.image_url || "/placeholder.svg"}
                        alt={image.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-lg mb-1">{image.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedProject && selectedImage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
            <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl">{selectedImage.title}</h2>
                  <p className="text-secondary">{selectedProject.name}</p>
                </div>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="text-secondary hover:text-primary"
                  aria-label="Close dialog"
                >
                  ✕
                </button>
              </div>
              <div className="relative h-[60vh]">
                <Image
                  src={selectedImage.image_url || "/placeholder.svg"}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="mt-6 text-secondary">{selectedImage.description}</p>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}
