/**
 * CORE SCRIPT - SISTEMA DE GESTÃO TU PAI JOAQUIM
 * Gerencia a comunicação entre o HTML e o Banco de Dados JSON no GitHub
 */

// Configurações do Repositório (Ajuste se o nome do repo mudar)
const REPO_INFO = { 
    owner: 'henriquevieiraneto', 
    repo: 'TU-PAI-JOAQUIM-DE-ANGOLA-E-VO-MARIA-CONGA', 
    path: 'dados.json' 
};

let db = { mediuns: [] };
let currentSha = ""; // Necessário para o GitHub aceitar atualizações

// Listas de Opções para os Selects
const LISTAS = {
    orixas: ["Oxalá", "Iemanjá", "Ogum", "Oxum", "Oxóssi", "Xangô", "Iansã", "Obaluaê", "Nanã", "Ibeji", "Desconhecido"],
    cargos: ["Babalorixá", "Ialorixá", "Pai de Santo", "Mãe de Santo", "Zelador", "Médium de Corrente", "Cambone", "Ogã", "Ekedji", "Iniciante", "Outros"],
    linhas: ["Preto Velho", "Caboclo", "Baiano", "Marinheiro", "Erê", "Exu", "Pombagira", "Cigano", "Boiadeiro", "Malandro", "Desconhecido"]
};

/**
 * SISTEMA DE NOTIFICAÇÃO
 */
function status(msg, color = "#00d4ff") {
    const logElement = document.getElementById('log');
    logElement.innerText = msg; 
    logElement.style.background = color;
    logElement.style.color = (color === "#fff" || color === "#00d4ff") ? "#000" : "#fff";
    logElement.style.display = 'block';
    setTimeout(() => { logElement.style.display = 'none'; }, 4000);
}

/**
 * CONVERSORES DE CODIFICAÇÃO (Para lidar com acentos no GitHub)
 */
function b64_to_utf8(str) { return decodeURIComponent(escape(window.atob(str))); }
function utf8_to_b64(str) { return btoa(unescape(encodeURIComponent(str))); }

/**
 * LÓGICA DE LOGIN
 */
async function login() {
    const userField = document.getElementById('user').value;
    const passField = document.getElementById('pass').value;

    if (userField === "admin" && passField === "admin") {
        status("🔓 Acesso Autorizado!", "#28a745");
        inicializarDados();
    } else {
        status("❌ Credenciais Inválidas", "#dc3545");
    }
}

/**
 * CARREGAMENTO DE DADOS DO GITHUB
 */
async function inicializarDados() {
    let token = localStorage.getItem('gh_token');
    
    if(!token) {
        token = prompt("🔐 Insira seu GitHub Personal Access Token:");
        if(token) localStorage.setItem('gh_token', token);
        else return;
    }

    try {
        status("📡 Sincronizando com servidor...");
        const response = await fetch(`https://api.github.com/repos/${REPO_INFO.owner}/${REPO_INFO.repo}/contents/${REPO_INFO.path}?t=${Date.now()}`, {
            headers: { 'Authorization': `token ${token}` },
            cache: 'no-store'
        });

        if(!response.ok) throw new Error("Erro ao acessar dados.");

        const data = await response.json();
        currentSha = data.sha; // Guarda o SHA para o próximo commit
        
        // Verifica rascunho local
        const rascunho = localStorage.getItem('admin_draft');
        if(rascunho && confirm("📝 Você possui alterações não publicadas. Deseja carregar o rascunho salvo?")) {
            db = JSON.parse(rascunho);
        } else {
            db = JSON.parse(b64_to_utf8(data.content));
        }

        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');
        render();

    } catch (e) {
        status("❌ Erro de Conexão ou Token", "#dc3545");
        localStorage.removeItem('gh_token');
    }
}

/**
 * RENDERIZAÇÃO DOS CARDS DE EDIÇÃO
 */
function render(filtro = "") {
    const container = document.getElementById('lista-edicao');
    container.innerHTML = "";
    let countVisivel = 0;

    db.mediuns.forEach((m, i) => {
        const termoBusca = filtro.toLowerCase();
        if (filtro && !m.nome.toLowerCase().includes(termoBusca) && !m.entidade.toLowerCase().includes(termoBusca)) return;

        countVisivel++;
        const card = document.createElement('div');
        card.className = 'admin-box card-edit';
        card.innerHTML = `
            <button class="btn btn-del" onclick="remover(${i})"><i class="fas fa-trash"></i> APAGAR</button>
            
            <div class="foto-container">
                <img src="${m.foto || 'img/default.jpg'}" class="preview-img" id="prev-${i}" onerror="this.src='https://via.placeholder.com/150'">
                <div class="drop-zone" ondrop="handleDrop(event, ${i})" ondragover="event.preventDefault()">
                     <i class="fas fa-image"></i> Arraste o link de uma imagem aqui
                </div>
            </div>

            <div class="form-grid">
                <div class="field-group">
                    <label>Nome do Médium</label>
                    <input type="text" value="${m.nome || ''}" oninput="db.mediuns[${i}].nome = this.value.toUpperCase(); salvarCache()">
                </div>
                <div class="field-group">
                    <label>Orixá</label>
                    <select onchange="db.mediuns[${i}].orixa = this.value; salvarCache()">
                        ${LISTAS.orixas.map(o => `<option value="${o}" ${m.orixa === o ? 'selected' : ''}>${o}</option>`).join('')}
                    </select>
                </div>
                <div class="field-group">
                    <label>Cargo</label>
                    <select onchange="db.mediuns[${i}].cargo = this.value; salvarCache()">
                        ${LISTAS.cargos.map(c => `<option value="${c}" ${m.cargo === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div class="field-group">
                    <label>Linha</label>
                    <select onchange="db.mediuns[${i}].linha = this.value; salvarCache()">
                        ${LISTAS.linhas.map(l => `<option value="${l}" ${m.linha === l ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="field-group" style="margin-top:15px;">
                <label>Entidade de Frente</label>
                <input type="text" value="${m.entidade || ''}" placeholder="Ex: Caboclo Sete Estrelas" oninput="db.mediuns[${i}].entidade = this.value; salvarCache()">
            </div>

            <label>Link da Imagem</label>
            <input type="text" id="input-foto-${i}" value="${m.foto || ''}" oninput="db.mediuns[${i}].foto = this.value; document.getElementById('prev-${i}').src = this.value; salvarCache()">
        `;
        container.appendChild(card);
    });
    atualizarStats(countVisivel);
}

/**
 * FUNÇÕES DE APOIO
 */
function filtrarCards() {
    const val = document.getElementById('filterInput').value;
    render(val);
}

function salvarCache() {
    localStorage.setItem('admin_draft', JSON.stringify(db));
}

function adicionarNovo() {
    db.mediuns.unshift({ nome: "", cargo: "Médium de Corrente", entidade: "", linha: "Desconhecido", orixa: "Desconhecido", foto: "" });
    render();
    salvarCache();
    status("✨ Novo registro iniciado!");
}

function remover(i) {
    if(confirm("Deseja mesmo excluir este registro?")) {
        db.mediuns.splice(i, 1);
        render();
        salvarCache();
    }
}

function handleDrop(e, index) {
    e.preventDefault();
    const link = e.dataTransfer.getData('text');
    if(link && link.startsWith('http')) {
        db.mediuns[index].foto = link;
        document.getElementById(`input-foto-${index}`).value = link;
        document.getElementById(`prev-${index}`).src = link;
        salvarCache();
    }
}

function atualizarStats(visiveis) {
    const bar = document.getElementById('stats-bar');
    if(bar) {
        bar.innerHTML = `
            <span class="stats-item">Membros: <b>${db.mediuns.length}</b></span>
            <span class="stats-item">Filtrados: <b>${visiveis}</b></span>
        `;
    }
}

/**
 * PUBLICAÇÃO NO GITHUB (UPDATE VIA API)
 */
async function enviarParaGithub() {
    const token = localStorage.getItem('gh_token');
    if(!token) return status("❌ Token Ausente", "#dc3545");

    status("🚀 Publicando alterações...");

    try {
        const contentB64 = utf8_to_b64(JSON.stringify(db, null, 2));
        
        const res = await fetch(`https://api.github.com/repos/${REPO_INFO.owner}/${REPO_INFO.repo}/contents/${REPO_INFO.path}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: "Atualização de Médiuns via Painel Admin", 
                content: contentB64, 
                sha: currentSha 
            })
        });

        if(res.ok) {
            const result = await res.json();
            currentSha = result.content.sha;
            localStorage.removeItem('admin_draft');
            status("✅ SITE ATUALIZADO!", "#28a745");
        } else {
            throw new Error("Falha no envio.");
        }
    } catch (e) {
        status("❌ Erro ao salvar no GitHub", "#dc3545");
    }
}