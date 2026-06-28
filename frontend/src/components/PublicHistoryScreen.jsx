import { formatWalletAddress } from '../utils/ethers'

function PublicHistoryScreen({ historyState, onRefresh }) {
  const { items, message, status, isLoading } = historyState

  return (
    <section className="screen-section">
      <div className="history-header">
        <div className="section-header section-header--left">
          <h1>Histórico Público</h1>
          <p>
            Doações recebidas, campanhas criadas e saques do contrato serão
            exibidos aqui quando a integração com Sepolia estiver configurada.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? 'Atualizando...' : 'Atualizar histórico'}
        </button>
      </div>

      {message ? (
        <p
          className={
            status === 'error' || status === 'wrong_network'
              ? 'feedback-message feedback-message--error'
              : 'feedback-message'
          }
        >
          {message}
        </p>
      ) : null}

      {items.length ? (
        <div className="history-list">
          {items.map((item) => (
            <article key={item.id} className="history-card">
              <div className="history-card__top">
                <span className="history-card__badge">{item.title}</span>
                <span>{item.timestamp}</span>
              </div>

              <div className="history-card__grid">
                <div>
                  <span className="wallet-stat__label">Carteira</span>
                  <strong>{formatWalletAddress(item.wallet)}</strong>
                </div>
                <div>
                  <span className="wallet-stat__label">Valor</span>
                  <strong>{item.amount}</strong>
                </div>
                <div>
                  <span className="wallet-stat__label">Campanha</span>
                  <strong>{item.campaignId}</strong>
                </div>
                <div>
                  <span className="wallet-stat__label">Transação</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${item.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {formatWalletAddress(item.txHash)}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>Nenhum evento disponível.</strong>
          <p>
            O histórico público aparecerá aqui assim que o contrato em Sepolia
            for configurado e emitir eventos.
          </p>
        </div>
      )}
    </section>
  )
}

export default PublicHistoryScreen
