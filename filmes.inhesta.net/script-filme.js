console.log('Script filme.js carregado');

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
}

function mostrarMensagemDetalhe(texto, tipo = 'erro') {
    const msg = document.getElementById('mensagem');
    if (!msg) return;
    msg.textContent = texto;
    msg.className = 'mensagem ' + tipo;
    msg.style.display = 'block';
}

function renderDetailPage(filme) {
    const container = document.getElementById('detailContainer');
    if (!container) return;

    const poster = filme.Poster && filme.Poster !== 'N/A'
        ? filme.Poster
        : 'https://via.placeholder.com/400x600?text=Sem+Imagem';

    const infoFields = [
        { label: 'Título', value: filme.Title },
        { label: 'Ano', value: filme.Year },
        { label: 'Tipo', value: filme.Type },
        { label: 'Gênero', value: filme.Genre },
        { label: 'Direção', value: filme.Director },
        { label: 'Roteiro', value: filme.Writer },
        { label: 'Elenco', value: filme.Actors },
        { label: 'Lançamento', value: filme.Released },
        { label: 'Duração', value: filme.Runtime },
        { label: 'Idioma', value: filme.Language },
        { label: 'País', value: filme.Country },
        { label: 'Prêmios', value: filme.Awards },
        { label: 'Nota IMDb', value: filme.imdbRating },
        { label: 'Votos IMDb', value: filme.imdbVotes },
        { label: 'Metascore', value: filme.Metascore },
        { label: 'Box Office', value: filme.BoxOffice },
        { label: 'Produção', value: filme.Production },
        { label: 'Site', value: filme.Website }
    ];

    const ratingsHtml = (filme.Ratings || []).map(rating => `
        <div class="detail-meta-item">
            <span>${rating.Source}</span>
            <div>${rating.Value}</div>
        </div>
    `).join('');

    const detailFieldsHtml = infoFields
        .filter(field => field.value && field.value !== 'N/A')
        .map(field => `
            <div class="detail-meta-item">
                <span>${field.label}</span>
                <div>${field.value}</div>
            </div>
        `).join('');

    const usuarioLogado = banco.getUsuarioLogado();
    const idUsuario = usuarioLogado?.id_usuario || usuarioLogado?.id || null;

    const favoritoBtn = usuarioLogado
        ? `<button id="btnFavorito" class="btn-favorito">Adicionar aos Favoritos</button>`
        : '';

    container.innerHTML = `
        <div class="detail-page">
            <div class="detail-poster">
                <img src="${poster}" alt="${filme.Title}" />
            </div>
            <div class="detail-info">
                <div class="detail-card">
                    <h2>${filme.Title}</h2>
                    <div class="detail-label">Sinopse</div>
                    <p class="detail-overview">${filme.Plot || 'Resumo não disponível.'}</p>
                    ${favoritoBtn}
                </div>
                <div class="detail-card">
                    <h3>Informações principais</h3>
                    <div class="detail-meta">
                        ${detailFieldsHtml}
                    </div>
                </div>
                ${ratingsHtml ? `
                <div class="detail-card">
                    <h3>Avaliações</h3>
                    <div class="detail-meta">
                        ${ratingsHtml}
                    </div>
                </div>` : ''}
                <div class="option-line">
                    <a class="option-box" href="filmes.html">Ver filmes</a>
                    <a class="option-box" href="series.html">Ver séries</a>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        const btnFavorito = document.getElementById('btnFavorito');

        if (!btnFavorito) {
            console.log("❌ Botão não encontrado");
            return;
        }

        console.log("✅ Botão pronto");

        btnFavorito.onclick = function () {
            const usuarioLogado = banco.getUsuarioLogado();
            const idUsuario = usuarioLogado?.id_usuario || usuarioLogado?.id;

            console.log("👤 ID usuário:", idUsuario);

            if (!idUsuario) {
                mostrarMensagemDetalhe('Usuário não identificado. Faça login novamente.');
                return;
            }

            toggleFavorito(filme, idUsuario);
        };

    }, 100);

    if (idUsuario) {
        verificarFavorito(filme.imdbID, idUsuario);
    }
}

async function toggleFavorito(filme, id_usuario) {
    const btnFavorito = document.getElementById('btnFavorito');
    if (!btnFavorito) return;

    try {
        if (btnFavorito.classList.contains('favoritado')) {
            await banco.removerFavorito(id_usuario, filme.imdbID);

            btnFavorito.textContent = 'Adicionar aos Favoritos';
            btnFavorito.classList.remove('favoritado');

            mostrarMensagemDetalhe('Removido dos favoritos!', 'sucesso');

        } else {
            await banco.adicionarFavorito(id_usuario, filme);

            btnFavorito.textContent = 'Remover dos Favoritos';
            btnFavorito.classList.add('favoritado');

            mostrarMensagemDetalhe('Adicionado aos favoritos!', 'sucesso');

            setTimeout(() => {
                window.location.href = "acesso.html";
            }, 800);
        }
    } catch (error) {
        console.error('Erro ao gerenciar favorito:', error);
        mostrarMensagemDetalhe('Erro ao gerenciar favorito.');
    }
}

async function verificarFavorito(imdbID, id_usuario) {
    try {
        const favoritos = await banco.listarFavoritos(id_usuario);

        const isFavorito = favoritos.some(fav => fav.imdbID === imdbID);

        const btnFavorito = document.getElementById('btnFavorito');

        if (btnFavorito) {
            if (isFavorito) {
                btnFavorito.textContent = 'Remover dos Favoritos';
                btnFavorito.classList.add('favoritado');
            } else {
                btnFavorito.textContent = 'Adicionar aos Favoritos';
                btnFavorito.classList.remove('favoritado');
            }
        }

    } catch (error) {
        console.error('Erro ao verificar favorito:', error);
    }
}

async function carregarDetalhes() {
    const imdbID = getQueryParam('id');

    if (!imdbID) {
        mostrarMensagemDetalhe('ID do filme não informado.');
        return;
    }

    try {
        let filme = await banco.buscarFilmeDetalhes(imdbID);

        // 🔥 CORREÇÃO AQUI
        if (filme && filme.body) {
            filme = JSON.parse(filme.body);
        }

        if (!filme || !filme.Title) {
            mostrarMensagemDetalhe('Filme não encontrado.');
            return;
        }

        renderDetailPage(filme);

    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        mostrarMensagemDetalhe('Não foi possível carregar os detalhes do filme.');
    }
}

document.addEventListener('DOMContentLoaded', carregarDetalhes);