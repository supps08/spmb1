import { useEffect, useRef, useState } from 'react'

export function useScrollAnimation() {
  const lastScrollY = useRef(0)
  
  useEffect(() => {
    const elements = document.querySelectorAll('[data-animate]')
    
    const observer = new IntersectionObserver((entries) => {
      const currentScrollY = window.scrollY
      const scrollingDown = currentScrollY > lastScrollY.current
      lastScrollY.current = currentScrollY
      
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = Number((entry.target as HTMLElement).dataset.delay || 0)
          const el = entry.target as HTMLElement
          el.style.transition = `opacity 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms, transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms`
          el.style.opacity = '1'
          el.style.transform = 'translateX(0) translateY(0)'
          observer.unobserve(el)
        }
      })
    }, { threshold: 0.12 })
    
    elements.forEach((el, i) => {
      const htmlEl = el as HTMLElement
      const scrollingDown = window.scrollY > lastScrollY.current
      htmlEl.style.opacity = '0'
      htmlEl.style.transform = scrollingDown ? 'translateX(40px)' : 'translateX(-40px)'
      observer.observe(htmlEl)
    })
    
    const handleScroll = () => { lastScrollY.current = window.scrollY }
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
}
