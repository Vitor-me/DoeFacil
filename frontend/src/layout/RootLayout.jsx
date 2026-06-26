import { Outlet } from 'react-router-dom'
import WalletPanel from '../components/WalletPanel'
import { useWallet } from '../context/WalletContext'
import Footer from './Footer'
import Navbar from './Navbar'

function RootLayout() {
  const { wallet, isContractConfigured, walletStatusMessage } = useWallet()

  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-main">
        <WalletPanel
          wallet={wallet}
          isContractConfigured={isContractConfigured}
          statusMessage={walletStatusMessage}
        />

        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default RootLayout
