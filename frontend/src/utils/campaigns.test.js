import { describe, expect, it } from 'vitest'
import { normalizeCampaign, toUnixTimestamp, validarNovaCampanha } from './campaigns'

const UM_ETH = 1000000000000000000n

describe('normalizeCampaign', () => {
  it('converte a struct crua (acesso por nome) para o formato da UI', () => {
    const raw = {
      titulo: 'Cestas Básicas',
      ong: '0xabc',
      meta_arrecadacao: 12n * UM_ETH,
      total_arrecadado: UM_ETH / 2n,
      saldo: UM_ETH / 4n,
      prazo: 1900000000n,
      ativa: true,
    }

    const result = normalizeCampaign(raw, 3)

    expect(result).toEqual({
      id: 'campanha-3',
      onChainId: 3,
      nome: 'Cestas Básicas',
      metaEth: 12,
      arrecadadoEth: 0.5,
      saldoEth: 0.25,
      prazo: 1900000000,
      ativa: true,
      ong: '0xabc',
    })
  })

  it('funciona com struct acessada por índice (tupla ethers v6)', () => {
    const raw = [7n, '0xdef', 'Moradias', 30n * UM_ETH, 0n, 0n, 1800000000n, false]

    const result = normalizeCampaign(raw, 7)

    expect(result.nome).toBe('Moradias')
    expect(result.metaEth).toBe(30)
    expect(result.ativa).toBe(false)
    expect(result.ong).toBe('0xdef')
  })
})

describe('toUnixTimestamp', () => {
  it('converte data YYYY-MM-DD em segundos', () => {
    expect(toUnixTimestamp('2027-01-01')).toBe(Math.floor(Date.parse('2027-01-01') / 1000))
  })

  it('retorna null para entrada vazia ou inválida', () => {
    expect(toUnixTimestamp('')).toBeNull()
    expect(toUnixTimestamp('data-invalida')).toBeNull()
  })
})

describe('validarNovaCampanha', () => {
  const agora = Date.parse('2026-07-02T00:00:00Z')

  it('aceita entrada válida com prazo no futuro', () => {
    const result = validarNovaCampanha(
      { titulo: 'Nova', metaEth: '5', prazo: '2027-01-01' },
      agora,
    )
    expect(result.valido).toBe(true)
  })

  it('rejeita título vazio', () => {
    expect(validarNovaCampanha({ titulo: '  ', metaEth: '5', prazo: '2027-01-01' }, agora).valido).toBe(false)
  })

  it('rejeita meta <= 0', () => {
    expect(validarNovaCampanha({ titulo: 'X', metaEth: '0', prazo: '2027-01-01' }, agora).valido).toBe(false)
  })

  it('rejeita prazo no passado', () => {
    expect(validarNovaCampanha({ titulo: 'X', metaEth: '5', prazo: '2020-01-01' }, agora).valido).toBe(false)
  })

  it('rejeita prazo inválido', () => {
    expect(validarNovaCampanha({ titulo: 'X', metaEth: '5', prazo: '' }, agora).valido).toBe(false)
  })
})
