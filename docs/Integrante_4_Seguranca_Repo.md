# DoeFacil — Integrante 4
## Função: Testes de segurança, validação de regras de negócio e organização do repositório GitHub

Responsável por garantir que o contrato é robusto (especialmente contra reentrância) e que o projeto está bem organizado e entregue corretamente. Trabalha junto da Int. 1, testando o que ela implementa.

---

### Sprint 1 — Fundação e Setup
- [x] Criar o repositório no GitHub. _(repo `Vitor-me/DoeFacil`)_
- [x] Escrever o README inicial do projeto. _(`README.md` com objetivo, stack e equipe)_
- [ ] Adicionar `@denylsonmelo` como colaborador. _(não verificável pelo código — conferir nas configurações do repo)_
- [ ] Definir o board de tarefas (issues/quadro) para a equipe. _(não verificável pelo código — conferir no GitHub Projects/Issues)_

**Entrega:** ⚠️ Repositório e README criados; confirmar colaborador e board no GitHub.

---

### Sprint 2 — Testes Unitários
- [ ] Escrever testes para `verificarONG` (só admin pode).
- [ ] Escrever testes para `criarCampanha` (só ONG verificada, meta válida).
- [ ] Escrever testes para `doar` e validar metas e prazos.

**Entrega:** ❌ Pendente. Hoje só existe o smoke test das fixtures (`test/fixtures.test.js`, da Int. 2); não há testes de lógica de negócio.

---

### Sprint 3 — Testes de Segurança
- [ ] Escrever um contrato malicioso e um teste de **ataque de reentrância** no `sacar`, provando que o saque é seguro.
- [ ] Testar saque com saldo insuficiente e fornecedor não autorizado.
- [ ] Validar que apenas a ONG dona pode autorizar fornecedores e sacar.

**Entrega:** ❌ Pendente. Nenhum teste de segurança escrito ainda (o contrato usa `nonReentrant` + CEI, mas falta a prova por teste de ataque).

---

### Sprint 4 — Validação Final e Entrega
- [ ] Finalizar o README (instruções de uso, endereço do contrato, integrantes).
- [ ] Conferir que o repositório GitHub está completo e acessível.
- [ ] Organizar a entrega no SUAP (slides em PDF).
- [ ] Documentar a sua parte (segurança) para os slides e participar do ensaio.

**Entrega:** Repositório completo e entrega no SUAP organizada.
