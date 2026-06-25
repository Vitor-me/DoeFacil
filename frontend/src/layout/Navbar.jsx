import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'

const NAV_LINKS = [
  { to: '/', label: 'Início', end: true },
  { to: '/campanhas', label: 'Campanhas', end: false },
  { to: '/autorizar', label: 'Autorizar', end: false },
  { to: '/saque', label: 'Saque', end: false },
  { to: '/historico', label: 'Histórico', end: false },
  { to: '/governanca', label: 'Governança', end: false },
]

function Navbar() {
  const { wallet, connect, isConnectingWallet } = useWallet()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand" onClick={closeMenu}>
          DoeFacil
        </NavLink>

        <button
          type="button"
          className="navbar__toggle"
          aria-label="Abrir menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={
            isMenuOpen ? 'navbar__links navbar__links--open' : 'navbar__links'
          }
          aria-label="Navegação principal"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link--active' : 'nav-link'
              }
            >
              {link.label}
            </NavLink>
          ))}

          <button
            type="button"
            className="primary-button navbar__connect"
            onClick={() => {
              closeMenu()
              void connect()
            }}
            disabled={isConnectingWallet}
          >
            {isConnectingWallet
              ? 'Conectando...'
              : wallet.isConnected
                ? 'Reconectar'
                : 'Conectar MetaMask'}
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
