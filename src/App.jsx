import React from 'react'
import Navbar from './components/UI/Navbar'
import Hero from './components/Sections/Hero'
import About from './components/Sections/About'
import Services from './components/Sections/Services'
import Gallery from './components/Sections/Gallery'
import Booking from './components/Sections/Booking'
import Footer from './components/UI/Footer'
import WhatsAppButton from './components/UI/WhatsAppButton'
import './index.css'

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Booking />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default App
