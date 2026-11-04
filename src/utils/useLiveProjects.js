import { useEffect, useRef, useState } from 'react'

// Refresh records without remounting forms or losing unsaved review notes.
export function useLiveProjects(read) {
  const reader = useRef(read)
  useEffect(() => { reader.current = read })
  const [value, setValue] = useState(read)
  useEffect(() => {
    const refresh = () => setValue(reader.current())
    window.addEventListener('mfu-projects-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => { window.removeEventListener('mfu-projects-updated', refresh); window.removeEventListener('storage', refresh) }
  }, [])
  return [value, setValue]
}
