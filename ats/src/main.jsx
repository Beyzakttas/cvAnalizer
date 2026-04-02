import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CVProvider } from './store/CVContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CVProvider>
      <App />
    </CVProvider>
  </StrictMode>,
)
