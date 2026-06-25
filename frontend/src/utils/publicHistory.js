import { formatEther } from 'ethers'
import sepolia from '../contracts/sepolia.json'
import { getProvider, getReadOnlyContract, isSepoliaChain } from './ethers'

const PUBLIC_EVENT_NAMES = {
  donationReceived: 'doacao_recebida',
  campaignCreated: 'campanha_criada',
  withdrawal: 'saque_realizado',
}

function getEventFilter(contract, eventName) {
  if (!contract.filters || typeof contract.filters[eventName] !== 'function') {
    return null
  }

  return contract.filters[eventName]()
}

function getArgValue(args, keys) {
  if (!args) {
    return null
  }

  for (const key of keys) {
    if (args[key] !== undefined && args[key] !== null) {
      return args[key]
    }
  }

  return null
}

function formatTimestamp(block) {
  if (!block?.timestamp) {
    return 'Data indisponível'
  }

  return new Date(Number(block.timestamp) * 1000).toLocaleString('pt-BR')
}

function formatHistoryEntry({ type, log, block }) {
  const wallet =
    getArgValue(log.args, ['doador', 'ong', 'fornecedor', 'wallet', 'usuario']) ??
    'Carteira indisponível'
  const campaignId = getArgValue(log.args, [
    'campanhaId',
    'idCampanha',
    'id',
    'campaignId',
  ])
  const amount = getArgValue(log.args, ['valor', 'amount', 'quantia'])

  return {
    id: `${type}-${log.transactionHash}-${log.index}`,
    type,
    title:
      type === 'donation'
        ? 'Doação recebida'
        : type === 'campaign'
          ? 'Campanha criada'
          : 'Saque realizado',
    timestamp: formatTimestamp(block),
    wallet: String(wallet),
    campaignId:
      campaignId !== null && campaignId !== undefined
        ? String(campaignId)
        : 'Não informado',
    timestampValue: Number(block?.timestamp ?? 0),
    amount:
      amount !== null && amount !== undefined
        ? `${formatEther(amount)} ETH`
        : 'Não informado',
    txHash: log.transactionHash,
  }
}

async function loadEntriesForEvent(contract, provider, eventName, type) {
  const filter = getEventFilter(contract, eventName)

  if (!filter) {
    return []
  }

  const logs = await contract.queryFilter(filter, 0)
  const blocks = await Promise.all(logs.map((log) => provider.getBlock(log.blockNumber)))

  return logs.map((log, index) =>
    formatHistoryEntry({
      type,
      log,
      block: blocks[index],
    }),
  )
}

export async function fetchPublicHistory() {
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
  const [donations, campaigns, withdrawals] = await Promise.all([
    loadEntriesForEvent(
      contract,
      provider,
      PUBLIC_EVENT_NAMES.donationReceived,
      'donation',
    ),
    loadEntriesForEvent(
      contract,
      provider,
      PUBLIC_EVENT_NAMES.campaignCreated,
      'campaign',
    ),
    loadEntriesForEvent(contract, provider, PUBLIC_EVENT_NAMES.withdrawal, 'withdrawal'),
  ])

  const items = [...donations, ...campaigns, ...withdrawals].sort(
    (left, right) => right.timestampValue - left.timestampValue,
  )

  return {
    status: 'ready',
    items,
    message: items.length
      ? ''
      : `Nenhum evento público encontrado para o contrato ${sepolia.endereco}.`,
  }
}
