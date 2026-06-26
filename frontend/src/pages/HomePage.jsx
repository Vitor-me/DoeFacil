import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'

const STEPS = [
  {
    numero: '1',
    titulo: 'Conecte',
    texto: 'Ligue sua carteira MetaMask na rede de testes Sepolia.',
  },
  {
    numero: '2',
    titulo: 'Doe',
    texto: 'Escolha uma campanha e contribua com a quantia que quiser.',
  },
  {
    numero: '3',
    titulo: 'Acompanhe',
    texto: 'Veja cada doação e saque registrados publicamente na blockchain.',
  },
]

function HomePage() {
  const { wallet, connect, isConnectingWallet } = useWallet()

  return (
    <div className="home">
      <section className="home-hero">
        <span className="eyebrow">Doações na blockchain</span>
        <h1>Doações transparentes, do seu jeito.</h1>
        <p className="home-hero__lead">
          O DoeFacil conecta você a campanhas solidárias usando a blockchain
          Ethereum. Cada doação e cada saque ficam registrados de forma pública
          e verificável — sem intermediários.
        </p>
        <div className="home-hero__actions">
          <Link to="/campanhas" className="primary-button">
            Ver campanhas
          </Link>
          {!wallet.isConnected ? (
            <button
              type="button"
              className="secondary-button"
              onClick={() => void connect()}
              disabled={isConnectingWallet}
            >
              {isConnectingWallet ? 'Conectando...' : 'Conectar carteira'}
            </button>
          ) : null}
        </div>
      </section>

      <section className="home-steps">
        <h2>Como funciona</h2>
        <div className="home-steps__grid">
          {STEPS.map((step) => (
            <article key={step.numero} className="home-step">
              <span className="home-step__numero">{step.numero}</span>
              <h3>{step.titulo}</h3>
              <p>{step.texto}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
