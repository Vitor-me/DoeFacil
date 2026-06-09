import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import { getProvider } from './utils/ethers'
import './App.css'

function formatAddress(address) {
  if (!address) {
    return ''
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function App() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const provider = getProvider()

    if (!provider || !window.ethereum) {
      return undefined
    }

    const syncConnectedAccount = async () => {
      try {
        const accounts = await provider.send('eth_accounts', [])

        setWalletAddress(accounts[0] ?? '')
      } catch {
        setErrorMessage('Nao foi possivel verificar a carteira conectada.')
      }
    }

    const handleAccountsChanged = (accounts) => {
      setWalletAddress(accounts[0] ?? '')
      setErrorMessage('')
    }

    syncConnectedAccount()
    window.ethereum.on('accountsChanged', handleAccountsChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [])

  const connectWallet = async () => {
    const provider = getProvider()

    if (!provider) {
      setErrorMessage('MetaMask nao encontrada. Instale a extensao para continuar.')
      return
    }

    try {
      setIsConnecting(true)
      setErrorMessage('')

      const accounts = await provider.send('eth_requestAccounts', [])

      setWalletAddress(accounts[0] ?? '')
    } catch (error) {
      console.error(error)

      if (error?.code === 4001) {
        setErrorMessage('Voce cancelou a solicitacao de conexao.')
      } else {
        setErrorMessage('Nao foi possivel conectar a carteira.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="wallet-card">
        <div className="hero">
          <img
            src={heroImg}
            className="hero-image"
            width="170"
            height="179"
            alt="Ilustracao da plataforma DoeFacil"
          />
        </div>

        <div className="wallet-copy">
          <span className="eyebrow">DoeFacil</span>
          <h1>Conecte sua carteira</h1>
          <p>
            Use a MetaMask para entrar no frontend e visualizar o endereco da
            carteira conectada.
          </p>
        </div>

        <button
          type="button"
          className="connect-button"
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? 'Conectando...' : 'Conectar MetaMask'}
        </button>

        <div className="wallet-status">
          <span className="status-label">Status</span>
          {walletAddress ? (
            <>
              <strong>Carteira conectada</strong>
              <code>{walletAddress}</code>
              <span className="status-hint">
                Endereco curto: {formatAddress(walletAddress)}
              </span>
            </>
          ) : (
            <>
              <strong>Nenhuma carteira conectada</strong>
              <span className="status-hint">
                Clique no botao acima para conectar a MetaMask.
              </span>
            </>
          )}
        </div>

        {errorMessage ? <p className="error-message">{errorMessage}</p> : null}
      </section>
    </main>
  )
}

export default App
