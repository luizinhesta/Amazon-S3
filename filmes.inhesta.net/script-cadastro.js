// ==============================
// 🧹 LIMPAR ENDEREÇO
// ==============================
function limparEndereco() {
    document.getElementById("logradouro").value = "";
    document.getElementById("bairro").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("estado").value = "";
}


// ==============================
// 📍 BUSCAR CEP
// ==============================
async function buscarCEP() {
    const cep = document.getElementById("cep").value.replace(/\D/g, "");

    if (cep.length < 8) {
        limparEndereco();
        return;
    }

    if (cep.length !== 8) {
        mostraMensagem("CEP inválido", "erro");
        limparEndereco();
        return;
    }

    try {
        const data = await banco.buscarCEP(cep);

        document.getElementById("logradouro").value = data.logradouro || "";
        document.getElementById("bairro").value = data.bairro || "";
        document.getElementById("cidade").value = data.cidade || "";
        document.getElementById("estado").value = data.estado || "";
    } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        limparEndereco();
        mostraMensagem(error.message || "CEP não encontrado", "erro");
    }
}


// ==============================
// 💬 MENSAGEM
// ==============================
function mostraMensagem(texto, tipo) {
    const msg = document.getElementById("mensagem");

    if (!msg) {
        alert(texto);
        return;
    }

    msg.textContent = texto;
    msg.className = `mensagem ${tipo}`;
    msg.style.display = "block";

    if (tipo === "sucesso") {
        setTimeout(() => {
            window.location.href = "acesso.html";
        }, 1200);
    }
}


// ==============================
// 📌 FORMATAR CEP
// ==============================
document.getElementById("cep").addEventListener("input", function (e) {
    let valor = e.target.value.replace(/\D/g, "");

    if (valor.length > 8) {
        valor = valor.substring(0, 8);
    }

    if (valor.length > 5) {
        valor = valor.substring(0, 5) + "-" + valor.substring(5);
    }

    e.target.value = valor;

    if (valor.replace(/\D/g, "").length === 8) {
        buscarCEP();
    } else {
        limparEndereco();
    }
});


// ==============================
// 📝 ENVIAR FORMULÁRIO
// ==============================
document.getElementById("formCadastro").addEventListener("submit", async function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const login = document.getElementById("login").value.trim();
    const senha = document.getElementById("senha").value;
    const email = document.getElementById("email").value.trim();
    const cep = document.getElementById("cep").value.replace(/\D/g, "");
    const logradouro = document.getElementById("logradouro").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const estado = document.getElementById("estado").value.trim();

    if (!nome || !sobrenome || !login || !senha || !email) {
        mostraMensagem("Preencha todos os campos obrigatórios", "erro");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostraMensagem("Email inválido", "erro");
        return;
    }

    try {
        const usuario = {
            nome,
            sobrenome,
            login,
            senha,
            email,
            cep,
            logradouro,
            bairro,
            cidade,
            estado
        };

        const data = await banco.adicionarUsuario(usuario);

        if (data && data.usuario) {
            banco.setUsuarioLogado(data.usuario);
        } else {
            banco.setUsuarioLogado({
                nome,
                sobrenome,
                login,
                email
            });
        }

        mostraMensagem("Usuário cadastrado com sucesso!", "sucesso");

        document.getElementById("formCadastro").reset();
        limparEndereco();

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        mostraMensagem(error.message || "Erro ao cadastrar usuário", "erro");
    }
});