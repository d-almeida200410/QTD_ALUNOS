// Configuração do Firebase (use a mesma do seu sistema de cadastro)
const firebaseConfig = {
    apiKey: "AIzaSyDUYi6zK0Wikn7GxNvXwlaZ0IDAWjeBPFA",
    authDomain: "sistemarefoco.firebaseapp.com",
    projectId: "sistemarefoco",
    storageBucket: "sistemarefoco.firebasestorage.app",
    messagingSenderId: "575074315451",
    appId: "1:575074315451:web:46a990adb690b40e3a8d9e",
    measurementId: "G-0SVNNZGEF4"
  };

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const elements = {
        totalAlunos: document.getElementById('totalAlunos'),
        manhaCount: document.getElementById('manhaCount'),
        tarde1Count: document.getElementById('tarde1Count'),
        tarde2Count: document.getElementById('tarde2Count'),
        tarde3Count: document.getElementById('tarde3Count'),
        manhaBadge: document.getElementById('manhaBadge'),
        tarde1Badge: document.getElementById('tarde1Badge'),
        tarde2Badge: document.getElementById('tarde2Badge'),
        tarde3Badge: document.getElementById('tarde3Badge'),
        manhaList: document.getElementById('manhaList'),
        tarde1List: document.getElementById('tarde1List'),
        tarde2List: document.getElementById('tarde2List'),
        tarde3List: document.getElementById('tarde3List'),
        tabButtons: document.querySelectorAll('.tab-btn')
    };

    // Variáveis de estado
    let alunosData = [];

    // Inicializar abas
    function initTabs() {
        elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const periodo = this.dataset.period;
                
                // Remover classe active de todos os botões
                elements.tabButtons.forEach(b => b.classList.remove('active'));
                
                // Adicionar classe active ao botão clicado
                this.classList.add('active');
                
                // Mostrar lista correspondente
                document.querySelectorAll('.aluno-list').forEach(list => {
                    list.classList.remove('active');
                });
                document.querySelector(`.${periodo}-list`).classList.add('active');
            });
        });
    }

    // Carregar dados do Firestore
    function carregarDados() {
        db.collection("alunos").orderBy("nome").onSnapshot((snapshot) => {
            alunosData = [];
            const contadorPeriodos = {
                'Manhã': 0,
                'Tarde (14h-16h)': 0,
                'Tarde (16h-18h)': 0,
                'Tarde (18h-20h)': 0
            };
            
            snapshot.forEach((doc) => {
                const aluno = doc.data();
                aluno.id = doc.id;
                alunosData.push(aluno);
                
                if (contadorPeriodos.hasOwnProperty(aluno.periodo)) {
                    contadorPeriodos[aluno.periodo]++;
                }
            });
            
            atualizarResumo(contadorPeriodos);
            atualizarListas();
        });
    }
    
    // Atualizar resumo
    function atualizarResumo(contador) {
        const total = alunosData.length;
        elements.totalAlunos.textContent = total;
        
        elements.manhaCount.textContent = contador['Manhã'];
        elements.tarde1Count.textContent = contador['Tarde (14h-16h)'];
        elements.tarde2Count.textContent = contador['Tarde (16h-18h)'];
        elements.tarde3Count.textContent = contador['Tarde (18h-20h)'];
        
        elements.manhaBadge.textContent = `${contador['Manhã']} aluno${contador['Manhã'] !== 1 ? 's' : ''}`;
        elements.tarde1Badge.textContent = `${contador['Tarde (14h-16h)']} aluno${contador['Tarde (14h-16h)'] !== 1 ? 's' : ''}`;
        elements.tarde2Badge.textContent = `${contador['Tarde (16h-18h)']} aluno${contador['Tarde (16h-18h)'] !== 1 ? 's' : ''}`;
        elements.tarde3Badge.textContent = `${contador['Tarde (18h-20h)']} aluno${contador['Tarde (18h-20h)'] !== 1 ? 's' : ''}`;
    }
    
    // Atualizar listas de alunos
    function atualizarListas() {
        const alunosPorPeriodo = {
            'Manhã': alunosData.filter(a => a.periodo === 'Manhã'),
            'Tarde (14h-16h)': alunosData.filter(a => a.periodo === 'Tarde (14h-16h)'),
            'Tarde (16h-18h)': alunosData.filter(a => a.periodo === 'Tarde (16h-18h)'),
            'Tarde (18h-20h)': alunosData.filter(a => a.periodo === 'Tarde (18h-20h)')
        };
        
        // Atualizar cada lista
        atualizarLista('manha', alunosPorPeriodo['Manhã']);
        atualizarLista('tarde1', alunosPorPeriodo['Tarde (14h-16h)']);
        atualizarLista('tarde2', alunosPorPeriodo['Tarde (16h-18h)']);
        atualizarLista('tarde3', alunosPorPeriodo['Tarde (18h-20h)']);
    }
    
    function atualizarLista(periodo, alunos) {
        const listaElement = elements[`${periodo}List`];
        
        if (alunos.length === 0) {
            listaElement.innerHTML = '<div class="no-alunos">Nenhum aluno matriculado neste período</div>';
            return;
        }
        
        let html = '';
        alunos.forEach(aluno => {
            html += `
                <div class="aluno-card">
                    <div class="aluno-nome">${aluno.nome}</div>
                    <div class="aluno-info">
                        <span class="aluno-dias">📅 ${aluno.dias}</span>
                        <span class="aluno-valor">💰 R$ ${aluno.valor}</span>
                    </div>
                </div>
            `;
        });
        
        listaElement.innerHTML = html;
    }
    
    // Inicializar
    initTabs();
    carregarDados();
});