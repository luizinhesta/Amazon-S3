document.addEventListener('DOMContentLoaded', function () {

    const usuarioLogado = banco.getUsuarioLogado();
    if (usuarioLogado) {
        mostrarUsuarioLogado();
    }

    const formLogin = document.getElementById('formLogin');
    if (!formLogin) return;

    formLogin.addEventListener('submit', async function (e) {
        e.preventDefault();

        const login = document.getElementById('login').value.trim();
        const senha = document.getElementById('senha').value;

        if (!login || !senha) {
            mostraMensagem('Preencha login e senha', 'erro');
            return;
        }

        try {
            const usuario = await banco.buscarUsuario(login, senha);

            if (usuario) {
                banco.setUsuarioLogado(usuario);

                mostraMensagem('Login realizado com sucesso!', 'sucesso');
                mostrarUsuarioLogado();

            } else {
                mostraMensagem('Login ou senha incorretos', 'erro');
            }

        } catch (error) {
            console.error(error);
            mostraMensagem('Erro ao conectar com a API', 'erro');
        }
    });
});


function mostrarUsuarioLogado() {
    const usuario = banco.getUsuarioLogado();
    if (!usuario) return;

    const status = document.getElementById('userStatus');
    const formLogin = document.getElementById('formLogin');

    if (!status) return;

    // 🔥 GARANTE QUE OS BOTÕES EXISTEM
    status.innerHTML = `
        <span id="nomeUsuario">Usuário: <strong>${usuario.nome} ${usuario.sobrenome}</strong></span>
        <button id="btnRestrito" class="btn-editar">Área Restrita</button>
        <button id="btnSair" class="btn-sair">Sair</button>
    `;

    status.style.display = 'flex';

    // 🔥 ESCONDE LOGIN
    if (formLogin) formLogin.style.display = 'none';

    // 🔥 EVENTO BOTÃO RESTRITO
    const btnRestrito = document.getElementById('btnRestrito');
    if (btnRestrito) {
        btnRestrito.onclick = function () {
            window.location.href = "acesso.html";
        };
    }

    // 🔥 EVENTO SAIR
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.onclick = function () {
            banco.logout();
            window.location.reload();
        };
    }
}


function mostraMensagem(texto, tipo) {
    const msg = document.getElementById('mensagem');
    if (!msg) return;

    msg.textContent = texto;
    msg.className = 'mensagem ' + tipo;
    msg.style.display = 'block';
}