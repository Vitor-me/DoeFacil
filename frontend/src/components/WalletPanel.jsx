import { formatEther } from 'ethers'
import { formatWalletAddress, getNetworkLabel } from '../utils/ethers'

function WalletPanel({
  wallet,
  onConnect,
  isConnecting,
  isContractConfigured,
  statusMessage,
}) {
  const hasBalance = Boolean(wallet.balanceInWei)

  return (
    <section className="wallet-panel">
      <div className="wallet-panel__header">
        <div>
          <span className="eyebrow">Blockchain</span>
          <h2>MetaMask e rede Sepolia</h2>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Conectando...' : wallet.isConnected ? 'Reconectar carteira' : 'Conectar MetaMask'}
        </button>
      </div>

      <div className="wallet-grid">
        <article className="wallet-stat">
          <span className="wallet-stat__label">Carteira</span>
          <strong>
            {wallet.isConnected
              ? formatWalletAddress(wallet.account)
              : 'Não conectada'}
          </strong>
        </article>

        <article className="wallet-stat">
          <span className="wallet-stat__label">Rede</span>
          <strong>{getNetworkLabel(wallet.chainId)}</strong>
        </article>

        <article className="wallet-stat">
          <span className="wallet-stat__label">Saldo</span>
          <strong>
            {hasBalance ? `${Number(formatEther(wallet.balanceInWei)).toFixed(4)} ETH` : 'Indisponível'}
          </strong>
        </article>

        <article className="wallet-stat">
          <span className="wallet-stat__label">Status</span>
          <strong>
            {!wallet.isMetaMaskInstalled
              ? 'MetaMask ausente'
              : wallet.isConnected && wallet.isSepolia
                ? 'Pronto para uso'
                : wallet.isConnected
                  ? 'Rede incorreta'
                  : 'Aguardando conexão'}
          </strong>
        </article>

        <article className="wallet-stat">
          <span className="wallet-stat__label">Contrato</span>
          <strong>
            {isContractConfigured
              ? 'Configurado para Sepolia'
              : 'Preparado para receber ABI/endereço'}
          </strong>
        </article>
      </div>

      {statusMessage ? (
        <p
          className={
            statusMessage.type === 'error'
              ? 'feedback-message feedback-message--error'
              : 'feedback-message feedback-message--success'
          }
        >
          {statusMessage.text}
        </p>
      ) : null}
    </section>
  )
}

export default WalletPanel
