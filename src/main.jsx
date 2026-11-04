import DemoEntry from './components/DemoEntry'
import ErrorBoundary from './components/ErrorBoundary'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary><DemoEntry /></ErrorBoundary>
  </StrictMode>,
)
