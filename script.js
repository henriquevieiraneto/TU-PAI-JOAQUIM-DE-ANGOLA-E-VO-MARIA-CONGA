// Script Global do Terreiro
document.addEventListener('DOMContentLoaded', () => {
    console.log("Portal do Terreiro carregado com sucesso!");
    
    // Efeito simples de clique nas pastas
    const folders = document.querySelectorAll('.folder-item');
    folders.forEach(folder => {
        folder.addEventListener('mouseenter', () => {
            folder.style.opacity = "0.8";
        });
        folder.addEventListener('mouseleave', () => {
            folder.style.opacity = "1";
        });
    });
});

// Futura função para carregar dados dos médiuns via JSON
function carregarDadosMedium() {
    // Espaço para integração com banco de dados ou JSON
}