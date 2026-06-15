function formatEth(value) {
  return `${value.toFixed(2)} ETH`
}

function CampaignCard({ campaign, onDonate }) {
  return (
    <article className="campaign-card">
      <div className="campaign-card__content">
        <h2>{campaign.nome}</h2>
        <p>{campaign.descricao}</p>
        <p>Meta: {formatEth(campaign.metaEth)}</p>
        <p>Arrecadado: {formatEth(campaign.arrecadadoEth)}</p>
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

      <div className="campaign-grid">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onDonate={onDonate}
          />
        ))}
      </div>
    </section>
  )
}

export default CampaignList
