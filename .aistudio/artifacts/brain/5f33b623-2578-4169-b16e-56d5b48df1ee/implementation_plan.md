# SimulaGaivota - Novos Modos de Estudo e Fixação Ativa

Proposta detalhada de expansão dos modos de estudo e parâmetros de geração de questões, incorporando técnicas comprovadas de aprendizagem ativa militar (*Active Recall*, *Repetição Espaçada*, *Flashcards com Gaivotas* e *Drill Tático*).

## User Review & Critical Decisions

> [!IMPORTANT]
> Aguardando sua aprovação para incluir na aplicação:
> - **Seleção de Parâmetros de Geração**:
>   - Quantidade de questões: personalizável (5, 10, 15, 20 ou livre).
>   - Nível de dificuldade: Fácil (conceitos diretos e definições), Médio (aplicação prática do RDE e procedimentos) e Difícil (situações-problema complexas e detalhes de prazos/escalões).
> - **Modos de Estudo Disponíveis**:
>   1. **Modo Simulado Oficial**: Ambiente de prova completa com tempo, gabarito e relatório final de gaivotas.
>   2. **Modo Flashcards 3D com Gaivota Discursiva**: O cartão exibe a questão na frente com campo para o aluno redigir ou pensar a resposta. Ao virar em animação 3D, revela o espelho oficial e permite autoatribuição das gaivotas ganhas.
>   3. **Modo Drill Tático (Tiro Rápido)**: Desafio de fixação rápida focado em artigos-chave do RDE, calibres, medidas, prazos e definições militares diretas.
>   4. **Modo Revisão de Gaivotas Perdidas (Caderno de Erros)**: Filtra automaticamente apenas os itens/critérios onde o aluno não conquistou a gaivota para repetição espaçada.

---

## 1. Visão Geral dos Novos Modos de Estudo

### A. Painel de Configuração Pré-Estudo (Setup Modal/Screen)
Ao iniciar uma nova sessão ou gerar a partir de um material/apostila, o aluno escolhe:
1. **Modo de Estudo**:
   - `Simulado Oficial` (Prova corrida com cronômetro)
   - `Flashcards com Gaivotas` (Frente e Verso com resposta discursiva)
   - `Drill Tático` (Tiro Rápido contra o relógio)
   - `Revisão de Erros` (Apenas itens não pontuados)
2. **Volume**: Seletor de questões (5, 10, 15, 20 ou personalizado).
3. **Nível de Exigência**:
   - *Fácil*: Questões conceituais diretas (ex: listar 2 princípios ou 2 punições).
   - *Médio*: Padrão das provas reais do CFC/CFS (ex: 3 a 4 itens solicitados com aplicação da norma).
   - *Difícil*: Padrão CAS/CHQAO com exigência doutrinária estrita, exceções a regras e prazos regimentais.
4. **Disciplina / Matéria**: Filtro por tema (RDE, Estatuto dos Militares, Armamento FAL 7.62, Tática de Frações ou Todos).

---

### B. Flashcards 3D com Gaivotas Discursivas (Active Recall)
- **Frente do Card**:
  - Número do card, matéria e badge discreto de dificuldade (*Fácil / Médio / Difícil*).
  - Enunciado da questão (ex: *"Cite 3 circunstâncias atenuantes no RDE"*).
  - Indicador de gaivotas em disputa (ex: `3 Gaivotas em disputa`).
  - Campo de rascunho de resposta (o aluno pode redigir por escrito ou responder mentalmente).
  - Botão de ação: `"Virar Cartão & Conferir Gaivotas"`.
- **Verso do Card (Giro 3D Fluido)**:
  - Espelho de resposta militar completo.
  - Lista de critérios com gaivotas interativas:
    - `[✓] Critério 1: Bom comportamento anterior`
    - `[✓] Critério 2: Evitar mal maior ou legítima defesa`
    - `[✓] Critério 3: Falta de prática do serviço`
  - O aluno marca as gaivotas que acertou.
  - Avaliação de retenção no rodapé: *Errei* (revisar em breve), *Bom* (revisar depois), *Fácil* (consolidado).

---

### C. Drill Tático / Tiro Rápido (Método Adicional de Fixação)
- Focado na memorização exata de termos, prazos e artigos do Exército Brasileiro (ex: prazo para recurso disciplinar, alcance útil do FAL, escala de punições).
- Temporizador curto por questão (ex: 30 a 45 segundos), estimulando raciocínio imediato sob pressão sem hesitação.

---

### D. Modo Revisão de Gaivotas Perdidas (Repetição Espaçada)
- O sistema registra automaticamente toda questão onde o aluno não obteve a totalidade das gaivotas (ex: ganhou 2 de 3).
- Cria uma lista especial de reforço que reapresenta especificamente os critérios pendentes até que o aluno atinja 100% de aproveitamento.

---

## 2. Experiência de Uso & Layout Responsivo

- **Celular**:
  - Gesto de toque e arraste (*swipe*) para avançar cards de estudo.
  - Teclado mobile fluido com campo de redação integrado.
  - Botões de autoavaliação posicionados na zona natural do polegar (inferior 40% da tela).
- **Desktop**:
  - Teclas de atalho convenientes: `Espaço` (virar card), `1 / 2 / 3` (marcar gaivotas), `Enter` (próximo card).
  - Card centralizado com perspectiva 3D realista (`perspective: 1000px`, `transform-style: preserve-3d`).

---

## 3. Arquitetura Técnica

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CONFIGURADOR DE ESTUDO                          │
│  - Quantidade: [ 5 | 10 | 15 | 20 ]                                   │
│  - Nível: [ Fácil | Médio | Difícil ]                                 │
│  - Modo: [ Simulado | Flashcards 3D | Drill Tático | Erros ]          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────┴───────────────────────────┐
       ▼                                                        ▼
┌───────────────────────────────┐        ┌───────────────────────────────┐
│        MODO SIMULADO          │        │        MODO FLASHCARDS        │
│  - Visão de prova oficial     │        │  - Frente: Pergunta + Redação │
│  - Cronômetro & Navegador     │        │  - Flip 3D: Resposta + Vistos │
│  - Correção IA / Manual       │        │  - Autoavaliação de Gaivotas  │
└───────────────────────────────┘        └───────────────────────────────┘
```

Aguardando sua confirmação para integrar esses modos e controles diretamente no layout e na interface!
