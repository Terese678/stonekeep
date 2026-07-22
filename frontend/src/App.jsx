// App.jsx - the root shell for Stonekeep.
// Sets up routing between pages (Dashboard, Browse Works) and renders
// the persistent Header (branding, navigation, wallet connect) above
// whichever page is currently active.

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import BrowseWorks from './components/BrowseWorks'

function App() {
  return (
    <div className="min-h-screen text-white relative">

      {/* Animated background layer - fixed behind everything, z-0 */}
      <div className="bg-pattern" />

      <div className="relative z-10">
        <BrowserRouter>
          <Header />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/browse" element={<BrowseWorks />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  )
}

export default App