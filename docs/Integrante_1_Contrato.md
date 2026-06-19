# DoeFacil — Integrante 1
## Função: Smart Contract (Solidity) e testes unitários no Hardhat

Responsável pelo núcleo do projeto: o contrato inteligente. Trabalha junto da Int. 4 (que escreve os testes de segurança) e entrega a base que a Int. 3 consome no front-end.

---

### Sprint 1 — Fundação e Setup
- [x] Modelar as `structs` do contrato: `Campanha` (ong, título, meta, prazo, arrecadado, sacado, ativa) e `ONG` (nome, verificada). _(structs `Campanha` e `ONG` em `DoeFacil.sol`; usa `saldo` no lugar de `sacado`)_
- [x] Escrever o esqueleto do contrato `DoeFacil` em Solidity importando OpenZeppelin (`Ownable`, `ReentrancyGuard`). _(`DoeFacil is Ownable, ReentrancyGuard`)_
- [x] Garantir que o contrato compila sem erros no Hardhat.

**Entrega:** ✅ Contrato com a estrutura de dados definida e compilando.

---

### Sprint 2 — Lógica Central do Contrato
- [x] Implementar `verificarONG` (apenas admin/owner). _(`verificar_ong` com `onlyOwner`)_
- [x] Implementar `criarCampanha` (somente ONG verificada, com meta e prazo). _(`criar_campanha` valida ONG verificada, meta > 0 e prazo futuro)_
- [x] Implementar `doar` (recebe ETH, registra valor por doador e atualiza arrecadado). _(`doar` payable + nonReentrant)_
- [x] Emitir os eventos: `ONGVerificada`, `CampanhaCriada`, `DoacaoRecebida`. _(emitidos como `ong_verificada`, `campanha_criada`, `doacao_recebida`)_

**Entrega:** ✅ Doações funcionando localmente com histórico registrado via eventos.

---

### Sprint 3 — Saque Seguro
- [x] Implementar `autorizarFornecedor` (só a ONG dona da campanha). _(`autorizar_fornecedor`)_
- [x] Implementar `sacar` seguindo o padrão **Checks-Effects-Interactions**. _(`sacar` com `nonReentrant`; debita saldo antes do `.call`)_
- [x] Adicionar funções de consulta de saldo da campanha. _(`consultar_saldo`)_
- [ ] Emitir os eventos: `FornecedorAutorizado`, `Saque`. _(falta: `autorizar_fornecedor` não emite evento; `Saque` existe como `saque_realizado`)_

**Entrega:** ✅ Saque seguro funcionando, restrito a fornecedores autorizados. _(pendente: emitir evento na autorização de fornecedor)_

---

### Sprint 4 — Validação Final
- [ ] Revisar todo o código do contrato e comentar as funções.
- [ ] Ajustar o que os testes da Int. 4 apontarem.
- [ ] Documentar a sua parte (lógica do contrato) para os slides.
- [ ] Participar do ensaio da apresentação e da divisão das perguntas.

**Entrega:** Contrato revisado, comentado e pronto para a demonstração.
