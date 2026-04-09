document.addEventListener('DOMContentLoaded', function () {
    iniciarPagina();
});

// 🔥 DADOS GLOBAIS
let todosFilmes = [];
let todasSeries = [];

let currentLetter = 'A';
let currentYear = '';
let currentSearch = '';

// 🚀 INIT
function iniciarPagina() {
    montarFiltroAlfabeto();
    configurarBusca();
    configurarFiltroAno();
    carregarLancamentos();
}

// 🔤 FILTRO A-Z
function montarFiltroAlfabeto() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const container = document.getElementById('alphabetFilter');

    if (!container) return;

    container.innerHTML = alphabet.map(letter => `
        <button class="alphabet-button" data-letter="${letter}">${letter}</button>
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

    const btnA = container.querySelector('[data-letter="A"]');
    if (btnA) btnA.classList.add('active');
}

// 🔍 BUSCA TEXTO
function configurarBusca() {
    const input = document.getElementById('searchInput');
    const button = document.getElementById('searchButton');

    if (!input || !button) return;

    function executarBusca() {
        currentSearch = input.value.trim();
        currentLetter = '';
        aplicarFiltros();
    }

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') executarBusca();
    });

    button.addEventListener('click', executarBusca);
}

// 📅 FILTRO ANO
function configurarFiltroAno() {
    const select = document.getElementById('yearFilter');
    if (!select) return;

    select.addEventListener('change', function () {
        currentYear = this.value;
        aplicarFiltros();
    });
}

// ⏳ LOADING
function mostrarCarregando() {
    const html = '<div class="media-empty">Carregando...</div>';

    const filmesGrid = document.getElementById('filmesGrid');
    const seriesGrid = document.getElementById('seriesGrid');

    if (filmesGrid) filmesGrid.innerHTML = html;
    if (seriesGrid) seriesGrid.innerHTML = html;
}

// 🚀 BUSCA DADOS
async function carregarLancamentos() {
    mostrarCarregando();

    try {
        const filmes = await banco.buscarFilmes({ tipo: 'movie' });
        const series = await banco.buscarFilmes({ tipo: 'series' });

        todosFilmes = filmes || [];
        todasSeries = series || [];

        aplicarFiltros();

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// 🔥 FILTRO PRINCIPAL
function aplicarFiltros() {
    let filmes = [...todosFilmes];
    let series = [...todasSeries];

    if (currentLetter) {
        filmes = filmes.filter(f =>
            f.titulo?.toLowerCase().startsWith(currentLetter.toLowerCase())
        );

        series = series.filter(s =>
            s.titulo?.toLowerCase().startsWith(currentLetter.toLowerCase())
        );
    }

    if (currentSearch) {
        filmes = filmes.filter(f =>
            f.titulo?.toLowerCase().includes(currentSearch.toLowerCase())
        );

        series = series.filter(s =>
            s.titulo?.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }

    if (currentYear && currentYear !== '') {
        filmes = filmes.filter(f => f.ano?.includes(currentYear));
        series = series.filter(s => s.ano?.includes(currentYear));
    }

    filmes.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
    series.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));

    filmes = filmes.slice(0, 6);
    series = series.slice(0, 6);

    renderMediaGrid('filmesGrid', filmes, 'Nenhum filme encontrado.');
    renderMediaGrid('seriesGrid', series, 'Nenhuma série encontrada.');
}

// 🎬 RENDER (🔥 CORRIGIDO AQUI)
function renderMediaGrid(containerId, items, mensagem) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items.length) {
        container.innerHTML = `<div class="media-empty">${mensagem}</div>`;
        return;
    }

    container.innerHTML = items.map(item => {
        const poster = item.poster && item.poster !== 'N/A'
            ? item.poster
            : 'https://via.placeholder.com/250x370?text=Sem+Imagem';

        return `
        <div class="media-card">
            <div class="media-poster" style="background-image:url('${poster}')"></div>
            <div class="media-info">
                <strong>${item.titulo || 'Sem título'}</strong>
                <span>${item.ano || ''} · ${item.tipo || ''}</span>
                <p>Resumo não disponível.</p>
                <a href="filme.html?id=${item.id}" class="btn-detalhes">Ver detalhes</a>
            </div>
        </div>`;
    }).join('');
}