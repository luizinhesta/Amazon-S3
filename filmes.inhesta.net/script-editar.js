// Carregar dados do usuário ao abrir a página
document.addEventListener('DOMContentLoaded', async function() {
    const usuarioLogado = banco.getUsuarioLogado();

    if (!usuarioLogado) {
        window.location.href = 'index.html';
        return;
    }

    
    const nomeCompleto = `${usuarioLogado.nome || ''} ${usuarioLogado.sobrenome || ''}`.trim();
    const userEl = document.getElementById('usuarioLogado');
    if (userEl) {
        userEl.textContent = `Ol�, ${nomeCompleto || 'Usu�rio'}`;
    }

    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            banco.logout();
            window.location.href = 'index.html';
        });
    }

    try {
        // Buscar dados completos do usuário
        const dadosUsuario = await banco.buscarUsuarioPorLogin(usuarioLogado.login);

        // Preencher formulário
        document.getElementById('nome').value = dadosUsuario.nome || '';
        document.getElementById('sobrenome').value = dadosUsuario.sobrenome || '';
        document.getElementById('login').value = dadosUsuario.login || '';
        document.getElementById('email').value = dadosUsuario.email || '';
        document.getElementById('cep').value = dadosUsuario.cep || '';
        document.getElementById('logradouro').value = dadosUsuario.logradouro || '';
        document.getElementById('bairro').value = dadosUsuario.bairro || '';
        document.getElementById('cidade').value = dadosUsuario.cidade || '';
        document.getElementById('estado').value = dadosUsuario.estado || '';

        // Esconder loading e mostrar formulário
        document.getElementById('loading').style.display = 'none';
        document.getElementById('formEditar').style.display = 'block';

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostraMensagem('Erro ao carregar dados do usuário', 'erro');
        document.getElementById('loading').style.display = 'none';
    }
});

// Função para formatar CEP
function formatarCEP(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 5) {
        input.value = value;
    } else {
        input.value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
}

// Função para buscar CEP automaticamente
function buscarCEP() {
    let cep = document.getElementById("cep").value.replace(/\D/g, '');

    if (cep.length === 8) {
        banco.buscarCEP(cep)
            .then(data => {
                document.getElementById("logradouro").value = data.logradouro || '';
                document.getElementById("bairro").value = data.bairro || '';
                document.getElementById("cidade").value = data.cidade || '';
                document.getElementById("estado").value = data.estado || '';
            })
            .catch(error => {
                console.error("Erro:", error);
                limparEndereco();
                mostraMensagem('CEP não encontrado', 'erro');
            });
    } else if (cep.length < 8) {
        limparEndereco();
    }
}

// Limpar campos de endereço
function limparEndereco() {
    document.getElementById("logradouro").value = '';
    document.getElementById("bairro").value = '';
    document.getElementById("cidade").value = '';
    document.getElementById("estado").value = '';
}

// Enviar formulário de edição
document.getElementById("formEditar").addEventListener("submit", async function(e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const login = document.getElementById("login").value.trim();
    const email = document.getElementById("email").value.trim();
    const cep = document.getElementById("cep").value.trim();
    const logradouro = document.getElementById("logradouro").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const estado = document.getElementById("estado").value.trim();
    const senha_atual = document.getElementById("senha_atual").value;
    const nova_senha = document.getElementById("nova_senha").value;
    const confirmar_senha = document.getElementById("confirmar_senha").value;

    // Validar campos obrigatórios
    if (!nome || !sobrenome || !email || !senha_atual) {
        mostraMensagem('Preencha todos os campos obrigatórios', 'erro');
        return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostraMensagem('Email inválido', 'erro');
        return;
    }

    // Validar nova senha se fornecida
    if (nova_senha) {
        if (nova_senha.length < 6) {
            mostraMensagem('Nova senha deve ter pelo menos 6 caracteres', 'erro');
            return;
        }
        if (nova_senha !== confirmar_senha) {
            mostraMensagem('Nova senha e confirmação não coincidem', 'erro');
            return;
        }
    }

    try {
        const dadosEdicao = {
            login: login,
            senha_atual: senha_atual,
            nome: nome,
            sobrenome: sobrenome,
            email: email,
            cep: cep,
            logradouro: logradouro,
            bairro: bairro,
            cidade: cidade,
            estado: estado
        };

        if (nova_senha) {
            dadosEdicao.nova_senha = nova_senha;
        }

        const data = await banco.editarUsuario(dadosEdicao);
        mostraMensagem('Dados atualizados com sucesso!', 'sucesso');

        // Limpar campos de senha após sucesso
        document.getElementById("senha_atual").value = '';
        document.getElementById("nova_senha").value = '';
        document.getElementById("confirmar_senha").value = '';

        // Atualizar dados no localStorage se necessário
        const usuarioLogado = banco.getUsuarioLogado();
        if (usuarioLogado) {
            usuarioLogado.nome = nome;
            usuarioLogado.email = email;
            banco.setUsuarioLogado(usuarioLogado);
        }

    } catch (error) {
        console.error('Erro:', error);
        mostraMensagem(error.message || 'Erro ao atualizar dados', 'erro');
    }
});

// Função para mostrar mensagem
function mostraMensagem(texto, tipo = 'erro') {
    const msg = document.getElementById('mensagem');
    msg.textContent = texto;
    msg.className = 'mensagem ' + tipo;
    msg.style.display = 'block';

    if (tipo === 'sucesso') {
        setTimeout(() => {
            window.location.href = 'acesso.html';
        }, 1200);
    }
}



