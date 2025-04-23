const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export const smoothScrollTo = (element: HTMLElement, duration: number = 1200): void => {
  const start = window.scrollY
  const end = element.getBoundingClientRect().top + window.scrollY - 96 // 96px offset for header
  const startTime = performance.now()

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    const easeProgress = easeInOutQuad(progress)
    window.scrollTo(0, start + (end - start) * easeProgress)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}
