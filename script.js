(function() {
    // --- 1. Variáveis de Estado e Referências ao DOM ---
    const chatBody = document.getElementById('chatBody');
    const userInput = document.getElementById('userInput');
    const sendButton = document.querySelector('.send-btn');
    
    // ** SEU NÚMERO DE TELEFONE DO WHATSAPP **
    const WHATSAPP_NUMBER = '5547988241799'; 

    let userName = '';
    let chatActive = true;
    let hasSelectedOption = false;

    const allOptions = ['Manicure', 'Pedicure', 'Esmaltação em Gel', 'Banho de Gel','Alomgamento de Fibra de Vidro', 'Redes'];
    let remainingOptions = [...allOptions];

    // Variáveis de Horário de Atendimento
    const START_HOUR = 8; // 9:00
    const END_HOUR = 17; // 18:00
    const EXPEDIENT_INFO = `${START_HOUR}:00h às ${END_HOUR}:00h`;

    // Variáveis de Estado para o Fluxo de Agendamento
    let appointmentState = 0; // 0: Menu, 3: Aguardando Horário
    let requestedService = '';
    let requestedDate = '';
    let requestedTime = '';
    
    // --- 2. Funções de Utilidade e DOM ---

    function addMessage(sender, text) {
        const msg = document.createElement('div');
        msg.classList.add('message', sender, 'fade-in');
        msg.textContent = text;
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    function toggleInput(state, placeholder = 'Digite uma mensagem...') {
        userInput.disabled = !state;
        sendButton.disabled = !state;
        userInput.placeholder = state ? placeholder : 'Aguarde a resposta do assistente...';
    }

    function addBotResponse(text) {
        const msg = document.createElement('div');
        msg.classList.add('message', 'bot', 'fade-in');
        msg.innerHTML = text; 
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addOptionsMessage() {
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('message', 'bot', 'fade-in');

        let optionsHTML = '';
        
        if (remainingOptions.length > 0) {
            optionsHTML += 'Escolha uma opção abaixo:';
            optionsHTML += `<div class="options-message">`;
            remainingOptions.forEach(option => {
                let icon = '';
                switch(option) {
                    case 'Manicure': icon = '💅✨'; break;
                    case 'Pedicure': icon = '👣'; break;
                    case 'Esmaltação em Gel': icon = '✨💅'; break;
                    case 'Banho de Gel': icon = '💅'; break;
                    case 'Alomgamento de Fibra de Vidro': icon = '💅💎'; break;
                    case 'Redes': icon = '🌐'; break;
                }
                optionsHTML += `<button class="option-btn" data-action="select" data-option="${option}" aria-label="Opção ${option}">${icon} ${option.charAt(0).toUpperCase() + option.slice(1)}</button>`;
            });

            if (hasSelectedOption) {
                optionsHTML += `<button class="option-btn end-btn" data-action="end" aria-label="Encerrar Conversa">Encerrar ChatBot</button>`;
            }

            optionsHTML += `</div>`;
        } else {
            optionsHTML += `
                Todas as opções foram apresentadas.<br>O que deseja fazer agora?
                <div class="options-message">
                    <button class="option-btn reset-btn" data-action="reset">🔄 Voltar ao Menu</button>
                    <button class="option-btn end-btn" data-action="end">Encerrar ChatBot</button>
                </div>
            `;
        }

        optionsContainer.innerHTML = optionsHTML;
        chatBody.appendChild(optionsContainer);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function botTyping(text, delayPerChar = 10, callback = null) {
        toggleInput(false);
        
        const typing = document.createElement('div');
        typing.classList.add('message', 'bot', 'typing');
        typing.textContent = 'Digitando...';
        chatBody.appendChild(typing);
        chatBody.scrollTop = chatBody.scrollHeight;

        const minDelay = 700;
        const typingTime = Math.max(text.length * delayPerChar, minDelay);

        setTimeout(() => {
            typing.remove();
            addBotResponse(text); 
            
            if (chatActive) {
                if (userName && appointmentState === 0) {
                    toggleInput(true, 'Digite uma mensagem...');
                } else if (userName && appointmentState > 0) {
                    toggleInput(true, 'Digite o horário exato (ex: 14:00)...');
                } else if (!userName) {
                    toggleInput(true, 'Digite seu nome...');
                }
            }

            if (callback) callback();
        }, typingTime);
    }
    
    // --- 3. Funções de Validação e Envio ---

    function isValidTimeInExpedient(input) {
        const timeInput = input.includes(':') ? input : input + ':00'; 
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; 
        
        if (!timeRegex.test(timeInput)) return false;

        const [hours, minutes] = timeInput.split(':').map(n => parseInt(n));

        return hours >= START_HOUR && hours < END_HOUR;
    }

    function startTodayScheduling(service) {
        requestedService = service.charAt(0).toUpperCase() + service.slice(1);
        requestedDate = new Date().toLocaleDateString('pt-BR'); 
        
        appointmentState = 3; 
        handleAppointmentFlow(''); 
    }

    function createWhatsappLink() {
        const message = `
Olá Dulcinéia!

*SOLICITAÇÃO DE AGENDAMENTO (Via ChatBot)*
*Cliente:* ${userName}
*Serviço:* ${requestedService}
*Dia:* ${requestedDate} (HOJE)
*Horário Sugerido:* ${requestedTime}

*Aguardando sua confirmação de disponibilidade.*
        `.trim(); 
        
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    }


    // --- 4. Lógica do Fluxo de Agendamento ---

    function handleAppointmentFlow(input) {
        if (input && appointmentState === 3) { 
            addMessage('user', input);
        }
        userInput.value = '';
        toggleInput(false);
        
        if (appointmentState === 3) {
            const timeInput = input.trim(); 

            if (timeInput === '') {
                let responseInfo = `Certo! Para <strong>${requestedService}</strong> hoje (${requestedDate}), nosso expediente é de <strong>${EXPEDIENT_INFO}</strong>.`;
                responseInfo += `<br>Por favor, <strong>digite o horário exato</strong> que você gostaria de ser atendido (Ex: 10:00 ou 16:30).`;
                botTyping(responseInfo, 10, () => {
                    toggleInput(true, 'Digite o horário desejado (Ex: 14:00)...');
                });
                return;
            }

            if (!isValidTimeInExpedient(timeInput)) {
                let responseError = `Horário inválido. Por favor, digite um horário no formato <strong>HH:MM</strong> dentro do nosso expediente (<strong>${EXPEDIENT_INFO}</strong>).`;
                botTyping(responseError, 10, () => { toggleInput(true, 'Digite o horário exato (ex: 14:00)...'); });
                return;
            }
            
            requestedTime = timeInput; 
            
            // FINALIZAÇÃO DO FLUXO
            let responseFinal = `✅ <strong>Solicitação de Agendamento Finalizada!</strong>`;
            responseFinal += `<br>Seu horário sugerido para <strong>${requestedService}</strong> hoje (${requestedDate}) é <strong>${requestedTime}</strong>.`;
            responseFinal += `<br>Para que eu possa <strong>confirmar sua reserva</strong>, clique no botão abaixo para me enviar os dados pelo WhatsApp.`;

            appointmentState = 0; 

            botTyping(responseFinal, 10, () => {
                const finalBlock = document.createElement('div');
                finalBlock.classList.add('message', 'bot', 'fade-in');
                
                finalBlock.innerHTML = `
                    <div class="whatsapp-block">
                        <p>Sua solicitação de agendamento está pronta para ser enviada!</p>
                        <a href="${createWhatsappLink()}" target="_blank" class="whatsapp-btn">
                            📲 Enviar Solicitação para WhatsApp
                        </a>
                    </div>
                `;
                chatBody.appendChild(finalBlock);
                chatBody.scrollTop = chatBody.scrollHeight;
                
                setTimeout(() => {
                    remainingOptions = [...allOptions];
                    addOptionsMessage();
                }, 500);
            });
        }
    }

    // --- 5. Funções de Controle do Chat ---

    function sendMessage() {
        const text = userInput.value.trim();
        if (text === '' || !chatActive || userInput.disabled) return;

        if (!userName) {
            if (text.length < 2) {
                botTyping('Por favor, digite um nome válido e com no mínimo 2 caracteres.', 10, () => {
                    toggleInput(true, 'Digite seu nome...');
                });
                userInput.value = '';
                return;
            }

            userName = text;
            addMessage('user', userName);
            userInput.value = '';
            userInput.placeholder = 'Digite uma mensagem...'; 
            botTyping(`Seja bem-vindo(a), ${userName}! Estou aqui para apresentar meus serviços.`, 10, () => {
                addOptionsMessage();
            });
            return;
        }

        if (appointmentState > 0) {
            handleAppointmentFlow(text);
            return;
        }

        addMessage('user', text);
        userInput.value = '';
        
        botTyping(`Para demais dúvidas, ${userName}, entre em contato comigo via <a href="http://wa.me//${WHATSAPP_NUMBER}" target="_blank">WhatsApp</a>.`, 10, () => {
            addOptionsMessage(); 
        });
    }

    function selectOption(option) {
        if (!chatActive) return;
        if (!allOptions.includes(option)) return; 
        
        hasSelectedOption = true;
        addMessage('user', option.charAt(0).toUpperCase() + option.slice(1));

        let response = '';
        
        switch(option) {
            case 'Manicure':
                response = `💅✨ <strong>Manicure Tradicional</strong>: Manicure tradicional é o cuidado básico e clássico das unhas das mãos.
Ela deixa as unhas limpas, bonitas e bem cuidadas..`;
                break;
            case 'Pedicure':
                response = `👣 <strong>Pedicure</strong>: Pedicure é um cuidado essencial para manter os pés bonitos, saudáveis 
                e bem tratados. O serviço inclui corte e lixamento das unhas, cuidado com as cutículas, remoção de calosidades 
                quando necessário e esmaltação para deixar os pés ainda mais lindos e delicados.`;
                break;
            case 'Esmaltação em Gel':
                response = `✨💅 <strong>Esmaltação em Gel</strong>: A esmaltação em gel é ideal para quem deseja unhas 
                lindas por muito mais tempo. O gel proporciona brilho intenso, maior durabilidade e mantém as unhas impecáveis por semanas.`;
                break;
            case 'Banho de Gel':
                response = `💅 <strong>Banho de Gel</strong>: Unhas naturais mais fortes e lindas! O banho de gel ajuda a proteger, fortalecer 
                e manter suas unhas com brilho e aparência impecável por muito mais tempo.`;
                break;
            case 'Alomgamento de Fibra de Vidro':
                response = `💅💎 <strong>Alomgamento de Fibra de Vidro</strong>: O alongamento em fibra de vidro é ideal para quem deseja unhas 
                longas, resistentes e com acabamento natural. A técnica utiliza filamentos de fibra que são moldados sobre as unhas, proporcionando 
                durabilidade, leveza e um resultado sofisticado.`;
                break;
            case 'Redes':
                response = `🌐 <strong>Minhas Redes Sociais</strong>:<br>
                                     <a href="https://www.instagram.com/dulcinails_designer" target="_blank">📸 Instagram</a><br>
                                     <a href="http://wa.me//${WHATSAPP_NUMBER}" target="_blank">💬 WhatsApp</a><br>`;
                break;
        }

        remainingOptions = remainingOptions.filter(opt => opt !== option);

        botTyping(response, 10, () => {
            const isService = ['Manicure', 'Pedicure', 'Esmaltação em Gel', 'Banho de Gel', 'Alomgamento de Fibra de Vidro'].includes(option);

            if (isService) {
                const agendamentoBlock = document.createElement('div');
                agendamentoBlock.classList.add('message', 'bot', 'fade-in');
                
                const serviceLabel = option.charAt(0).toUpperCase() + option.slice(1);
                
                agendamentoBlock.innerHTML = `
                    <p>Se você gostou de <strong>${serviceLabel}</strong>, inicie uma solicitação de agendamento para <strong>HOJE</strong>!</p>
                    <div class="options-message">
                        <button class="option-btn" data-action="schedule-today" data-service="${option}">📅 Solicitar Agendamento para Hoje</button>
                    </div>
                `;
                chatBody.appendChild(agendamentoBlock);
                chatBody.scrollTop = chatBody.scrollHeight;
            }

            setTimeout(() => addOptionsMessage(), 300);
        });
    }

    function resetMenu() {
        if (!chatActive) return;
        remainingOptions = [...allOptions];
        addMessage('user', '🔄 Voltar ao Menu');
        botTyping('As opções foram restauradas. Escolha uma delas abaixo:', 10, () => addOptionsMessage());
    }

    function fullReset() {
        chatBody.innerHTML = '';
        userName = '';
        appointmentState = 0;
        chatActive = true;
        hasSelectedOption = false;
        remainingOptions = [...allOptions];
        addBotResponse('Olá! 👋 Sou o assistente da Dulcinéia. Qual é o seu nome?');
        toggleInput(true, 'Digite seu nome...');
    }

    function endChat() {
        if (!chatActive) return;
        addMessage('user', 'Encerrar ChatBot');
        chatActive = false;
        toggleInput(false, 'Chat encerrado.'); 

        botTyping(`O chat foi encerrado. Até logo, ${userName}! 👋`, 10, () => {
            const restartBlock = document.createElement('div');
            restartBlock.classList.add('message', 'bot', 'fade-in');
            
            restartBlock.innerHTML = `
                <p>Se precisar de algo mais, clique no botão abaixo para começar uma nova conversa.</p>
                <button class="restart-btn" data-action="full-reset">👋 Reiniciar Conversa</button>
            `;
            chatBody.appendChild(restartBlock);
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    }

    // --- 6. Event Listeners (Delegation) ---

    chatBody.addEventListener('click', (e) => {
        const target = e.target.closest('.option-btn, .restart-btn');
        if (!target) return;

        const action = target.getAttribute('data-action');
        const option = target.getAttribute('data-option');
        const service = target.getAttribute('data-service');
        
        if (appointmentState > 0 && action !== 'end' && action !== 'full-reset') return; 

        if (action === 'select' && option) {
            selectOption(option);
        } else if (action === 'schedule-today' && service) {
            toggleInput(false); 
            startTodayScheduling(service);
        } else if (action === 'end') {
            endChat();
        } else if (action === 'reset') {
            resetMenu();
        } else if (action === 'full-reset') {
            fullReset();
        }
    });

    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });

    // 7. Inicialização
    toggleInput(true, 'Digite seu nome...');

})();