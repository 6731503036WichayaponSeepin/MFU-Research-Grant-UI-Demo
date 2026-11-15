import ErrorBoundary from './components/ErrorBoundary'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const { default: Entry } = import.meta.env.MODE === 'firebase'
  ? await import('./components/FirebaseGate')
  : await import('./components/DemoEntry')

// Load the common visual layer after each entry's existing page styles.
await import('./theme.css')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary><Entry /></ErrorBoundary>
  </StrictMode>,
)
