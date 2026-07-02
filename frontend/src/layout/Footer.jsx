import sepolia from '../contracts/sepolia.json'

function Footer() {
  const explorerUrl = sepolia.endereco
    ? `https://sepolia.etherscan.io/address/${sepolia.endereco}`
    : null

  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__brand">DoeFacil</span>
        <span className="footer__meta">Rede de testes Sepolia (Ethereum)</span>
        {explorerUrl ? (
          <a
            className="footer__link"
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
          >
            Ver contrato no Etherscan
          </a>
        ) : null}
      </div>
    </footer>
  )
}

export default Footer
