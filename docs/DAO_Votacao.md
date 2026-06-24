# DoeFacil DAO — Sistema de Votação Descentralizado

## Visão geral
DAO de governança por tokens onde membros votam para verificar ONGs no DoeFacil.
Aprovação executa `verificar_ong` on-chain de forma autônoma.

## Contratos
- `GovToken` (DFG): ERC20 + ERC20Votes; snapshot de poder de voto; `mint` só pelo owner.
- `DoeFacilDAO`: propostas, votação por snapshot (anti voto-duplo), execução com quórum e maioria.

## Parâmetros de governança
- votingPeriod: 300s (demo testnet) | quorum: 20% do supply | proposalThreshold: 1 DFG.

## Fluxo
1. Owner: `mint` tokens aos membros.
2. Cada membro: `delegate(self)` para ativar o voto.
3. Membro: `criarProposta(ongAlvo, descricao)`.
4. Membros: `votar(id, true/false)` dentro do prazo.
5. Após o prazo, se quórum + maioria: qualquer um chama `executar(id)` → ONG verificada.

## Como rodar
- Testes: `cd contracts && npm test`
- Deploy: `cd contracts && npm run deploy:dao:sepolia`

## Endereços na Sepolia
- GovToken: _(preencher após deploy)_
- DoeFacil (da DAO): _(preencher)_
- DoeFacilDAO: _(preencher)_
