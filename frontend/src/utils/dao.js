import { Contract } from 'ethers'
import { getProvider } from './ethers'
import daoInfo from '../contracts/sepoliaDAO.json'
import tokenInfo from '../contracts/sepoliaGovToken.json'

const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'

// Garante carteira conectada na Sepolia e devolve um signer.
async function getSigner() {
  if (!window.ethereum) {
    throw new Error('MetaMask nao encontrada. Instale a extensao para continuar.')
  }
  await window.ethereum.request({ method: 'eth_requestAccounts' })
  const chainId = await window.ethereum.request({ method: 'eth_chainId' })
  if (chainId !== SEPOLIA_CHAIN_ID_HEX) {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    })
  }
  const provider = getProvider()
  return provider.getSigner()
}

function daoContract(signerOrProvider) {
  return new Contract(daoInfo.endereco, daoInfo.abi, signerOrProvider)
}

function tokenContract(signerOrProvider) {
  return new Contract(tokenInfo.endereco, tokenInfo.abi, signerOrProvider)
}

// --- Escritas (precisam de signer / MetaMask) ---

export async function delegar() {
  const signer = await getSigner()
  const token = tokenContract(signer)
  const tx = await token.delegate(await signer.getAddress())
  await tx.wait()
  return { success: true, hash: tx.hash }
}

export async function criarProposta({ ongAlvo, descricao }) {
  const signer = await getSigner()
  const tx = await daoContract(signer).criarProposta(ongAlvo, descricao)
  await tx.wait()
  return { success: true, hash: tx.hash }
}

export async function votar({ id, apoia }) {
  const signer = await getSigner()
  const tx = await daoContract(signer).votar(id, apoia)
  await tx.wait()
  return { success: true, hash: tx.hash }
}

export async function executar({ id }) {
  const signer = await getSigner()
  const tx = await daoContract(signer).executar(id)
  await tx.wait()
  return { success: true, hash: tx.hash }
}

// --- Leituras (so provider) ---

export async function meuPoderDeVoto() {
  const signer = await getSigner()
  const endereco = await signer.getAddress()
  const token = tokenContract(getProvider())
  const votos = await token.getVotes(endereco)
  return votos.toString()
}

export async function listarPropostas() {
  const provider = getProvider()
  if (!provider) return []
  const dao = daoContract(provider)
  const total = Number(await dao.contadorPropostas())
  const itens = []
  for (let id = 1; id <= total; id++) {
    const p = await dao.propostas(id)
    const estado = Number(await dao.estado(id))
    itens.push({
      id,
      ongAlvo: p.ongAlvo,
      descricao: p.descricao,
      votosFavor: p.votosFavor.toString(),
      votosContra: p.votosContra.toString(),
      fim: Number(p.fim),
      estado,
    })
  }
  return itens
}
