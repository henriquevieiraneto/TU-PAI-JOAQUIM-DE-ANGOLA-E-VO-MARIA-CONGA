document.addEventListener('DOMContentLoaded', () => {
    // Inicia carregamento se estiver na página de médiuns
    if (document.getElementById('lista-mediuns')) {
        carregarDadosMedium();
    }
});

async function carregarDadosMedium() {
    const grid = document.getElementById('lista-mediuns');
    try {
        // Busca o arquivo JSON na raiz
        const response = await fetch('../dados.json');
        const dados = await response.json();
        
        grid.innerHTML = ""; // Limpa o texto de carregamento

        if (dados.mediuns.length === 0) {
            grid.innerHTML = "<p>Nenhum médium cadastrado ainda.</p>";
            return;
        }

        dados.mediuns.forEach(m => {
            const card = document.createElement('div');
            card.className = 'medium-card';
            card.innerHTML = `
                <img src="${m.foto || '../img/default.jpg'}" alt="${m.nome}" onerror="this.src='../img/default.jpg'">
                <h3>${m.nome}</h3>
                <p>${m.cargo}</p>
                <small style="color: var(--gold); opacity: 0.8;">${m.entidade}</small>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Erro:", error);
        grid.innerHTML = "<p style='color:red;'>Erro ao carregar lista de médiuns.</p>";
    }
}