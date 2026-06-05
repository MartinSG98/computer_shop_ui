import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ShopPage } from './pages/ShopPage'
import { BuildPage } from './pages/BuildPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ShopPage />} />
        <Route path="build" element={<BuildPage />} />
      </Route>
    </Routes>
  )
}

export default App