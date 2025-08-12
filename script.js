// AQUI: Cole o seu objeto firebaseConfig do Console do Firebase
// Certifique-se de que a apiKey, authDomain, projectId, etc. são as SUAS informações.
const firebaseConfig = {
    apiKey: "AIzaSyDSYwYxg4nJ2tsuRDJcW4XAnLBmPtvODqw", // SEU API KEY AQUI
    authDomain: "pabpae-18647.firebaseapp.com", // SEU AUTH DOMAIN AQUI
    projectId: "pabpae-18647", // SEU PROJECT ID AQUI
    storageBucket: "pabpae-18647.firebasestorage.app", // SEU STORAGE BUCKET AQUI
    messagingSenderId: "456526227091", // SEU MESSAGING SENDER ID AQUI
    appId: "1:456526227091:web:59a83dd513721877a30f66", // SEU APP ID AQUI
    measurementId: "G-TC306C9MNX" // SEU MEASUREMENT ID AQUI
};

// Importa as funções necessárias do Firebase SDK (versão 12.0.0)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
// getDoc, updateDoc, deleteDoc foram adicionados!

// Inicializa o Firebase e obtém as instâncias de auth e db
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Elementos do DOM ---
const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const btnLogin = document.getElementById('btn-login');

const linkToRegister = document.getElementById('link-to-register');

const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerConfirmPassword = document.getElementById('register-confirm-password');
const btnRegister = document.getElementById('btn-register');

const linkToLogin = document.getElementById('link-to-login');
const authMessage = document.getElementById('auth-message');

const btnLogout = document.getElementById('btn-logout');
const btnAddNewPoint = document.getElementById('btn-add-new-point');
const pointsList = document.getElementById('points-list');
const addPointSection = document.getElementById('add-point-section');
const pointsListSection = document.getElementById('points-list-section');

const pointAgencia = document.getElementById('point-agencia');
const pointName = document.getElementById('point-name');
const pointAddress = document.getElementById('point-address');
const btnSavePoint = document.getElementById('btn-save-point');
const btnCancelAddPoint = document.getElementById('btn-cancel-add-point');
const pointMessage = document.getElementById('point-message');

// NOVOS ELEMENTOS DO DOM PARA DETALHES/EDIÇÃO DO PONTO
const pointDetailsSection = document.getElementById('point-details-section');
const detailsPointId = document.getElementById('details-point-id'); // Campo oculto para guardar o ID do ponto
const detailsAgencia = document.getElementById('details-agencia');
const detailsName = document.getElementById('details-name');
const detailsAddress = document.getElementById('details-address');
const detailsIntegracao = document.getElementById('details-integracao'); // O novo SELECT

const techniciansList = document.getElementById('technicians-list'); // Lista de técnicos
const btnAddTechnician = document.getElementById('btn-add-technician'); // Botão para adicionar técnico

const btnUpdatePoint = document.getElementById('btn-update-point'); // Botão para atualizar ponto
const btnDeletePoint = document.getElementById('btn-delete-point'); // Botão para excluir ponto
const btnCancelDetails = document.getElementById('btn-cancel-details'); // Botão Voltar
const detailsMessage = document.getElementById('details-message'); // Mensagens na tela de detalhes

// NOVOS ELEMENTOS DO DOM PARA CADASTRO DE TÉCNICO
const technicianFormSection = document.getElementById('technician-form-section');
const techName = document.getElementById('tech-name');
const techCpf = document.getElementById('tech-cpf');
const techRg = document.getElementById('tech-rg');
const techAso = document.getElementById('tech-aso');
const techFichaRegistro = document.getElementById('tech-ficha-registro');
const btnSaveTechnician = document.getElementById('btn-save-technician');
const btnCancelTechnician = document.getElementById('btn-cancel-technician');
const technicianMessage = document.getElementById('technician-message');


let currentUserId = null;
let currentPointId = null; // Para armazenar o ID do ponto que está sendo visualizado/editado

// --- Funções de UI (User Interface - Alternar Telas e Formulários) ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showLoginForm() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    authMessage.textContent = '';
}

function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    authMessage.textContent = '';
}

function showPointsListScreen() { // Renomeado para evitar conflito e ser mais descritivo
    showScreen('main-screen');
    pointsListSection.style.display = 'block';
    addPointSection.style.display = 'none';
    pointDetailsSection.style.display = 'none'; // Esconde detalhes
    technicianFormSection.style.display = 'none'; // Esconde form técnico
    pointMessage.textContent = '';
    detailsMessage.textContent = '';
    technicianMessage.textContent = '';
    // Limpar campos de formulários
    pointAgencia.value = '';
    pointName.value = '';
    pointAddress.value = '';
    techName.value = ''; techCpf.value = ''; techRg.value = ''; techAso.value = ''; techFichaRegistro.value = '';
}

function showAddPointForm() {
    pointsListSection.style.display = 'none';
    addPointSection.style.display = 'block';
    pointDetailsSection.style.display = 'none';
    technicianFormSection.style.display = 'none';
    pointMessage.textContent = '';
}

function showPointDetailsScreen(pointId) {
    pointsListSection.style.display = 'none';
    addPointSection.style.display = 'none';
    pointDetailsSection.style.display = 'block'; // Mostra detalhes
    technicianFormSection.style.display = 'none'; // Esconde form técnico
    detailsMessage.textContent = '';
    technicianMessage.textContent = '';
    currentPointId = pointId; // Guarda o ID do ponto atual
    loadPointDetails(pointId); // Carrega os detalhes do ponto
}

function showTechnicianForm() {
    pointDetailsSection.style.display = 'none';
    technicianFormSection.style.display = 'block'; // Mostra form técnico
    technicianMessage.textContent = '';
    // Limpa os campos do formulário de técnico
    techName.value = '';
    techCpf.value = '';
    techRg.value = '';
    techAso.value = '';
    techFichaRegistro.value = '';
}


// --- Funções de Autenticação com Firebase ---
async function handleRegister() {
    console.log('Tentando cadastrar...');
    const email = registerEmail.value;
    const password = registerPassword.value;
    const confirmPassword = registerConfirmPassword.value;

    if (password !== confirmPassword) {
        authMessage.textContent = 'As senhas não coincidem.';
        return;
    }
    if (password.length < 6) {
        authMessage.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        authMessage.textContent = 'Usuário cadastrado com sucesso! Redirecionando...';
    } catch (error) {
        authMessage.textContent = `Erro ao cadastrar: ${error.message}`;
        console.error("Erro no cadastro:", error);
    }
}

async function handleLogin() {
    console.log('Tentando fazer login...');
    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        authMessage.textContent = 'Login realizado com sucesso! Redirecionando...';
    } catch (error) {
        authMessage.textContent = `Erro ao fazer login: ${error.message}`;
        console.error("Erro no login:", error);
    }
}

function handleLogout() {
    signOut(auth).then(() => {
        console.log("Usuário deslogado");
        currentUserId = null;
        currentPointId = null; // Limpa o ID do ponto também
        showScreen('auth-screen');
        showLoginForm();
        pointsList.innerHTML = '';
    }).catch((error) => {
        console.error("Erro ao deslogar:", error);
    });
}

// --- Funções de Gerenciamento de Pontos com Firestore ---
async function loadPoints(userId) {
    pointsList.innerHTML = '<li>Carregando pontos...</li>';
    try {
        const q = query(collection(db, "pontosAtendimento"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        pointsList.innerHTML = '';

        if (querySnapshot.empty) {
            pointsList.innerHTML = '<li>Nenhum ponto de atendimento cadastrado ainda.</li>';
        } else {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const li = document.createElement('li');
                // Adiciona um data-id para identificar o documento no Firestore
                li.dataset.id = doc.id;
                li.innerHTML = `<span>${data.agencia}</span> - ${data.nome}`;
                li.addEventListener('click', () => showPointDetailsScreen(doc.id)); // Torna o item clicável
                pointsList.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar pontos:", error);
        pointsList.innerHTML = '<li>Erro ao carregar pontos. Tente novamente.</li>';
    }
}

async function handleSavePoint() {
    const agencia = pointAgencia.value.trim();
    const name = pointName.value.trim();
    const address = pointAddress.value.trim();

    if (!agencia || !name || !address) {
        pointMessage.textContent = 'Todos os campos são obrigatórios.';
        return;
    }
    if (agencia.length !== 4 || !/^\d{4}$/.test(agencia)) {
        pointMessage.textContent = 'Agência deve ter 4 dígitos numéricos.';
        return;
    }

    if (currentUserId) {
        try {
            await addDoc(collection(db, "pontosAtendimento"), {
                agencia: agencia,
                nome: name,
                endereco: address,
                userId: currentUserId,
                integracao: "nao", // Valor padrão ao cadastrar novo ponto
                createdAt: new Date()
            });
            pointMessage.textContent = 'Ponto cadastrado com sucesso!';
            pointMessage.style.color = 'green';
            setTimeout(() => {
                showPointsListScreen(); // Volta para a lista de pontos
                loadPoints(currentUserId); // Recarrega a lista
                pointMessage.style.color = '#dc3545'; // Reseta cor
            }, 1000);
        } catch (e) {
            pointMessage.textContent = `Erro ao cadastrar ponto: ${e.message}`;
            console.error("Erro ao adicionar documento: ", e);
        }
    } else {
        pointMessage.textContent = 'Erro: Usuário não logado.';
    }
}

// --- Funções para Detalhes e Edição de Ponto ---
async function loadPointDetails(pointId) {
    detailsMessage.textContent = 'Carregando detalhes...';
    try {
        const pointRef = doc(db, "pontosAtendimento", pointId);
        const pointSnap = await getDoc(pointRef);

        if (pointSnap.exists()) {
            const data = pointSnap.data();
            if (data.userId !== currentUserId) { // Segurança extra no frontend
                detailsMessage.textContent = 'Você não tem permissão para ver este ponto.';
                console.error("Tentativa de acesso não autorizado a ponto.");
                showPointsListScreen();
                return;
            }

            detailsPointId.value = pointSnap.id;
            detailsAgencia.value = data.agencia;
            detailsName.value = data.nome;
            detailsAddress.value = data.endereco;
            detailsIntegracao.value = data.integracao || 'nao'; // Define valor ou 'nao' como padrão

            await loadTechnicians(pointId); // Carrega técnicos para este ponto
            detailsMessage.textContent = ''; // Limpa a mensagem de carregamento
        } else {
            detailsMessage.textContent = 'Ponto não encontrado.';
            console.error("Ponto não encontrado com ID:", pointId);
            showPointsListScreen();
        }
    } catch (error) {
        detailsMessage.textContent = `Erro ao carregar detalhes: ${error.message}`;
        console.error("Erro ao carregar detalhes do ponto:", error);
    }
}

async function handleUpdatePoint() {
    const pointId = detailsPointId.value;
    const agencia = detailsAgencia.value.trim();
    const name = detailsName.value.trim();
    const address = detailsAddress.value.trim();
    const integracao = detailsIntegracao.value;

    if (!agencia || !name || !address) {
        detailsMessage.textContent = 'Todos os campos são obrigatórios.';
        return;
    }
    if (agencia.length !== 4 || !/^\d{4}$/.test(agencia)) {
        detailsMessage.textContent = 'Agência deve ter 4 dígitos numéricos.';
        return;
    }

    try {
        const pointRef = doc(db, "pontosAtendimento", pointId);
        await updateDoc(pointRef, {
            agencia: agencia,
            nome: name,
            endereco: address,
            integracao: integracao,
            updatedAt: new Date() // Opcional: registrar data de atualização
        });
        detailsMessage.textContent = 'Ponto atualizado com sucesso!';
        detailsMessage.style.color = 'green';
        setTimeout(() => {
            showPointsListScreen();
            loadPoints(currentUserId); // Recarrega a lista para mostrar a atualização
            detailsMessage.style.color = '#dc3545';
        }, 1000);
    } catch (error) {
        detailsMessage.textContent = `Erro ao atualizar ponto: ${error.message}`;
        console.error("Erro ao atualizar ponto:", error);
    }
}

async function handleDeletePoint() {
    if (!confirm('Tem certeza que deseja excluir este ponto e todos os seus técnicos?')) {
        return;
    }

    const pointId = detailsPointId.value;
    try {
        // Primeiro, exclua todos os técnicos associados a este ponto (importante!)
        const q = query(collection(db, "pontosAtendimento", pointId, "tecnicos"));
        const querySnapshot = await getDocs(q);
        const deletePromises = [];
        querySnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(deletePromises); // Aguarda a exclusão de todos os técnicos

        // Agora, exclua o próprio ponto
        const pointRef = doc(db, "pontosAtendimento", pointId);
        await deleteDoc(pointRef);

        detailsMessage.textContent = 'Ponto e técnicos excluídos com sucesso!';
        detailsMessage.style.color = 'green';
        setTimeout(() => {
            showPointsListScreen();
            loadPoints(currentUserId); // Recarrega a lista
            detailsMessage.style.color = '#dc3545';
        }, 1000);
    } catch (error) {
        detailsMessage.textContent = `Erro ao excluir ponto: ${error.message}`;
        console.error("Erro ao excluir ponto:", error);
    }
}

// --- Funções de Gerenciamento de Técnicos ---
async function loadTechnicians(pointId) {
    techniciansList.innerHTML = '<li>Carregando técnicos...</li>';
    try {
        const q = query(collection(db, "pontosAtendimento", pointId, "tecnicos"));
        const querySnapshot = await getDocs(q);
        techniciansList.innerHTML = '';

        if (querySnapshot.empty) {
            techniciansList.innerHTML = '<li>Nenhum técnico cadastrado para este ponto.</li>';
        } else {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const li = document.createElement('li');
                li.dataset.id = doc.id; // ID do técnico
                li.innerHTML = `
                    <div class="tech-info">
                        <strong>Nome:</strong> ${data.nome} <br>
                        <strong>CPF:</strong> ${data.cpf || 'N/A'} <br>
                        <strong>RG:</strong> ${data.rg || 'N/A'} <br>
                        <strong>ASO:</strong> ${data.aso || 'N/A'} <br>
                        <strong>Ficha Registro:</strong> ${data.fichaRegistro || 'N/A'}
                    </div>
                    <div class="tech-actions">
                        <button class="btn-delete-tech" data-id="${doc.id}">Excluir</button>
                    </div>
                `;
                // Adiciona evento para excluir técnico
                li.querySelector('.btn-delete-tech').addEventListener('click', (e) => {
                    e.stopPropagation(); // Evita que o clique se propague para o item pai (li)
                    handleDeleteTechnician(pointId, doc.id);
                });
                techniciansList.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar técnicos:", error);
        techniciansList.innerHTML = '<li>Erro ao carregar técnicos.</li>';
    }
}

async function handleSaveTechnician() {
    const pointId = currentPointId; // Pega o ID do ponto atualmente selecionado
    const nome = techName.value.trim();
    const cpf = techCpf.value.trim();
    const rg = techRg.value.trim();
    const aso = techAso.value.trim();
    const fichaRegistro = techFichaRegistro.value.trim();

    if (!nome) { // Nome é o mínimo obrigatório para um técnico
        technicianMessage.textContent = 'O nome do técnico é obrigatório.';
        return;
    }

    try {
        // Adiciona o técnico como um documento na subcoleção 'tecnicos' do ponto
        await addDoc(collection(db, "pontosAtendimento", pointId, "tecnicos"), {
            nome: nome,
            cpf: cpf,
            rg: rg,
            aso: aso,
            fichaRegistro: fichaRegistro,
            createdAt: new Date()
        });
        technicianMessage.textContent = 'Técnico cadastrado com sucesso!';
        technicianMessage.style.color = 'green';
        setTimeout(async () => {
            await loadTechnicians(pointId); // Recarrega a lista de técnicos
            showPointDetailsScreen(pointId); // Volta para a tela de detalhes do ponto
            technicianMessage.style.color = '#dc3545';
        }, 1000);
    } catch (error) {
        technicianMessage.textContent = `Erro ao cadastrar técnico: ${error.message}`;
        console.error("Erro ao cadastrar técnico:", error);
    }
}

async function handleDeleteTechnician(pointId, technicianId) {
    if (!confirm('Tem certeza que deseja excluir este técnico?')) {
        return;
    }

    try {
        const techRef = doc(db, "pontosAtendimento", pointId, "tecnicos", technicianId);
        await deleteDoc(techRef);
        technicianMessage.textContent = 'Técnico excluído com sucesso!';
        technicianMessage.style.color = 'green';
        setTimeout(() => {
            loadTechnicians(pointId); // Recarrega a lista de técnicos
            technicianMessage.style.color = '#dc3545';
        }, 500);
    } catch (error) {
        technicianMessage.textContent = `Erro ao excluir técnico: ${error.message}`;
        console.error("Erro ao excluir técnico:", error);
    }
}


// --- Event Listeners ---
// Eventos da tela de autenticação
btnLogin.addEventListener('click', handleLogin);
btnRegister.addEventListener('click', handleRegister);
linkToRegister.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); });
linkToLogin.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });

// Eventos da tela principal (lista de pontos)
btnLogout.addEventListener('click', handleLogout);
btnAddNewPoint.addEventListener('click', showAddPointForm);

// Eventos do formulário de adicionar novo ponto
btnSavePoint.addEventListener('click', handleSavePoint);
btnCancelAddPoint.addEventListener('click', showPointsListScreen);

// Eventos da tela de detalhes/edição do ponto
btnUpdatePoint.addEventListener('click', handleUpdatePoint);
btnDeletePoint.addEventListener('click', handleDeletePoint);
btnCancelDetails.addEventListener('click', showPointsListScreen);
btnAddTechnician.addEventListener('click', showTechnicianForm); // Botão para ir para o form de técnico

// Eventos do formulário de cadastro de técnico
btnSaveTechnician.addEventListener('click', handleSaveTechnician);
btnCancelTechnician.addEventListener('click', () => showPointDetailsScreen(currentPointId)); // Volta para os detalhes do ponto


// --- Monitoramento do Estado de Autenticação do Firebase ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("Usuário logado:", currentUserId);
        showPointsListScreen(); // Mostra a tela de lista de pontos
        loadPoints(currentUserId); // Carrega os pontos do usuário
        // Limpa campos de login/cadastro
        loginEmail.value = '';
        loginPassword.value = '';
        registerEmail.value = '';
        registerPassword.value = '';
        registerConfirmPassword.value = '';
        authMessage.textContent = '';
    } else {
        currentUserId = null;
        currentPointId = null;
        console.log("Nenhum usuário logado");
        showScreen('auth-screen');
        showLoginForm();
    }
});

// Inicializa o site mostrando a tela de autenticação e o formulário de login
showScreen('auth-screen');
showLoginForm();