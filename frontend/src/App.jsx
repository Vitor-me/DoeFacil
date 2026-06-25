import { RouterProvider } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext'
import { router } from './router'
import './App.css'

function App() {
  return (
    <WalletProvider>
      <RouterProvider router={router} />
    </WalletProvider>
  )
}

export default App
