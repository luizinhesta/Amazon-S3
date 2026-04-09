// Verificar se usuário está logado ao carregar página
document.addEventListener("DOMContentLoaded", function() {
    const usuarioLogado = banco.getUsuarioLogado();

    if (!usuarioLogado) {
        window.location.href = 'index.html';
        return;
    }

    const nomeCompleto = `${usuarioLogado.nome || ''} ${usuarioLogado.sobrenome || ''}`.trim();
    document.getElementById("usuarioLogado").textContent = `Olá, ${nomeCompleto}`;

    carregarCatalogo();

    document.getElementById('tabFilmes').addEventListener('click', () => mostrarAba('filmes'));
    document.getElementById('tabSeries').addEventListener('click', () => mostrarAba('series'));

    // 🔥 GARANTE QUE ABRE EM FILMES
    mostrarAba('filmes');

    // 🔥 BOTÃO SAIR (AGORA NO LUGAR CERTO)
    document.getElementById("btnSair").addEventListener("click", function() {
        banco.logout();
        window.location.href = 'index.html';
    });
});

async function carregarCatalogo() {
    const usuarioLogado = banco.getUsuarioLogado();
    if (!usuarioLogado) return;

    try {
        const favoritos = await banco.listarFavoritos(usuarioLogado.id_usuario);

        // 🔥 COMO NÃO TEM TIPO, TUDO VAI PARA FILMES
        const filmes = favoritos.filter(f => f.Type === 'movie');
        const series = favoritos.filter(f => f.Type === 'series');

        renderCatalogo('filmesCatalogo', filmes, 'Nenhum filme nos favoritos.');
        renderCatalogo('seriesCatalogo', series, 'Nenhuma série nos favoritos.');

    } catch (error) {
        console.error('Erro ao carregar catálogo:', error);
        mostrarMensagem('Erro ao carregar catálogo.');
    }
}

function renderCatalogo(containerId, items, mensagemVazia) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = `<div class="catalogo-empty">${mensagemVazia}</div>`;
        return;
    }

    container.innerHTML = items.map(item => {
        const poster = item.Poster || 'https://via.placeholder.com/250x370?text=Sem+Imagem';

        return `
            <div class="catalogo-card">
                <div class="catalogo-poster" style="background-image:url('${poster}')"></div>
                <div class="catalogo-info">
                    <strong>${item.Title}</strong>
                    <span>${item.Year}</span>
                    <button class="btn-remover" data-imdbid="${item.imdbID}">Remover</button>
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const imdbID = e.target.dataset.imdbid;
            await removerFavorito(imdbID);
        });
    });
}

async function removerFavorito(imdbID) {
    const usuarioLogado = banco.getUsuarioLogado();
    if (!usuarioLogado) return;

    try {
        await banco.removerFavorito(usuarioLogado.id_usuario, imdbID);

        mostrarMensagem('Removido do catálogo!', 'sucesso');
        carregarCatalogo();

    } catch (error) {
        console.error('Erro ao remover favorito:', error);
        mostrarMensagem('Erro ao remover do catálogo.');
    }
}

function mostrarAba(tipo) {
    const filmesCatalogo = document.getElementById('filmesCatalogo');
    const seriesCatalogo = document.getElementById('seriesCatalogo');
    const tabFilmes = document.getElementById('tabFilmes');
    const tabSeries = document.getElementById('tabSeries');

    if (tipo === 'filmes') {
        filmesCatalogo.style.display = 'grid';
        seriesCatalogo.style.display = 'none';
        tabFilmes.classList.add('active');
        tabSeries.classList.remove('active');
    } else {
        filmesCatalogo.style.display = 'none';
        seriesCatalogo.style.display = 'grid';
        tabFilmes.classList.remove('active');
        tabSeries.classList.add('active');
    }
}

function mostrarMensagem(texto, tipo = 'erro') {
    const msg = document.getElementById('mensagem');
    if (!msg) return;
    msg.textContent = texto;
    msg.className = 'mensagem ' + tipo;
    msg.style.display = 'block';

    setTimeout(() => {
        msg.style.display = 'none';
    }, 3000);
}