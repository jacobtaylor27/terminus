import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// The serif for display text. Its optical-size axis, as well as its weight, is used. The build
// copies the font into the site's own assets.
import '@fontsource-variable/newsreader/opsz.css'
import './index.css'
import { App } from './App.tsx'
import { fetchMapData } from './map/QuizMap.tsx'
import { browserStorage, openRecords } from './records/records.ts'

// The maps aren't needed until an Attempt starts, so their data loads while the player picks a Quiz.
fetchMapData()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App records={openRecords(browserStorage(), Date.now)} />
  </StrictMode>,
)
