"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Edit2, ArrowUp, ArrowDown, Home, Check, Loader2, Plus, ImagePlus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageUpload } from "@/components/image-upload"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import {
  getProjectsWithImages,
  createProject,
  updateProject,
  deleteProject,
  updateProjectOrder,
  getProjectImages,
  createProjectImage,
  updateProjectImage,
  deleteProjectImage,
  updateProjectImageOrder,
  getHomepageSettings,
  updateHomepageSettings,
} from "@/app/actions/project"
import { getMessages, markMessageAsRead, deleteMessage } from "@/app/actions/message"
import type { Project, ProjectImage, HomepageSettings, Message } from "@/types/project"

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([])
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false)
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)
  const [isEditImageDialogOpen, setIsEditImageDialogOpen] = useState(false)
  const [isNewImageDialogOpen, setIsNewImageDialogOpen] = useState(false)
  const [isHomePageDialogOpen, setIsHomePageDialogOpen] = useState(false)

  // Form states
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState<{
    name: string
    description: string
    location: string
  }>({
    name: "",
    description: "",
    location: "",
  })
  const [editImage, setEditImage] = useState<ProjectImage | null>(null)
  const [newImage, setNewImage] = useState<{
    title: string
    description: string
    project_id: number
  }>({
    title: "",
    description: "",
    project_id: 0,
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("projects")
  const [isSaving, setIsSaving] = useState(false)
  const [selectedHomepageSection, setSelectedHomepageSection] = useState<
    "hero" | "about" | null
  >(null)

  const router = useRouter()

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      // For this demo, we'll use localStorage
      const isAuth = localStorage.getItem("isAdminAuthenticated") === "true"
      setIsAuthenticated(isAuth)

      if (!isAuth) {
        router.push("/admin")
      }
    }

    checkAuth()
  }, [router])

  // Load data
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load projects with images
        const projectsData = await getProjectsWithImages()
        setProjects(projectsData)

        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0])
          setNewImage((prev) => ({ ...prev, project_id: projectsData[0].id }))
        }

        // Load homepage settings
        const homepageData = await getHomepageSettings()
        setHomepageSettings(homepageData)

        // Load messages
        const messagesData = await getMessages()
        setMessages(messagesData)
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load data. Please try refreshing the page.")
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [isAuthenticated])

  // Load project images when selected project changes
  useEffect(() => {
    const loadProjectImages = async () => {
      if (selectedProject) {
        try {
          const images = await getProjectImages(selectedProject.id)
          setProjectImages(images)
        } catch (error) {
          console.error("Error loading project images:", error)
        }
      }
    }

    loadProjectImages()
  }, [selectedProject])

  // Project functions
  const handleEditProject = (project: Project) => {
    setEditProject(project)
    setIsEditProjectDialogOpen(true)
  }

  const handleDeleteProject = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this project? This will also delete all images associated with this project. This action cannot be undone.",
      )
    ) {
      const result = await deleteProject(id)

      if (result.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id))
        if (selectedProject?.id === id) {
          setSelectedProject(projects.find((p) => p.id !== id) || null)
        }
      } else {
        alert(`Failed to delete: ${result.error}`)
      }
    }
  }

  const handleSaveEditProject = async () => {
    if (!editProject) return

    try {
      setIsSaving(true)

      const result = await updateProject({
        id: editProject.id,
        name: editProject.name,
        description: editProject.description || "",
        location: editProject.location || "",
      })

      if (result.success) {
        setProjects((prev) => prev.map((p) => (p.id === editProject.id ? { ...p, ...editProject } : p)))

        if (selectedProject?.id === editProject.id) {
          setSelectedProject({ ...selectedProject, ...editProject })
        }

        setIsEditProjectDialogOpen(false)
      } else {
        alert(`Failed to update: ${result.error}`)
      }
    } catch (error) {
      console.error("Error saving edit:", error)
      alert("An error occurred while saving changes")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNewProject = async () => {
    try {
      setIsSaving(true)

      // Find the highest display order
      const maxOrder = projects.length > 0 ? Math.max(...projects.map((p) => p.display_order)) : 0

      const result = await createProject({
        name: newProject.name,
        description: newProject.description,
        location: newProject.location,
        display_order: maxOrder + 1,
      })

      if (result.success && result.id) {
        // Refresh the data
        const projectsData = await getProjectsWithImages()
        setProjects(projectsData)

        // Select the new project
        const newProjectData = projectsData.find((p) => p.id === result.id)
        if (newProjectData) {
          setSelectedProject(newProjectData)
        }

        // Reset form
        setNewProject({
          name: "",
          description: "",
          location: "",
        })
        setIsNewProjectDialogOpen(false)
      } else {
        alert(`Failed to create: ${result.error}`)
      }
    } catch (error) {
      console.error("Error creating project:", error)
      alert("An error occurred while creating the project")
    } finally {
      setIsSaving(false)
    }
  }

  const handleMoveProject = async (id: number, direction: "up" | "down") => {
    const result = await updateProjectOrder(id, direction)

    if (result.success) {
      // Refresh the data
      const projectsData = await getProjectsWithImages()
      setProjects(projectsData)

      // Make sure to keep the same selected project
      const updatedSelectedProject = projectsData.find((p) => p.id === selectedProject?.id)
      if (updatedSelectedProject) {
        setSelectedProject(updatedSelectedProject)
      }
    } else {
      alert(`Failed to update order: ${result.error}`)
    }
  }

  // Project Image functions
  const handleEditImage = (image: ProjectImage) => {
    setEditImage(image)
    setIsEditImageDialogOpen(true)
  }

  const handleDeleteImage = async (id: number) => {
    if (confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
      const result = await deleteProjectImage(id)

      if (result.success) {
        // Update the project images list
        setProjectImages((prev) => prev.filter((img) => img.id !== id))

        // Update the selected project to reflect the change
        if (selectedProject) {
          setSelectedProject({
            ...selectedProject,
            images: selectedProject.images?.filter((img) => img.id !== id),
          })
        }
        
        // Refresh all projects to update image counts in the projects list
        const projectsData = await getProjectsWithImages()
        setProjects(projectsData)
      } else {
        alert(`Failed to delete: ${result.error}`)
      }
    }
  }

  const handleSaveEditImage = async () => {
    if (!editImage) return

    try {
      setIsSaving(true)

      const result = await updateProjectImage(
        {
          id: editImage.id,
          title: editImage.title,
          description: editImage.description || "",
          project_id: editImage.project_id,
        },
        selectedFile || undefined,
      )

      if (result.success) {
        // Update local state
        const updatedImage = {
          ...editImage,
          image_url: selectedFile ? URL.createObjectURL(selectedFile) : editImage.image_url,
        }

        setProjectImages((prev) => prev.map((img) => (img.id === editImage.id ? updatedImage : img)))

        // Update the selected project's images
        if (selectedProject) {
          setSelectedProject({
            ...selectedProject,
            images: selectedProject.images?.map((img) => (img.id === editImage.id ? updatedImage : img)),
          })
        }

        setIsEditImageDialogOpen(false)
        setSelectedFile(null)
      } else {
        alert(`Failed to update: ${result.error}`)
      }
    } catch (error) {
      console.error("Error saving edit:", error)
      alert("An error occurred while saving changes")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNewImage = async () => {
    if (!selectedFile || !selectedProject) {
      alert("Please select an image and a project")
      return
    }

    try {
      setIsSaving(true)

      // Find the highest display order
      const maxOrder = projectImages.length > 0 ? Math.max(...projectImages.map((img) => img.display_order)) : 0

      const result = await createProjectImage(
        {
          project_id: selectedProject.id,
          title: newImage.title,
          description: newImage.description,
          image_url: "", // Will be set by the server action
          image_blob_url: "", // Will be set by the server action
          display_order: maxOrder + 1,
        },
        selectedFile,
      )

      if (result.success && result.id) {
        // Refresh all project data to update image counts
        const projectsData = await getProjectsWithImages()
        setProjects(projectsData)
        
        // Refresh the images for the current project
        const images = await getProjectImages(selectedProject.id)
        setProjectImages(images)

        // Update the selected project with new images
        const updatedProject = projectsData.find((p) => p.id === selectedProject.id)
        if (updatedProject) {
          setSelectedProject(updatedProject)
        }

        // Reset form
        setNewImage({
          title: "",
          description: "",
          project_id: selectedProject.id,
        })
        setSelectedFile(null)
        setIsNewImageDialogOpen(false)
      } else {
        alert(`Failed to add image: ${result.error}`)
      }
    } catch (error) {
      console.error("Error adding image:", error)
      alert("An error occurred while adding the image")
    } finally {
      setIsSaving(false)
    }
  }

  const handleMoveImage = async (id: number, direction: "up" | "down") => {
    const result = await updateProjectImageOrder(id, direction)

    if (result.success) {
      // Refresh the data
      const images = await getProjectImages(selectedProject?.id)
      setProjectImages(images)

      // Update the selected project with reordered images
      const projectsData = await getProjectsWithImages()
      const updatedProject = projectsData.find((p) => p.id === selectedProject?.id)
      if (updatedProject) {
        setSelectedProject(updatedProject)
      }
    } else {
      alert(`Failed to update order: ${result.error}`)
    }
  }

  // Homepage functions
  const handleSetFeatured = async (imageId: number) => {
    try {
      console.log("Setting featured image:", imageId, "for section:", selectedHomepageSection);
      
      // Get the image to see which project it belongs to
      const images = await getProjectImages(selectedProject?.id || 0);
      const selectedImage = images.find((img) => img.id === imageId);
      
      if (!selectedImage) {
        console.error("Selected image not found:", imageId);
        return;
      }
      
      console.log("Selected image:", selectedImage);
      
      const updateData: any = {
        id: 1,
      };
      
      switch (selectedHomepageSection) {
        case "hero":
          updateData.hero_image_id = imageId;
          break;
        case "about":
          updateData.about_image_id = imageId;
          break;
      }
      
      console.log("Update data:", updateData);

      const result = await updateHomepageSettings(updateData);
      
      console.log("Update result:", result);

      if (result.success) {
        // Refresh homepage settings
        const newSettings = await getHomepageSettings();
        setHomepageSettings(newSettings);
        
        console.log("New settings:", newSettings);
        
        setIsHomePageDialogOpen(false);
      } else {
        alert(`Failed to update: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating homepage settings:", error);
      alert("An error occurred while updating homepage settings");
    }
  };

  const openHomePageDialog = (section: "hero" | "about") => {
    setSelectedHomepageSection(section)
    setIsHomePageDialogOpen(true)
  }

  // Message functions
  const handleMarkAsRead = async (id: number) => {
    const result = await markMessageAsRead(id)
    if (result.success) {
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, read: true } : msg
      ))
    } else {
      alert("Failed to mark message as read")
    }
  }

  const handleDeleteMessage = async (id: number) => {
    if (confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      const result = await deleteMessage(id)
      if (result.success) {
        setMessages(prev => prev.filter(msg => msg.id !== id))
      } else {
        alert("Failed to delete message")
      }
    }
  }

  // Handle login
  const handleLogin = () => {
    router.push("/admin")
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="mb-4">Admin Access Required</h1>
          <p className="mb-6">You need to log in to access the admin dashboard.</p>
          <button
            onClick={handleLogin}
            className="px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md">
          <h1 className="text-red-600 mb-4">Error</h1>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block mt-4 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-medium">Admin Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "projects" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                activeTab === "messages" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Messages
              {messages.filter(m => !m.read).length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {messages.filter(m => !m.read).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("homepage")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "homepage" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Homepage Settings
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            <p className="mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block mt-4 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl">Projects</h2>
                  <HelpTooltip
                    content={
                      <div className="space-y-2">
                        <p><strong>Managing Your Projects:</strong></p>
                        <p>1. Select a project from the list to view and manage its images</p>
                        <p>2. Click "Add Image" to upload new photos to the selected project</p>
                        <p>3. For each image you can:</p>
                        <ul className="list-disc ml-4">
                          <li>Use the up/down arrows to change image order</li>
                          <li>Click the pencil icon to edit image title</li>
                          <li>Click the trash icon to delete an image</li>
                        </ul>
                        <p>The first image in each project will be used as its thumbnail.</p>
                      </div>
                    }
                  />
                </div>
                <button
                  onClick={() => setIsNewProjectDialogOpen(true)}
                  className="p-2 bg-primary text-white hover:bg-primary/90 transition-colors rounded-md flex items-center gap-1"
                >
                  <Plus size={16} />
                  New Project
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="p-6 border border-dashed border-gray-300 text-center">
                  <p className="text-gray-500">No projects yet. Click "New Project" to create your first project.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      className={`p-3 border ${
                        selectedProject?.id === project.id ? "border-primary bg-gray-50" : "border-gray-200 hover:bg-gray-50"
                      } flex justify-between items-center cursor-pointer`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-gray-500">{project.images?.length || 0} images</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoveProject(project.id, "up")
                          }}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoveProject(project.id, "down")
                          }}
                          disabled={index === projects.length - 1}
                          className="p-1 hover:bg-gray-100 disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditProject(project)
                          }}
                          className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                          aria-label="Edit project"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProject(project.id)
                          }}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Delete project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-3">
              {selectedProject ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl">{selectedProject.name} - Images</h2>
                    <button
                      onClick={() => setIsNewImageDialogOpen(true)}
                      className="p-2 bg-primary text-white hover:bg-primary/90 transition-colors rounded-md flex items-center gap-1"
                    >
                      <ImagePlus size={16} />
                      Add Image
                    </button>
                  </div>

                  {projectImages.length === 0 ? (
                    <div className="p-6 border border-dashed border-gray-300 text-center">
                      <p className="text-gray-500">No images yet. Click "Add Image" to upload your first image.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectImages.map((image, index) => (
                        <div key={image.id} className="border border-gray-200 p-3 rounded-md">
                          <div className="relative h-40 mb-2">
                            <Image
                              src={image.image_url || "/placeholder.svg"}
                              alt={image.title}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>

                          <h4 className="font-medium mb-1 truncate">{image.title}</h4>

                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleMoveImage(image.id, "up")}
                                disabled={index === 0}
                                className="p-1 hover:bg-gray-100 disabled:opacity-30"
                                aria-label="Move up"
                              >
                                <ArrowUp size={16} />
                              </button>
                              <button
                                onClick={() => handleMoveImage(image.id, "down")}
                                disabled={index === projectImages.length - 1}
                                className="p-1 hover:bg-gray-100 disabled:opacity-30"
                                aria-label="Move down"
                              >
                                <ArrowDown size={16} />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditImage(image)}
                                className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                                aria-label="Edit image"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteImage(image.id)}
                                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                aria-label="Delete image"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 border border-dashed border-gray-300 text-center">
                  <p className="text-gray-500">
                    {projects.length === 0
                      ? "Create a project first to add images."
                      : "Select a project to view and manage its images."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl">Messages</h2>
              <HelpTooltip
                content={
                  <div className="space-y-2">
                    <p><strong>Managing Contact Messages:</strong></p>
                    <p>1. New messages appear at the top with a colored border</p>
                    <p>2. Click the checkmark to mark a message as read</p>
                    <p>3. Click the trash icon to permanently delete a message</p>
                    <p>4. Click the email address to compose a reply</p>
                    <p>Read messages will appear slightly grayed out.</p>
                  </div>
                }
              />
            </div>
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet.</p>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg ${
                      message.read ? "bg-gray-50" : "bg-white border-primary"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{message.name}</h3>
                        <a
                          href={`mailto:${message.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {message.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMarkAsRead(message.id)}
                          className={`p-1.5 rounded-md transition-colors ${
                            message.read
                              ? "text-green-600 bg-green-50"
                              : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                          }`}
                          disabled={message.read}
                          title={message.read ? "Message read" : "Mark as read"}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete message"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 whitespace-pre-wrap">{message.message}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(message.created_at).toLocaleDateString()} at{" "}
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "homepage" && (
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <h2 className="text-xl">Homepage Settings</h2>
              <HelpTooltip
                content={
                  <div className="space-y-2">
                    <p><strong>Customizing Your Homepage:</strong></p>
                    <p>1. Hero Image: This is the large image at the top of your homepage</p>
                    <p>2. About Image: This appears in the "About" section</p>
                    <p>For each section:</p>
                    <ul className="list-disc ml-4">
                      <li>Click the image card to change the image</li>
                      <li>Select any image from your projects</li>
                      <li>The current selection will be highlighted</li>
                    </ul>
                    <p>Featured projects are automatically chosen from your first three projects.</p>
                  </div>
                }
              />
            </div>
            {!homepageSettings ? (
              <div className="p-6 border border-dashed border-gray-300 text-center">
                <p className="text-gray-500">No homepage settings found. Create a project and add some images to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Hero Image</h3>
                  <div className="relative aspect-[16/10] mb-4 rounded-lg overflow-hidden border border-border">
                    {homepageSettings?.hero_image?.image_url ? (
                      <Image
                        src={homepageSettings.hero_image.image_url}
                        alt={homepageSettings.hero_image.title || "Hero image"}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">No hero image selected</p>
                      </div>
                    )}
                  </div>
                  {homepageSettings?.hero_image && (
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{homepageSettings.hero_image.title}</p>
                      <p className="text-sm text-muted-foreground">
                        From project: {projects.find(p => p.images?.some(img => img.id === homepageSettings.hero_image?.id))?.name || 'Unknown'}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => openHomePageDialog("hero")}
                    className="mt-4 w-full px-4 py-2 border border-input bg-background hover:bg-accent text-sm rounded-md"
                  >
                    {homepageSettings?.hero_image ? 'Change Hero Image' : 'Select Hero Image'}
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">About Image</h3>
                  <div className="relative aspect-[16/10] mb-4 rounded-lg overflow-hidden border border-border">
                    {homepageSettings?.about_image?.image_url ? (
                      <Image
                        src={homepageSettings.about_image.image_url}
                        alt={homepageSettings.about_image.title || "About image"}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">No about image selected</p>
                      </div>
                    )}
                  </div>
                  {homepageSettings?.about_image && (
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{homepageSettings.about_image.title}</p>
                      <p className="text-sm text-muted-foreground">
                        From project: {projects.find(p => p.images?.some(img => img.id === homepageSettings.about_image?.id))?.name || 'Unknown'}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => openHomePageDialog("about")}
                    className="mt-4 w-full px-4 py-2 border border-input bg-background hover:bg-accent text-sm rounded-md"
                  >
                    {homepageSettings?.about_image ? 'Change About Image' : 'Select About Image'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectDialogOpen} onOpenChange={setIsEditProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full items-center gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                value={editProject?.name || ""}
                onChange={(e) => setEditProject((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={editProject?.description || ""}
                onChange={(e) => setEditProject((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <input
                id="location"
                value={editProject?.location || ""}
                onChange={(e) => setEditProject((prev) => (prev ? { ...prev, location: e.target.value } : null))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditProjectDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditProject}
                className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2"
                disabled={isSaving || !editProject?.name}
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Project Dialog */}
      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full items-center gap-2">
              <label htmlFor="new-name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="new-name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="new-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="new-description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="new-location" className="text-sm font-medium">
                Location
              </label>
              <input
                id="new-location"
                value={newProject.location}
                onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsNewProjectDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewProject}
                className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2"
                disabled={isSaving || !newProject.name}
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                Create Project
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Image Dialog */}
      <Dialog open={isEditImageDialogOpen} onOpenChange={setIsEditImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full items-center gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                value={editImage?.title || ""}
                onChange={(e) => setEditImage((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="image-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="image-description"
                value={editImage?.description || ""}
                onChange={(e) => setEditImage((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label className="text-sm font-medium">Image</label>
              <ImageUpload onImageSelected={(file) => setSelectedFile(file)} currentImageUrl={editImage?.image_url} />
              <p className="text-xs text-gray-500">Leave empty to keep the current image</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditImageDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditImage}
                className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2"
                disabled={isSaving || !editImage?.title}
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Image Dialog */}
      <Dialog open={isNewImageDialogOpen} onOpenChange={setIsNewImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full items-center gap-2">
              <label htmlFor="new-title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="new-title"
                value={newImage.title}
                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label htmlFor="new-image-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="new-image-description"
                value={newImage.description}
                onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <label className="text-sm font-medium">Image</label>
              <ImageUpload onImageSelected={(file) => setSelectedFile(file)} />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsNewImageDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewImage}
                className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2"
                disabled={isSaving || !newImage.title || !selectedFile}
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                Add Image
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Homepage Dialog */}
      <Dialog open={isHomePageDialogOpen} onOpenChange={setIsHomePageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedHomepageSection === "hero" ? "Select Hero Image" : "Select About Image"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {projects.length === 0 ? (
              <p className="text-center py-4">No projects or images available yet.</p>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Current Selection</h3>
                  <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden border border-border">
                    {selectedHomepageSection === "hero" ? (
                      homepageSettings?.hero_image?.image_url ? (
                        <>
                          <Image
                            src={homepageSettings.hero_image.image_url}
                            alt={homepageSettings.hero_image.title || "Hero image"}
                            fill
                            className="object-cover"
                            priority
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                            {homepageSettings.hero_image.title}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">No hero image selected</p>
                        </div>
                      )
                    ) : homepageSettings?.about_image?.image_url ? (
                      <>
                        <Image
                          src={homepageSettings.about_image.image_url}
                          alt={homepageSettings.about_image.title || "About image"}
                          fill
                          className="object-cover"
                          priority
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                          {homepageSettings.about_image.title}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No about image selected</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-4">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`px-3 py-1 text-sm rounded ${
                        selectedProject?.id === project.id ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {project.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
                  {projectImages.map((image) => (
                    <div
                      key={image.id}
                      className={`relative cursor-pointer group rounded-md overflow-hidden border-2 transition-all ${
                        (selectedHomepageSection === "hero" && homepageSettings?.hero_image_id === image.id) ||
                        (selectedHomepageSection === "about" && homepageSettings?.about_image_id === image.id)
                          ? "border-primary ring-2 ring-primary ring-opacity-50"
                          : "border-transparent hover:border-primary/50"
                      }`}
                      onClick={() => handleSetFeatured(image.id)}
                    >
                      <div className="relative w-full h-32">
                        <Image
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center rounded-md">
                        {((selectedHomepageSection === "hero" && homepageSettings?.hero_image_id === image.id) ||
                          (selectedHomepageSection === "about" && homepageSettings?.about_image_id === image.id)) && (
                          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 text-xs">
                        {image.title}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsHomePageDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
