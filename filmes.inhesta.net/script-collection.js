let currentLetter = 'A';
let currentYear = '';
let currentSearch = '';

let todosItens = [];

// 🔤 FILTRO A-Z + 1-0
function montarFiltroAlfabeto() {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const numeros = ['1','2','3','4','5','6','7','8','9','0'];

    const itens = [...letras, ...numeros];

    const container = document.getElementById('alphabetFilter');

    container.innerHTML = itens.map(item => `
        <button class="alphabet-button" data-letter="${item}">
            ${item}
        </button>
    `).join('');

    const botoes = container.querySelectorAll('.alphabet-button');

    botoes.forEach(btn => {
        btn.addEventListener('click', function () {
            currentLetter = this.dataset.letter;
            currentSearch = '';

            botoes.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            aplicarFiltros();
        });
    });

    container.querySelector('[data-letter="A"]').classList.add('active');
}

// 🚀 BUSCA DADOS
async function carregarColecao() {
    const tipo = document.body.dataset.page || 'movie';

    try {
        const items = await banco.buscarFilmes({ tipo });
        todosItens = items || [];
        aplicarFiltros();
    } catch (e) {
        console.error(e);
    }
}

// 🔥 FILTRO FRONTEND
function aplicarFiltros() {
    let lista = [...todosItens];

    // LETRA / NÚMERO
    if (currentLetter) {
        lista = lista.filter(item => {
            const titulo = (item.Title || '').toLowerCase();

            if (!isNaN(currentLetter)) {
                return /^[0-9]/.test(titulo);
            }

            return titulo.startsWith(currentLetter.toLowerCase());
        });
    }

    // BUSCA
    if (currentSearch) {
        lista = lista.filter(item =>
            (item.Title || '').toLowerCase().includes(currentSearch.toLowerCase())
        );
    }

    // ANO
    if (currentYear && currentYear !== 'todos') {
        lista = lista.filter(item =>
            item.Year && item.Year.includes(currentYear)
        );
    }

    // ORDENAR
    lista.sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));

    lista = lista.slice(0, 6);

    renderMediaGrid('collectionGrid', lista);
}

// 🎬 RENDER
function renderMediaGrid(id, items) {
    const container = document.getElementById(id);

    if (!items.length) {
        container.innerHTML = 'Nenhum resultado';
        return;
    }

    container.innerHTML = items.map(item => {
        const poster = item.Poster !== 'N/A'
            ? item.Poster
            : 'https://via.placeholder.com/250x370';

        return `
        <div class="media-card">
            <div class="media-poster" style="background-image:url('${poster}')"></div>
            <div class="media-info">
                <strong>${item.Title}</strong>
                <span>${item.Year}</span>
                <a href="filme.html?id=${item.imdbID}" class="btn-detalhes">Ver</a>
            </div>
        </div>`;
    }).join('');
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
    montarFiltroAlfabeto();
    carregarColecao();
});