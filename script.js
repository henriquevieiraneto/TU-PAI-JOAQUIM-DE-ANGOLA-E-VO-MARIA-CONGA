document.addEventListener('DOMContentLoaded', () => {
    // Só inicia se existir a div de listagem na página
    if (document.getElementById('lista-mediuns')) {
        carregarDadosMedium();
    }
});

/**
 * Carrega o JSON e resolve o problema dos acentos (Babalorixá)
 */
async function carregarDadosMedium() {
    const grid = document.getElementById('lista-mediuns');
    
    try {
        // O timestamp (?t=) evita que o navegador mostre dados antigos salvos no cache
        const response = await fetch(`../dados.json?t=${Date.now()}`);
        
        if (!response.ok) throw new Error("Erro ao carregar dados.");

        // Lógica para garantir que os acentos (UTF-8) sejam lidos corretamente
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = function() {
            try {
                const dados = JSON.parse(reader.result);
                renderizarCards(dados.mediuns);
            } catch (err) {
                console.error("Erro ao processar JSON:", err);
            }
        };

        reader.readAsText(blob, 'UTF-8');

    } catch (error) {
        console.error("Erro na requisição:", error);
        grid.innerHTML = "<p class='loading'>Erro ao sincronizar com o terreiro. Tente recarregar.</p>";
    }
}

/**
 * Cria os cards na tela com links de Orixás e imagens
 */
function renderizarCards(mediuns) {
    const grid = document.getElementById('lista-mediuns');
    grid.innerHTML = ""; // Limpa o carregando

    if (!mediuns || mediuns.length === 0) {
        grid.innerHTML = "<p class='loading'>Nenhum médium cadastrado.</p>";
        return;
    }

    mediuns.forEach(m => {
        const card = document.createElement('div');
        card.className = 'medium-card';

        // Gera o link do orixá: remove acentos, espaços e deixa minúsculo
        // Ex: "Iemanjá" vira "iemanja.html"
        const orixaLink = m.orixa 
            ? m.orixa.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, '-')
            : "desconhecido";

        card.innerHTML = `
            <img src="${m.foto || '../img/default.jpg'}" alt="${m.nome}" onerror="this.src='../img/default.jpg'">
            
            <h3>${m.nome}</h3>
            <p><strong>${m.cargo}</strong></p>
            
            ${m.orixa ? `
                <div class="orixa-link-container">
                    Orixá: <a href="../orixas/${orixaLink}.html" class="link-orixa">${m.orixa}</a>
                </div>
            ` : ''}

            <span class="detalhes-entidade">
                ${m.linha ? `<strong>Linha:</strong> ${m.linha} <br>` : ''}
                ${m.entidade ? `<strong>Entidade:</strong> ${m.entidade}` : ''}
            </span>
        `;
        
        grid.appendChild(card);
    });
}