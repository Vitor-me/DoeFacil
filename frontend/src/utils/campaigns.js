import { formatEther, parseEther } from 'ethers'
import { getContract, getProvider, getReadOnlyContract, isSepoliaChain } from './ethers'

// --- Funções puras (testáveis sem MetaMask) ---

// Converte a struct crua de `campanhas(id)` no formato usado pela UI.
// Aceita tanto o retorno indexado quanto por nome (ethers v6 expõe os dois).
export function normalizeCampaign(raw, id) {
  const onChainId = Number(id)

  return {
    id: `campanha-${onChainId}`,
    onChainId,
    nome: raw.titulo ?? raw[2],
    metaEth: Number(formatEther(raw.meta_arrecadacao ?? raw[3])),
    arrecadadoEth: Number(formatEther(raw.total_arrecadado ?? raw[4])),
    saldoEth: Number(formatEther(raw.saldo ?? raw[5])),
    prazo: Number(raw.prazo ?? raw[6]),
    ativa: Boolean(raw.ativa ?? raw[7]),
    ong: raw.ong ?? raw[1],
  }
}

// Converte uma string de <input type="date"> (YYYY-MM-DD) ou datetime em
// timestamp Unix (segundos). Retorna null se a data for inválida.
export function toUnixTimestamp(dateString) {
  if (!dateString) {
    return null
  }

  const millis = new Date(dateString).getTime()
  if (Number.isNaN(millis)) {
    return null
  }

  return Math.floor(millis / 1000)
}

// Valida os campos do formulário de nova campanha antes de enviar a tx.
export function validarNovaCampanha({ titulo, metaEth, prazo }, agora = Date.now()) {
  if (!titulo || !titulo.trim()) {
    return { valido: false, erro: 'Informe o título da campanha.' }
  }

  if (!Number(metaEth) || Number(metaEth) <= 0) {
    return { valido: false, erro: 'A meta deve ser um valor em ETH maior que zero.' }
  }

  const prazoUnix = toUnixTimestamp(prazo)
  if (prazoUnix === null) {
    return { valido: false, erro: 'Informe um prazo válido.' }
  }

  if (prazoUnix * 1000 <= agora) {
    return { valido: false, erro: 'O prazo deve ser uma data no futuro.' }
  }

  return { valido: true, erro: '' }
}

// --- Leituras on-chain ---

export async function fetchCampaigns() {
  const provider = getProvider()

  if (!provider) {
    return {
      status: 'provider_unavailable',
      items: [],
      message: 'MetaMask não instalada.',
    }
  }

  const network = await provider.getNetwork()
  if (!isSepoliaChain(Number(network.chainId))) {
    return {
      status: 'wrong_network',
      items: [],
      message: 'Rede incorreta (não Sepolia).',
    }
  }

  const contract = await getReadOnlyContract()
  const total = Number(await contract.contadorCampanhas())

  const ids = Array.from({ length: total }, (_, index) => index + 1)
  const raw = await Promise.all(ids.map((id) => contract.campanhas(id)))
  const items = raw.map((campanha, index) => normalizeCampaign(campanha, ids[index]))

  return {
    status: 'ready',
    items,
    message: items.length ? '' : 'Nenhuma campanha criada ainda.',
  }
}

export async function fetchRoles(account) {
  const provider = getProvider()
  if (!provider || !account) {
    return { isOwner: false, isVerifiedOng: false }
  }

  const network = await provider.getNetwork()
  if (!isSepoliaChain(Number(network.chainId))) {
    return { isOwner: false, isVerifiedOng: false }
  }

  const contract = await getReadOnlyContract()
  const [owner, ong] = await Promise.all([contract.owner(), contract.ongs(account)])

  return {
    isOwner: owner.toLowerCase() === account.toLowerCase(),
    isVerifiedOng: Boolean(ong.verificada ?? ong[2]),
  }
}

// --- Escritas on-chain (exigem signer/MetaMask) ---

export async function criarCampanha({ titulo, metaEth, prazo }) {
  const prazoUnix = toUnixTimestamp(prazo)
  const contract = await getContract()
  const tx = await contract.criar_campanha(titulo.trim(), parseEther(String(metaEth)), prazoUnix)
  await tx.wait()

  return { success: true, hash: tx.hash }
}

export async function verificarOng({ carteira }) {
  const contract = await getContract()
  const tx = await contract.verificar_ong(carteira.trim())
  await tx.wait()

  return { success: true, hash: tx.hash }
}
