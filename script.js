document.addEventListener('DOMContentLoaded', () => {
    // Só executa a função se estivermos na página que contém a lista de médiuns
    if (document.getElementById('lista-mediuns')) {
        carregarDadosMedium();
    }
});

/**
 * Função principal que busca os dados no GitHub e renderiza na tela
 */
async function carregarDadosMedium() {
    const grid = document.getElementById('lista-mediuns');
    
    try {
        // O "?t=" + Date.now() força o navegador a buscar a versão mais recente, 
        // ignorando o cache (importante para quando você salva no Admin)
        const response = await fetch(`../dados.json?t=${Date.now()}`);
        
        if (!response.ok) throw new Error("Não foi possível carregar o arquivo de dados.");
        
        const dados = await response.json();
        
        // Limpa o texto de "Carregando..."
        grid.innerHTML = ""; 

        if (!dados.mediuns || dados.mediuns.length === 0) {
            grid.innerHTML = "<p class='loading'>Nenhum médium cadastrado no momento.</p>";
            return;
        }

        // Percorre cada médium no JSON
        dados.mediuns.forEach(m => {
            const card = document.createElement('div');
            card.className = 'medium-card';
            
            // Tratamento do Link do Orixá:
            // 1. Converte para minúsculo
            // 2. Remove acentos (Iemanjá -> Iemanja)
            // 3. Substitui espaços por hífen
            let orixaLink = "";
            if (m.orixa) {
                orixaLink = m.orixa
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, '-');
            }

            // Montagem do HTML interno do Card
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

    } catch (error) {
        console.error("Erro ao carregar médiuns:", error);
        grid.innerHTML = `
            <div class="loading" style="color: #ff4444;">
                <i class="fas fa-exclamation-triangle"></i><br>
                Erro ao sincronizar dados. tente recarregar a página.
            </div>
        `;
    }
}