// index.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Sua configuração do Firebase
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elementos do DOM
const pontosTableBody = document.getElementById('pontosTableBody');
const searchAgencyInput = document.getElementById('searchAgency');
const cadastrarNovoPontoButton = document.getElementById('cadastrarNovoPontoButton');
const messageBox = document.getElementById('messageBox');
const logoutButton = document.getElementById('logoutButton');

// Elementos do novo sistema de notificação
const notificationIconContainer = document.getElementById('notificationIconContainer');
const notificationBadge = document.getElementById('notificationBadge');
const notificationPopup = document.getElementById('notificationPopup');
const notificationList = document.getElementById('notificationList');

let allPontos = [];
let allExpiringWarnings = []; // Para armazenar os avisos globalmente

// Função para exibir mensagens na caixa de mensagem principal
function showMessage(message, type = 'error') {
    messageBox.textContent = message;
    messageBox.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
    if (type === 'error') {
        messageBox.classList.add('bg-red-100', 'text-red-700');
    } else {
        messageBox.classList.add('bg-green-100', 'text-green-700');
    }
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 5000);
}

// Função para renderizar os pontos na tabela
function renderPontos(pontosToRender) {
    pontosTableBody.innerHTML = '';
    if (pontosToRender.length === 0) {
        const row = pontosTableBody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 5;
        cell.textContent = 'Nenhum ponto encontrado.';
        cell.classList.add('py-3', 'px-6', 'text-center', 'text-gray-500');
        return;
    }
    pontosToRender.forEach(ponto => {
        const row = pontosTableBody.insertRow();
        row.classList.add('border-b', 'border-gray-200', 'hover:bg-gray-50');
        row.dataset.id = ponto.id;

        const agenciaCell = row.insertCell(0);
        agenciaCell.textContent = ponto.agencia;
        agenciaCell.classList.add('py-3', 'px-6', 'text-left', 'whitespace-nowrap');

        const nomePontoCell = row.insertCell(1);
        nomePontoCell.textContent = ponto.nomePonto;
        nomePontoCell.classList.add('py-3', 'px-6', 'text-left');

        const acoesCell = row.insertCell(2);
        acoesCell.classList.add('py-3', 'px-6', 'text-left', 'flex', 'items-center', 'space-x-2');

        const sendEmailBtn = document.createElement('button');
        sendEmailBtn.textContent = 'Enviar Email';
        sendEmailBtn.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'font-bold', 'py-1', 'px-2', 'rounded-md', 'text-xs', 'transition', 'duration-150', 'ease-in-out');
        sendEmailBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleSendEmail(ponto);
        });
        acoesCell.appendChild(sendEmailBtn);

        const editBtn = document.createElement('button');
        editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>`;
        editBtn.classList.add('text-gray-500', 'hover:text-green-500', 'focus:outline-none');
        editBtn.title = 'Editar Ponto';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `cadastro-ponto.html?id=${ponto.id}`;
        });
        acoesCell.appendChild(editBtn);

        const precisaEmailCell = row.insertCell(3);
        precisaEmailCell.classList.add('py-3', 'px-6', 'text-center');

        const statusEmailDot = document.createElement('div');
        statusEmailDot.classList.add('w-4', 'h-4', 'rounded-full', 'mx-auto');
        if (ponto.precisaEmailLiberacao === true) {
            statusEmailDot.classList.add('bg-yellow-500');
            statusEmailDot.title = 'Precisa de email de liberação: SIM';
        } else if (ponto.precisaEmailLiberacao === false) {
            statusEmailDot.classList.add('bg-green-500');
            statusEmailDot.title = 'Precisa de email de liberação: NÃO';
        } else {
            statusEmailDot.classList.add('bg-gray-400');
            statusEmailDot.title = 'Precisa de email de liberação: Não definido';
        }
        precisaEmailCell.appendChild(statusEmailDot);

        const precisaIntegracaoCell = row.insertCell(4);
        precisaIntegracaoCell.classList.add('py-3', 'px-6', 'text-center');

        const statusIntegracaoDot = document.createElement('div');
        statusIntegracaoDot.classList.add('w-4', 'h-4', 'rounded-full', 'mx-auto');
        if (ponto.precisaIntegracao === true) {
            statusIntegracaoDot.classList.add('bg-yellow-500');
            statusIntegracaoDot.title = 'Precisa de integração: SIM';
        } else if (ponto.precisaIntegracao === false) {
            statusIntegracaoDot.classList.add('bg-green-500');
            statusIntegracaoDot.title = 'Precisa de integração: NÃO';
        } else {
            statusIntegracaoDot.classList.add('bg-gray-400');
            statusIntegracaoDot.title = 'Precisa de integração: Não definido';
        }
        precisaIntegracaoCell.appendChild(statusIntegracaoDot);
    });
}

// Função para verificar os vencimentos de ASO e Ficha EPI (melhorada para exibir no pop-up)
function checkExpirations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiringWarnings = [];

    allPontos.forEach(ponto => {
        if (ponto.tecnicosIntegrados && Array.isArray(ponto.tecnicosIntegrados)) {
            ponto.tecnicosIntegrados.forEach(tecnico => {
                // Verifica ASO
                if (tecnico.aso) {
                    const asoDate = new Date(tecnico.aso + 'T00:00:00');
                    asoDate.setHours(0, 0, 0, 0);
                    const diffTimeAso = asoDate.getTime() - today.getTime();
                    const diffDaysAso = Math.ceil(diffTimeAso / (1000 * 60 * 60 * 24));

                    if (diffDaysAso <= 30) {
                        expiringWarnings.push({
                            type: 'ASO',
                            pontoNome: ponto.nomePonto,
                            agencia: ponto.agencia,
                            tecnicoNome: tecnico.nome,
                            date: tecnico.aso,
                            daysRemaining: diffDaysAso
                        });
                    }
                }
                
                // Verifica Ficha EPI
                if (tecnico.fichaEpi) {
                    const epiDate = new Date(tecnico.fichaEpi + 'T00:00:00');
                    epiDate.setHours(0, 0, 0, 0);
                    const diffTimeEpi = epiDate.getTime() - today.getTime();
                    const diffDaysEpi = Math.ceil(diffTimeEpi / (1000 * 60 * 60 * 24));

                    if (diffDaysEpi <= 30) {
                        expiringWarnings.push({
                            type: 'Ficha EPI',
                            pontoNome: ponto.nomePonto,
                            agencia: ponto.agencia,
                            tecnicoNome: tecnico.nome,
                            date: tecnico.fichaEpi,
                            daysRemaining: diffDaysEpi
                        });
                    }
                }
            });
        }
    });

    allExpiringWarnings = expiringWarnings;

    if (expiringWarnings.length > 0) {
        notificationBadge.textContent = expiringWarnings.length;
        notificationBadge.classList.remove('hidden');
    } else {
        notificationBadge.classList.add('hidden');
    }
}


// Função para preencher o pop-up de notificação
function renderNotificationPopup() {
    notificationList.innerHTML = '';
    if (allExpiringWarnings.length > 0) {
        allExpiringWarnings.forEach(warning => {
            const warningDiv = document.createElement('div');
            let message = `O <strong>${warning.type}</strong> de <strong>${warning.tecnicoNome}</strong> (Ponto: ${warning.agencia} - ${warning.pontoNome}) vence em <strong>`;
            
            if (warning.daysRemaining < 0) {
                 message += `${Math.abs(warning.daysRemaining)} dias atrás`;
            } else if (warning.daysRemaining === 0) {
                message += `hoje`;
            } else {
                message += `${warning.daysRemaining} dias`;
            }
            message += `</strong> (${warning.date}).`;

            warningDiv.innerHTML = message;
            warningDiv.classList.add('border-b', 'border-gray-200', 'pb-2', 'last:border-0');
            notificationList.appendChild(warningDiv);
        });
    } else {
        notificationList.innerHTML = `<p>Nenhum aviso de vencimento próximo ou vencido.</p>`;
    }
}


const multipleEmailsRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))(\s*[;,]\s*(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})))*$/;


function handleSendEmail(pontoData) {
    const recipientEmail = pontoData.email ? pontoData.email.trim() : '';
    const agencia = pontoData.agencia || '';
    const nomePonto = pontoData.nomePonto || '';

    if (!recipientEmail) {
        showMessage('O ponto não possui um email cadastrado para envio.', 'error');
        return;
    }
    if (!multipleEmailsRegex.test(recipientEmail)) {
        showMessage('Formato de email do destinatário inválido. Verifique se os emails estão separados por vírgula ou ponto e vírgula.', 'error');
        return;
    }

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'bom dia' : 'boa tarde';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tomorrowYear = tomorrow.getFullYear();
    const tomorrowDateFormatted = `${tomorrowDay}/${tomorrowMonth}/${tomorrowYear}`;

    const subject = encodeURIComponent(`Liberação de Acesso - ${agencia} ${nomePonto}`);

    let body = `Prezados ${greeting},\n\n`;
    body += `Amanhã, ${tomorrowDateFormatted}, iremos ter um atendimento de manutenção corretiva em um dos caixa eletrônico do ponto, poderia por favor liberar a entrada do nosso técnico ao local?\n\n`;

    const tecnicos = [];
    if (pontoData.tecnicosIntegrados && Array.isArray(pontoData.tecnicosIntegrados)) {
        pontoData.tecnicosIntegrados.forEach(tec => {
            let tecnicoDetails = `Nome: ${tec.nome || 'N/A'}\n`;
            tecnicoDetails += `CPF: ${tec.cpf || 'N/A'}\n`;
            if (tec.rg && tec.rg.trim() !== '') {
                tecnicoDetails += `RG: ${tec.rg.trim()}\n`;
            }
            if (tec.veiculo && tec.veiculo.trim() !== '') {
                tecnicoDetails += `Veículo: ${tec.veiculo.trim()}`;
                if (tec.corCarro && tec.corCarro.trim() !== '') {
                    tecnicoDetails += `, Cor: ${tec.corCarro.trim()}`;
                }
                tecnicoDetails += `\n`;
            }
            if (tec.placa && tec.placa.trim() !== '') {
                tecnicoDetails += `Placa: ${tec.placa.trim()}\n`;
            }
            tecnicos.push(tecnicoDetails);
        });
    }

    if (tecnicos.length > 0) {
        body += `Dados do(s) técnico(s):\n\n`;
        tecnicos.forEach(tecDetails => {
            body += `----------------------------------------\n`;
            body += `${tecDetails}\n`;
        });
        body += `----------------------------------------\n`;
    } else {
        body += `Nenhum técnico integrado encontrado para este ponto.\n`;
    }

    body += `\nAtenciosamente,\nSua Equipe`;

    const cleanedRecipients = recipientEmail.replace(/,/g, ';');
    const formattedRecipients = cleanedRecipients.split(';').map(email => email.trim()).filter(email => email !== '').join(';');

    const mailtoLink = `mailto:${encodeURIComponent(formattedRecipients)}?subject=${subject}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    showMessage('Abrindo seu cliente de email...', 'success');
}

// Listener em tempo real para a coleção 'pontos'
onAuthStateChanged(auth, (user) => {
    if (user) {
        const q = query(collection(db, "pontos"), orderBy("agencia"));
        onSnapshot(q, (snapshot) => {
            allPontos = [];
            snapshot.forEach((doc) => {
                allPontos.push({ id: doc.id, ...doc.data() });
            });
            filterAndRenderPontos();
            checkExpirations();
        }, (error) => {
            console.error("Erro ao carregar pontos do Firestore:", error);
            showMessage("Erro ao carregar pontos. Verifique sua conexão.", "error");
        });
    } else {
        window.location.href = 'login.html';
    }
});

// Evento de clique para mostrar/esconder o pop-up de notificação
notificationIconContainer.addEventListener('click', (event) => {
    event.stopPropagation(); // Impede que o clique se propague para o documento
    if (notificationPopup.classList.contains('hidden')) {
        renderNotificationPopup();
        notificationPopup.classList.remove('hidden');
    } else {
        notificationPopup.classList.add('hidden');
    }
});

// Esconde o pop-up de notificação se clicar fora
document.addEventListener('click', (event) => {
    if (!notificationPopup.classList.contains('hidden') && !notificationPopup.contains(event.target) && event.target !== notificationIconContainer) {
        notificationPopup.classList.add('hidden');
    }
});


// Função para filtrar e renderizar pontos com base no input de busca
function filterAndRenderPontos() {
    const searchTerm = searchAgencyInput.value.trim();
    let filteredPontos = allPontos;

    if (searchTerm) {
        filteredPontos = allPontos.filter(ponto =>
            ponto.agencia.includes(searchTerm) ||
            ponto.nomePonto.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    renderPontos(filteredPontos);
}

// Event Listener para o campo de busca
searchAgencyInput.addEventListener('input', filterAndRenderPontos);

// Event Listener para o botão "CADASTRAR NOVO PONTO"
cadastrarNovoPontoButton.addEventListener('click', () => {
    window.location.href = 'cadastro-ponto.html';
});

// Event listener para o botão de Sair (Logout)
logoutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("Usuário deslogado.");
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        showMessage("Erro ao fazer logout. Tente novamente.", "error");
    }
});