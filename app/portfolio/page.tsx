import { getProjectsWithImages } from "@/app/actions/project"
import PortfolioClient from "./portfolio-client"

export default async function Portfolio() {
  const projects = await getProjectsWithImages()

  return <PortfolioClient initialProjects={projects} />
}
