import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers'
import sepolia from '../contracts/sepolia.json'

const SEPOLIA_CHAIN_ID = Number(sepolia.chainId)
const SEPOLIA_CHAIN_ID_HEX = `0x${SEPOLIA_CHAIN_ID.toString(16)}`
const SEPOLIA_CHAIN_NAME = 'Sepolia'

export { parseEther, formatEther, SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_NAME }

export function getProvider() {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null
  }

  return new BrowserProvider(window.ethereum)
}

export function isMetaMaskInstalled() {
  return Boolean(getProvider())
}

export function isSepoliaChain(chainId) {
  return Number(chainId) === SEPOLIA_CHAIN_ID
}

export function formatWalletAddress(address) {
  if (!address) {
    return ''
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getNetworkLabel(chainId) {
  if (!chainId) {
    return 'Rede não identificada'
  }

  return isSepoliaChain(chainId) ? SEPOLIA_CHAIN_NAME : `Chain ID ${chainId}`
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask não instalada.')
  }

  const provider = getProvider()
  await provider.send('eth_requestAccounts', [])
  return getWalletState()
}

export async function ensureSepolia() {
  if (!window.ethereum) {
    throw new Error('MetaMask não instalada.')
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
            chainName: SEPOLIA_CHAIN_NAME,
            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      })
    } else {
      throw new Error('Rede incorreta (não Sepolia).', {
        cause: err,
      })
    }
  }
}

export async function getWalletState() {
  const provider = getProvider()

  if (!provider) {
    return {
      account: '',
      balanceInWei: '',
      chainId: null,
      isMetaMaskInstalled: false,
      isConnected: false,
      isSepolia: false,
    }
  }

  const accounts = await provider.send('eth_accounts', [])
  const network = await provider.getNetwork()
  const account = accounts[0] ?? ''
  let balanceInWei = ''

  if (account) {
    const balance = await provider.getBalance(account)
    balanceInWei = balance.toString()
  }

  return {
    account,
    balanceInWei,
    chainId: Number(network.chainId),
    isMetaMaskInstalled: true,
    isConnected: Boolean(account),
    isSepolia: isSepoliaChain(Number(network.chainId)),
  }
}

export function subscribeToWalletEvents({
  onAccountsChanged,
  onChainChanged,
}) {
  if (typeof window === 'undefined' || !window.ethereum) {
    return () => {}
  }

  if (onAccountsChanged) {
    window.ethereum.on('accountsChanged', onAccountsChanged)
  }

  if (onChainChanged) {
    window.ethereum.on('chainChanged', onChainChanged)
  }

  return () => {
    if (onAccountsChanged) {
      window.ethereum.removeListener('accountsChanged', onAccountsChanged)
    }

    if (onChainChanged) {
      window.ethereum.removeListener('chainChanged', onChainChanged)
    }
  }
}

export async function getContract() {
  const provider = getProvider()
  if (!provider) {
    throw new Error('MetaMask não instalada.')
  }

  await ensureSepolia()
  const signer = await provider.getSigner()
  return new Contract(sepolia.endereco, sepolia.abi, signer)
}

export async function getReadOnlyContract() {
  const provider = getProvider()

  if (!provider) {
    throw new Error('MetaMask não instalada.')
  }

  await ensureSepolia()
  return new Contract(sepolia.endereco, sepolia.abi, provider)
}
