import { useState } from 'react'
import { validarNovaCampanha } from '../utils/campaigns'

function CreateCampaignScreen({ onSubmitCampaign, canCreate, notice }) {
  const [titulo, setTitulo] = useState('')
  const [metaEth, setMetaEth] = useState('')
  const [prazo, setPrazo] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const { valido, erro } = validarNovaCampanha({ titulo, metaEth, prazo })
    if (!valido) {
      setFeedbackType('error')
      setFeedbackMessage(erro)
      return
    }

    setIsSubmitting(true)
    setFeedbackMessage('')
    setFeedbackType('')

    try {
      const result = await onSubmitCampaign({ titulo, metaEth, prazo })
      setFeedbackType('success')
      setFeedbackMessage(
        `Campanha criada! Tx: https://sepolia.etherscan.io/tx/${result.hash}`,
      )
      setTitulo('')
      setMetaEth('')
      setPrazo('')
    } catch (err) {
      setFeedbackType('error')
      setFeedbackMessage(
        err?.shortMessage || err?.message || 'Não foi possível criar a campanha. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="screen-section">
      <div className="section-header section-header--left">
        <h1>Criar Campanha</h1>
        <p>
          ONGs verificadas podem criar campanhas on-chain via MetaMask na rede
          Sepolia.
        </p>
      </div>

      {notice ? <p className="feedback-message feedback-message--error">{notice}</p> : null}

      <form className="donation-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Título</span>
          <input
            type="text"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            placeholder="Ex.: Cestas básicas para famílias"
            disabled={!canCreate}
            required
          />
        </label>

        <label className="field">
          <span>Meta em ETH</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={metaEth}
            onChange={(event) => setMetaEth(event.target.value)}
            placeholder="10.00"
            disabled={!canCreate}
            required
          />
        </label>

        <label className="field">
          <span>Prazo</span>
          <input
            type="date"
            value={prazo}
            onChange={(event) => setPrazo(event.target.value)}
            disabled={!canCreate}
            required
          />
        </label>

        <button type="submit" className="primary-button" disabled={!canCreate || isSubmitting}>
          {isSubmitting ? 'Processando...' : 'Criar campanha'}
        </button>
      </form>

      {feedbackMessage ? (
        <p
          className={
            feedbackType === 'error'
              ? 'feedback-message feedback-message--error'
              : 'feedback-message feedback-message--success'
          }
        >
          {feedbackMessage}
        </p>
      ) : null}
    </section>
  )
}

export default CreateCampaignScreen
