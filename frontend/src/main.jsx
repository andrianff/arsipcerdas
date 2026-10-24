import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Pencarian from './components/Pencarian.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Pencarian />
  </StrictMode>,
)
