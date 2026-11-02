import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { browserStorage, openRecords } from './records/records.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App records={openRecords(browserStorage(), Date.now)} />
  </StrictMode>,
)
