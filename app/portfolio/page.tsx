import { getProjectsWithImages } from "@/app/actions/project"
import PortfolioClient from "./portfolio-client"

export const dynamic = 'force-dynamic'

export default async function Portfolio() {
  const projects = await getProjectsWithImages()

  return <PortfolioClient initialProjects={projects} />
}
