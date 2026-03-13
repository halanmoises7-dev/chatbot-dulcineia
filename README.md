# 💅 ChatBot de Agendamento - Dulcinails

Este é um chatbot interativo desenvolvido para facilitar o atendimento e agendamento de serviços de manicure e pedicure. O sistema guia o usuário através de um menu de serviços, coleta informações de agendamento e direciona o fechamento para o WhatsApp.

## 🚀 Funcionalidades

- **Apresentação de Serviços**: Menu interativo com descrição de cada procedimento.
- **Fluxo de Agendamento Inteligente**:
  - Solicitação de nome do cliente.
  - Seleção de data com **bloqueio automático de Domingos e Segundas-feiras**.
  - Validação de horários dentro do período de expediente (08:00 às 17:00).
- **Integração com WhatsApp**: Gera um link personalizado com todos os dados da reserva prontos para envio.
- **Interface Responsiva**: Design limpo e adaptável para dispositivos móveis e desktop.

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura da página.
- **CSS3**: Estilização e animações de mensagens.
- **JavaScript (Vanilla)**: Lógica do chatbot, validações de data/hora e manipulação do DOM.

## 📅 Regras de Negócio Implementadas

1. **Dias de Atendimento**: O sistema não permite agendamentos para domingos ou segundas-feiras.
2. **Horário de Expediente**: Os horários válidos são apenas entre 08:00 e 16:59.
3. **Persistência de Nome**: O bot memoriza o nome do usuário durante a sessão para um atendimento personalizado.
4. **Prevenção de Erros**: Validação de datas passadas ou formatos inválidos.