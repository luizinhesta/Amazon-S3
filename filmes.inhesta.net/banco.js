// ==============================
// CONFIG API
// ==============================
const API_BASE_URL = "ENDEREÇO-API";

function apiUrl(path) {
    return `${API_BASE_URL}/${path}`;
}


// ==============================
// CLASSE PRINCIPAL (API)
// ==============================
class BancoDados {

    // ==============================
    // 📦 TRATAMENTO PADRÃO
    // ==============================
    async tratarResposta(response) {
        let data;

        try {
            data = await response.json();
        } catch (error) {
            throw new Error(`Resposta inválida da API (${response.status})`);
        }

        if (data && typeof data.body !== "undefined") {
            try {
                data = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
            } catch (error) {
                throw new Error("Erro ao interpretar resposta da API");
            }
        }

        if (!response.ok) {
            throw new Error(data?.erro || data?.message || `Erro HTTP: ${response.status}`);
        }

        return data;
    }

    // ==============================
    // 🔐 LOGIN
    // ==============================
    async buscarUsuario(login, senha) {
        try {
            const response = await fetch(apiUrl("login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ login, senha })
            });

            const data = await this.tratarResposta(response);

            if (!data.sucesso || !data.usuario) {
                return null;
            }

            return {
                ...data.usuario,
                id_usuario: data.usuario.id_usuario || data.usuario.id || data.usuario.login || login
            };

        } catch (error) {
            console.error("❌ Erro login:", error);
            return null;
        }
    }

    // ==============================
    // 🆕 CADASTRO
    // ==============================
    async adicionarUsuario(usuario) {
        try {
            const response = await fetch(apiUrl("cadastro"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(usuario)
            });

            const data = await this.tratarResposta(response);

            if (!data.sucesso) {
                throw new Error(data.erro || "Erro ao cadastrar usuário");
            }

            return data;

        } catch (error) {
            console.error("❌ Erro cadastro:", error);
            throw error;
        }
    }

    // ==============================
    // 📍 CEP
    // ==============================
    async buscarCEP(cep) {
        try {
            const cepLimpo = String(cep || "").replace(/\D/g, "");

            if (cepLimpo.length !== 8) {
                throw new Error("CEP inválido");
            }

            const response = await fetch(apiUrl(`cep?cep=${cepLimpo}`), {
                method: "GET"
            });

            const data = await this.tratarResposta(response);

            return {
                logradouro: data.logradouro || "",
                bairro: data.bairro || "",
                cidade: data.cidade || "",
                estado: data.estado || ""
            };

        } catch (error) {
            console.error("❌ Erro CEP:", error);
            throw error;
        }
    }

    // ==============================
    // 🎬 FILMES
    // ==============================
    async buscarFilmes({ tipo = "movie", query = "", ano = "" } = {}) {
        try {
            const params = new URLSearchParams();

            params.append("type", tipo);

            if (query && query.trim() !== "") {
                params.append("q", query.trim());
            }

            if (ano && ano !== "") {
                params.append("y", ano);
            }

            const url = apiUrl(`filmes?${params.toString()}`);
            console.log("📡 URL:", url);

            const response = await fetch(url, {
                method: "GET"
            });

            const data = await this.tratarResposta(response);

            let filmes = [];

            if (Array.isArray(data)) {
                filmes = data;
            } else if (data.filmes) {
                filmes = data.filmes;
            }

            if (!Array.isArray(filmes)) {
                return [];
            }

            filmes = filmes.map(f => ({
                Title: f.Title || f.titulo || "",
                Year: f.Year || f.ano || "",
                Poster: f.Poster || f.poster || "",
                imdbID: f.imdbID || f.id || "",
                Type: f.Type || f.tipo || ""
            }));

            filmes.sort((a, b) => {
                const nomeA = (a.Title || "").toLowerCase();
                const nomeB = (b.Title || "").toLowerCase();
                return nomeA.localeCompare(nomeB);
            });

            return filmes;

        } catch (error) {
            console.error("❌ Erro filmes:", error);
            return [];
        }
    }

    // ==============================
    // 🎬 DETALHES (🔥 CORRIGIDO)
    // ==============================
    async buscarFilmeDetalhes(imdbID) {
        try {
            if (!imdbID) {
                throw new Error("ID do filme não informado");
            }

            const url = apiUrl(`filme-detalhe?id=${encodeURIComponent(imdbID)}`);
            console.log("🎬 URL detalhes:", url);

            const response = await fetch(url, {
                method: "GET"
            });

            let data = await response.json();

            console.log("🎬 Resposta bruta:", data);

            // 🔥 CORREÇÃO AQUI
            if (data && typeof data.body !== "undefined") {
                data = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
            }

            console.log("🎬 Resposta tratada:", data);

            return data;

        } catch (error) {
            console.error("❌ Erro detalhes:", error);
            return null;
        }
    }

    // ==============================
    // ⭐ FAVORITOS
    // ==============================
    async listarFavoritos(id_usuario) {
        try {
            const url = apiUrl(`favoritos?id_usuario=${encodeURIComponent(id_usuario)}`);
            console.log("⭐ GET favoritos:", url);

            const response = await fetch(url, {
                method: "GET"
            });

            const data = await this.tratarResposta(response);
            return Array.isArray(data.favoritos) ? data.favoritos : [];

        } catch (error) {
            console.error("❌ Erro listar favoritos:", error);
            return [];
        }
    }

    async adicionarFavorito(id_usuario, filme) {
        try {
            const url = apiUrl("favoritos");
            console.log("⭐ POST favorito:", url, { id_usuario, filme });

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id_usuario, filme })
            });

            return await this.tratarResposta(response);

        } catch (error) {
            console.error("❌ Erro adicionar favorito:", error);
            throw error;
        }
    }

    async removerFavorito(id_usuario, imdbID) {
        try {
            const url = apiUrl("favoritos");
            console.log("⭐ DELETE favorito:", url, { id_usuario, imdbID });

            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id_usuario, imdbID })
            });

            return await this.tratarResposta(response);

        } catch (error) {
            console.error("❌ Erro remover favorito:", error);
            throw error;
        }
    }

    // ==============================
    // 💾 SESSÃO
    // ==============================
    getUsuarioLogado() {
        try {
            const usuario = localStorage.getItem("usuarioLogado");
            if (!usuario) return null;

            const user = JSON.parse(usuario);

            if (!user.id_usuario) {
                user.id_usuario = user.id || user.login || null;
            }

            return user;

        } catch (error) {
            console.error("❌ Erro ao ler usuário:", error);
            return null;
        }
    }

    setUsuarioLogado(usuario) {
        try {
            const usuarioCorrigido = {
                ...usuario,
                id_usuario: usuario?.id_usuario || usuario?.id || usuario?.login || null
            };

            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioCorrigido));
        } catch (error) {
            console.error("❌ Erro ao salvar usuário logado:", error);
        }
    }

    logout() {
        localStorage.removeItem("usuarioLogado");
    }
}


// ==============================
// 🌎 INSTÂNCIA GLOBAL
// ==============================
const banco = new BancoDados();