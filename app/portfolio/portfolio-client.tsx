"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { smoothScrollTo } from "@/lib/utils/smoothScroll"
import type { Project, ProjectImage } from "@/types/project"

interface PortfolioClientProps {
  initialProjects: Project[]
}

export default function PortfolioClient({ initialProjects }: PortfolioClientProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  
  const openDialog = (project: Project, image: ProjectImage) => {
    setSelectedProject(project)
    setSelectedImage(image)
    setIsDialogOpen(true)
  }
  
  const closeDialog = () => {
    setIsDialogOpen(false)
  }
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDialogOpen) {
        closeDialog()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isDialogOpen])
  
  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isDialogOpen && dialogRef.current && 
          !dialogRef.current.contains(e.target as Node) &&
          e.target !== closeButtonRef.current) {
        closeDialog()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDialogOpen])

  useEffect(() => {
    // Prevent default scroll-to-hash behavior
    if (typeof window !== 'undefined') {
      // Force scroll to top immediately when component mounts
      window.scrollTo(0, 0)
      
      const hash = window.location.hash
      if (hash) {
        const projectId = hash.replace('#', '')
        // Use requestAnimationFrame to ensure we run after browser's layout calculations
        requestAnimationFrame(() => {
          const element = document.getElementById(projectId)
          if (element) {
            smoothScrollTo(element)
          }
        })
      }
    }
  }, [])

  return (
    <>
      <section className="py-16">
        <div className="container">
          <h1 className="text-center mb-12">Portfolio</h1>

          {initialProjects.map((project) => (
            <div key={project.id} id={project.id.toString()} className="mb-16 scroll-mt-24">
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

      {isDialogOpen && selectedProject && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
          <div ref={dialogRef} className="bg-white max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl">{selectedImage.title}</h2>
                <p className="text-secondary">{selectedProject.name}</p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={closeDialog}
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
      )}
    </>
  )
}
