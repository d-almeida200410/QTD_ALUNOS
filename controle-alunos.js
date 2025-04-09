// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDUYi6zK0Wikn7GxNvXwlaZ0IDAWjeBPFA",
    authDomain: "sistemarefoco.firebaseapp.com",
    projectId: "sistemarefoco",
    storageBucket: "sistemarefoco.appspot.com",
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
        manhaList: document.querySelector('#manhaList.alunos-grid'),
        tarde1List: document.querySelector('#tarde1List.alunos-grid'),
        tarde2List: document.querySelector('#tarde2List.alunos-grid'),
        tarde3List: document.querySelector('#tarde3List.alunos-grid'),
        tabButtons: document.querySelectorAll('.tab-btn'),
        alunoLists: document.querySelectorAll('.aluno-list')
    };

    // Variáveis de estado
    let alunosData = [];

    // Inicializar abas
    function initTabs() {
        elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const periodo = this.dataset.period;
                
                // Remover classe active de todos os botões e listas
                elements.tabButtons.forEach(b => b.classList.remove('active'));
                elements.alunoLists.forEach(list => list.classList.remove('active'));
                
                // Adicionar classe active ao botão clicado
                this.classList.add('active');
                
                // Mostrar lista correspondente
                document.querySelector(`.${periodo}-list`).classList.add('active');
                
                // Atualizar a lista específica do período selecionado
                atualizarListaEspecifica(periodo);
            });
        });
    }

    // Carregar dados do Firestore
    function carregarDados() {
        db.collection("alunos").orderBy("nome").onSnapshot((snapshot) => {
            alunosData = [];
            snapshot.forEach((doc) => {
                const aluno = doc.data();
                aluno.id = doc.id;
                alunosData.push(aluno);
            });
            
            atualizarResumo();
            
            // Atualiza apenas a lista do período ativo
            const periodoAtivo = document.querySelector('.tab-btn.active')?.dataset.period;
            if (periodoAtivo) {
                atualizarListaEspecifica(periodoAtivo);
            }
        }, (error) => {
            console.error("Erro ao carregar alunos:", error);
        });
    }
    
    // Atualizar resumo
    function atualizarResumo() {
        const contadorPeriodos = {
            'Manhã': 0,
            'Tarde (14h-16h)': 0,
            'Tarde (16h-18h)': 0,
            'Tarde (18h-20h)': 0
        };
        
        // Contar alunos por período
        alunosData.forEach(aluno => {
            // Verificar se o aluno tem a estrutura nova (horarios)
            if (aluno.horarios && aluno.horarios.length > 0) {
                aluno.horarios.forEach(horario => {
                    if (contadorPeriodos.hasOwnProperty(horario.periodo)) {
                        contadorPeriodos[horario.periodo]++;
                    }
                });
            } 
            // Verificar estrutura antiga (periodo direto)
            else if (aluno.periodo && contadorPeriodos.hasOwnProperty(aluno.periodo)) {
                contadorPeriodos[aluno.periodo]++;
            }
        });
        
        const total = alunosData.length;
        elements.totalAlunos.textContent = total;
        
        elements.manhaCount.textContent = contadorPeriodos['Manhã'];
        elements.tarde1Count.textContent = contadorPeriodos['Tarde (14h-16h)'];
        elements.tarde2Count.textContent = contadorPeriodos['Tarde (16h-18h)'];
        elements.tarde3Count.textContent = contadorPeriodos['Tarde (18h-20h)'];
        
        elements.manhaBadge.textContent = `${contadorPeriodos['Manhã']} aluno${contadorPeriodos['Manhã'] !== 1 ? 's' : ''}`;
        elements.tarde1Badge.textContent = `${contadorPeriodos['Tarde (14h-16h)']} aluno${contadorPeriodos['Tarde (14h-16h)'] !== 1 ? 's' : ''}`;
        elements.tarde2Badge.textContent = `${contadorPeriodos['Tarde (16h-18h)']} aluno${contadorPeriodos['Tarde (16h-18h)'] !== 1 ? 's' : ''}`;
        elements.tarde3Badge.textContent = `${contadorPeriodos['Tarde (18h-20h)']} aluno${contadorPeriodos['Tarde (18h-20h)'] !== 1 ? 's' : ''}`;
    }
    
    // Atualizar lista específica de um período
    function atualizarListaEspecifica(periodo) {
        const periodoMap = {
            'manha': 'Manhã',
            'tarde1': 'Tarde (14h-16h)',
            'tarde2': 'Tarde (16h-18h)',
            'tarde3': 'Tarde (18h-20h)'
        };
        
        const periodoNome = periodoMap[periodo];
        const listaElement = elements[`${periodo}List`];
        
        // Filtrar alunos que pertencem a este período
        const alunosPeriodo = alunosData.filter(aluno => {
            // Verificar estrutura nova (horarios)
            if (aluno.horarios && aluno.horarios.length > 0) {
                return aluno.horarios.some(h => h.periodo === periodoNome);
            }
            // Verificar estrutura antiga (periodo direto)
            return aluno.periodo === periodoNome;
        });
        
        if (alunosPeriodo.length === 0) {
            listaElement.innerHTML = '<div class="no-alunos">Nenhum aluno matriculado neste período</div>';
            return;
        }
        
        let html = '';
        
        // Agrupar por horários específicos (se existirem)
        const gruposHorarios = {};
        
        alunosPeriodo.forEach(aluno => {
            // Estrutura nova (horarios)
            if (aluno.horarios && aluno.horarios.length > 0) {
                aluno.horarios.forEach(horario => {
                    if (horario.periodo === periodoNome) {
                        const dias = Array.isArray(horario.dias) ? horario.dias.join(', ') : horario.dias;
                        const chaveHorario = `${periodoNome} - ${dias}`;
                        
                        if (!gruposHorarios[chaveHorario]) {
                            gruposHorarios[chaveHorario] = [];
                        }
                        
                        gruposHorarios[chaveHorario].push(aluno);
                    }
                });
            } 
            // Estrutura antiga (periodo e dias separados)
            else {
                const dias = Array.isArray(aluno.dias) ? aluno.dias.join(', ') : aluno.dias || 'Sem dias definidos';
                const chaveHorario = `${periodoNome} - ${dias}`;
                
                if (!gruposHorarios[chaveHorario]) {
                    gruposHorarios[chaveHorario] = [];
                }
                
                gruposHorarios[chaveHorario].push(aluno);
            }
        });
        
        // Ordenar os horários
        const horariosOrdenados = Object.keys(gruposHorarios).sort();
        
        horariosOrdenados.forEach(chaveHorario => {
            const alunosNoHorario = gruposHorarios[chaveHorario];
            
            html += `
                <div class="horario-group">
                    <div class="horario-header">
                        <span class="horario-title">${chaveHorario}</span>
                        <span class="horario-count">${alunosNoHorario.length} aluno${alunosNoHorario.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="alunos-subgrid">
            `;
            
            // Ordenar alunos por nome
            alunosNoHorario.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(aluno => {
                html += `
                    <div class="aluno-card">
                        <div class="aluno-nome">${aluno.nome}</div>
                        <div class="aluno-info">
                            <span class="aluno-valor">💰 R$ ${aluno.valor || '0,00'}</span>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        listaElement.innerHTML = html;
    }
    
    // Inicializar
    initTabs();
    carregarDados();
    
    // Ativar a primeira aba por padrão
    if (elements.tabButtons.length > 0) {
        elements.tabButtons[0].click();
    }
});