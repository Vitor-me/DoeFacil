import { BrowserProvider, Contract, parseEther } from 'ethers'
import sepolia from '../contracts/sepolia.json'

// Sepolia: 11155111 em hex.
const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'

export { parseEther }

export function getProvider() {
  if (!window.ethereum) {
    return null
  }

  return new BrowserProvider(window.ethereum)
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask nao encontrado. Instale a extensao para continuar.')
  }

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  return accounts[0]
}

export async function ensureSepolia() {
  if (!window.ethereum) {
    throw new Error('MetaMask nao encontrado. Instale a extensao para continuar.')
  }

  const chainId = await window.ethereum.request({ method: 'eth_chainId' })
  if (chainId === SEPOLIA_CHAIN_ID_HEX) {
    return
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    })
  } catch (err) {
    // 4902 = rede desconhecida no MetaMask; adiciona e tenta de novo.
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID_HEX,
            chainName: 'Sepolia',
            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      })
    } else {
      throw err
    }
  }
}

export async function getContract() {
  const provider = getProvider()
  if (!provider) {
    throw new Error('MetaMask nao encontrado. Instale a extensao para continuar.')
  }

  await ensureSepolia()
  const signer = await provider.getSigner()
  return new Contract(sepolia.endereco, sepolia.abi, signer)
}
