import { formatEther } from 'ethers'
import { useEffect, useState } from 'react'
import {
  criarProposta,
  delegar,
  executar,
  listarPropostas,
  meuPoderDeVoto,
  votar,
} from '../utils/dao'
import WalletAddressInput from './WalletAddressInput'

const ESTADO_LABEL = ['Ativa', 'Aprovada', 'Rejeitada', 'Executada']

// Os votos e o poder vêm em unidades brutas do token (18 casas decimais).
// Converte para a quantidade legível de tokens (ex.: 1000000000000000000 -> 1).
const formatarVotos = (valorEmWei) => {
  if (valorEmWei === null || valorEmWei === undefined) return '0'
  return Number(formatEther(valorEmWei)).toString()
}

function GovernanceScreen({ account }) {
  const [propostas, setPropostas] = useState([])
  const [ongAlvo, setOngAlvo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [poder, setPoder] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [carregando, setCarregando] = useState(false)

  const recarregar = async () => {
    try {
      setPropostas(await listarPropostas())
    } catch (err) {
      setFeedbackType('error')
      setFeedback(err?.shortMessage || err?.message || 'Falha ao carregar propostas.')
    }
  }

  useEffect(() => {
    recarregar()
  }, [])

  const comAcao = async (fn) => {
    setCarregando(true)
    setFeedback('')
    setFeedbackType('')
    try {
      const r = await fn()
      setFeedbackType('success')
      setFeedback(
        r?.hash ? `Confirmado! Tx: https://sepolia.etherscan.io/tx/${r.hash}` : 'Pronto!',
      )
      await recarregar()
    } catch (err) {
      setFeedbackType('error')
      setFeedback(err?.shortMessage || err?.message || 'Nao foi possivel completar a acao.')
    } finally {
      setCarregando(false)
    }
  }

  const handleCriar = (event) => {
    event.preventDefault()
    if (!ongAlvo.trim().startsWith('0x')) {
      setFeedbackType('error')
      setFeedback('Informe um endereco de ONG valido (0x...).')
      return
    }
    comAcao(() => criarProposta({ ongAlvo: ongAlvo.trim(), descricao: descricao.trim() }))
  }

  const handleVerPoder = () =>
    comAcao(async () => {
      const p = await meuPoderDeVoto()
      setPoder(p)
      return {}
    })

  return (
    <section className="screen-section">
      <div className="section-header section-header--left">
        <span className="eyebrow">DAO</span>
        <h1>Governanca</h1>
        <p>
          Membros com tokens DFG votam para verificar ONGs. Ao aprovar, a DAO
          chama verificar_ong on-chain na Sepolia.
        </p>
      </div>

      <div className="dao-toolbar">
        <button type="button" className="secondary-button" onClick={() => comAcao(delegar)} disabled={carregando}>
          Delegar poder de voto
        </button>
        <button type="button" className="secondary-button" onClick={handleVerPoder} disabled={carregando}>
          Ver meu poder de voto
        </button>
        {poder !== null ? <span className="dao-poder">Poder: {formatarVotos(poder)}</span> : null}
      </div>

      <form className="donation-form" onSubmit={handleCriar}>
        <WalletAddressInput
          label="Endereco da ONG alvo"
          value={ongAlvo}
          onValueChange={setOngAlvo}
          account={account}
          required
        />
        <label className="field">
          <span>Descricao</span>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Por que verificar esta ONG?" />
        </label>
        <button type="submit" className="primary-button" disabled={carregando}>
          {carregando ? 'Processando...' : 'Criar proposta'}
        </button>
      </form>

      {feedback ? (
        <p className={feedbackType === 'error' ? 'feedback-message feedback-message--error' : 'feedback-message feedback-message--success'}>
          {feedback}
        </p>
      ) : null}

      <ul className="dao-lista">
        {propostas.map((p) => (
          <li key={p.id} className="dao-card">
            <div className="dao-card__head">
              <strong>#{p.id} — {ESTADO_LABEL[p.estado]}</strong>
              <span>{p.ongAlvo}</span>
            </div>
            <p>{p.descricao}</p>
            <p>A favor: {formatarVotos(p.votosFavor)} | Contra: {formatarVotos(p.votosContra)}</p>
            <div className="dao-card__acoes">
              <button type="button" className="secondary-button" onClick={() => comAcao(() => votar({ id: p.id, apoia: true }))} disabled={carregando || p.estado !== 0}>
                A favor
              </button>
              <button type="button" className="secondary-button" onClick={() => comAcao(() => votar({ id: p.id, apoia: false }))} disabled={carregando || p.estado !== 0}>
                Contra
              </button>
              <button type="button" className="primary-button" onClick={() => comAcao(() => executar({ id: p.id }))} disabled={carregando || p.estado !== 1}>
                Executar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default GovernanceScreen
