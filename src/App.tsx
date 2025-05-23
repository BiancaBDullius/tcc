import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WindFarmProvider } from './context/WindFarmContext'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'
import ScenePage from './pages/SceneCanvas'

function App() {
  return (
    <WindFarmProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/scene" element={<ScenePage />} />
        </Routes>
      </BrowserRouter>
    </WindFarmProvider>
  )
}

export default App
