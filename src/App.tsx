import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ShopPage } from './pages/ShopPage'
import { BuildPage } from './pages/BuildPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ShopPage />} />
        <Route path="build" element={<BuildPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}

export default App