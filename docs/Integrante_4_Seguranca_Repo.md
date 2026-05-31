# DoeFacil — Integrante 4
## Função: Testes de segurança, validação de regras de negócio e organização do repositório GitHub

Responsável por garantir que o contrato é robusto (especialmente contra reentrância) e que o projeto está bem organizado e entregue corretamente. Trabalha junto da Int. 1, testando o que ela implementa.

---

### Sprint 1 — Fundação e Setup
- [ ] Criar o repositório no GitHub.
- [ ] Escrever o README inicial do projeto.
- [ ] Adicionar `@denylsonmelo` como colaborador.
- [ ] Definir o board de tarefas (issues/quadro) para a equipe.

**Entrega:** Repositório criado, acessível ao professor e com tarefas organizadas.

---

### Sprint 2 — Testes Unitários
- [ ] Escrever testes para `verificarONG` (só admin pode).
- [ ] Escrever testes para `criarCampanha` (só ONG verificada, meta válida).
- [ ] Escrever testes para `doar` e validar metas e prazos.

**Entrega:** Suíte de testes cobrindo cadastro, campanha e doação passando.

---

### Sprint 3 — Testes de Segurança
- [ ] Escrever um contrato malicioso e um teste de **ataque de reentrância** no `sacar`, provando que o saque é seguro.
- [ ] Testar saque com saldo insuficiente e fornecedor não autorizado.
- [ ] Validar que apenas a ONG dona pode autorizar fornecedores e sacar.

**Entrega:** Prova de que o contrato resiste a reentrância e respeita as regras de saque.

---

### Sprint 4 — Validação Final e Entrega
- [ ] Finalizar o README (instruções de uso, endereço do contrato, integrantes).
- [ ] Conferir que o repositório GitHub está completo e acessível.
- [ ] Organizar a entrega no SUAP (slides em PDF).
- [ ] Documentar a sua parte (segurança) para os slides e participar do ensaio.

**Entrega:** Repositório completo e entrega no SUAP organizada.
