function formatEth(value) {
  return `${Number(value).toFixed(2)} ETH`
}

function formatPrazo(prazoUnix) {
  if (!prazoUnix) {
    return null
  }

  return new Date(prazoUnix * 1000).toLocaleDateString('pt-BR')
}

function CampaignCard({ campaign, onDonate }) {
  const progresso =
    campaign.metaEth > 0
      ? Math.min(100, Math.round((campaign.arrecadadoEth / campaign.metaEth) * 100))
      : 0
  const prazo = formatPrazo(campaign.prazo)

  return (
    <article className="campaign-card">
      <div className="campaign-card__content">
        <h2>{campaign.nome}</h2>
        <p>Meta: {formatEth(campaign.metaEth)}</p>
        <p>Arrecadado: {formatEth(campaign.arrecadadoEth)}</p>

        <div className="campaign-card__progress" aria-hidden="true">
          <span style={{ width: `${progresso}%` }} />
        </div>
        <p className="campaign-card__meta">
          {progresso}% da meta
          {prazo ? ` · prazo ${prazo}` : ''}
          {campaign.ativa ? '' : ' · encerrada'}
        </p>
      </div>

      <button
        type="button"
        className="primary-button"
        onClick={() => onDonate(campaign)}
      >
        Doar
      </button>
    </article>
  )
}

function CampaignList({ campaigns, onDonate }) {
  return (
    <section className="screen-section">
      <div className="section-header">
        <span className="eyebrow">Campanhas</span>
        <h1>Listagem de Campanhas</h1>
        <p>Escolha uma campanha para seguir para a tela de doação.</p>
      </div>

      {campaigns.length === 0 ? (
        <p className="feedback-message">Nenhuma campanha criada ainda.</p>
      ) : (
        <div className="campaign-grid">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDonate={onDonate}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default CampaignList
