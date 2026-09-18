// ==========================================
// CONEXÃO COM O SUPABASE
// ==========================================

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ==========================================
// ELEMENTOS DO MODAL
// ==========================================

const produtoModal =
    document.getElementById("produto-modal");

const modalImagem =
    document.getElementById("modal-imagem");

const modalNome =
    document.getElementById("modal-nome");

const modalDescricao =
    document.getElementById("modal-descricao");

const modalPreco =
    document.getElementById("modal-preco");

const modalWhatsApp =
    document.getElementById("modal-whatsapp");

const fecharModal =
    document.getElementById("fechar-modal");

const modalOverlay =
    document.querySelector(".produto-modal-overlay");


// ==========================================
// CRIAR LINK DE WHATSAPP DO PRODUTO
// ==========================================

function criarLinkWhatsApp(produto) {

    const numero =
        SITE_CONFIG.whatsapp;


    if (!numero) {

        console.warn(
            "Número do WhatsApp não configurado no site-config.js."
        );

        return "#";
    }


    const preco =
        Number(produto.preco)
            .toFixed(2)
            .replace(".", ",");


    const mensagem = `
Olá! Tenho interesse no produto:

${produto.nome}

Valor: R$ ${preco}

Gostaria de saber mais informações.
`;


    return (
        `https://wa.me/${numero}` +
        `?text=${encodeURIComponent(mensagem)}`
    );
}


// ==========================================
// CONFIGURAR WHATSAPP E INSTAGRAM
// ==========================================

function configurarLinks() {

    // ======================================
    // WHATSAPP
    // ======================================

    const botoesWhatsApp =
        document.querySelectorAll(
            ".btn-whatsapp"
        );


    botoesWhatsApp.forEach(botao => {

        if (SITE_CONFIG.whatsapp) {

            botao.href =
                `https://wa.me/${SITE_CONFIG.whatsapp}`;
        }


        botao.target =
            "_blank";


        botao.rel =
            "noopener noreferrer";
    });


    // ======================================
    // INSTAGRAM
    // ======================================

    const botoesInstagram =
        document.querySelectorAll(
            ".btn-instagram"
        );


    botoesInstagram.forEach(botao => {

        if (SITE_CONFIG.instagram) {

            botao.href =
                SITE_CONFIG.instagram;
        }


        botao.target =
            "_blank";


        botao.rel =
            "noopener noreferrer";
    });
}


// ==========================================
// ABRIR MODAL DO PRODUTO
// ==========================================

function abrirProduto(produto) {

    if (!produtoModal) {

        console.warn(
            "Modal do produto não encontrado."
        );

        return;
    }


    // Imagem

    if (modalImagem) {

        modalImagem.src =
            produto.imagem_url;

        modalImagem.alt =
            produto.nome;
    }


    // Nome

    if (modalNome) {

        modalNome.textContent =
            produto.nome;
    }


    // Descrição

    if (modalDescricao) {

        modalDescricao.textContent =
            produto.descricao ?? "";
    }


    // Preço

    if (modalPreco) {

        modalPreco.textContent =
            `R$ ${Number(produto.preco)
                .toFixed(2)
                .replace(".", ",")}`;
    }


    // WhatsApp

    if (modalWhatsApp) {

        modalWhatsApp.href =
            criarLinkWhatsApp(produto);
    }


    // Abrir modal

    produtoModal.classList.add(
        "aberto"
    );


    // Impedir rolagem da página

    document.body.style.overflow =
        "hidden";
}


// ==========================================
// FECHAR MODAL
// ==========================================

function fecharProdutoModal() {

    if (!produtoModal) {

        return;
    }


    produtoModal.classList.remove(
        "aberto"
    );


    // Liberar rolagem

    document.body.style.overflow =
        "";
}


// ==========================================
// EVENTO DO BOTÃO FECHAR
// ==========================================

if (fecharModal) {

    fecharModal.addEventListener(
        "click",
        fecharProdutoModal
    );
}


// ==========================================
// FECHAR CLICANDO NO FUNDO
// ==========================================

if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        fecharProdutoModal
    );
}


// ==========================================
// FECHAR COM ESC
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            produtoModal?.classList.contains(
                "aberto"
            )
        ) {

            fecharProdutoModal();
        }
    }
);


// ==========================================
// CARREGAR PRODUTOS
// ==========================================

async function carregarProdutos() {

    console.log(
        "Iniciando busca de produtos..."
    );


    const container =
        document.getElementById(
            "produtos"
        );


    // ======================================
    // VERIFICAR CONTAINER
    // ======================================

    if (!container) {

        console.error(
            "Elemento #produtos não encontrado."
        );

        return;
    }


    container.innerHTML = `
        <p>
            Carregando produtos...
        </p>
    `;


    // ======================================
    // VERIFICAR VITRINE
    // ======================================

    if (!SITE_CONFIG.vitrineId) {

        console.error(
            "ID da vitrine não configurado."
        );


        container.innerHTML = `
            <p>
                Vitrine não configurada.
            </p>
        `;


        return;
    }


    // ======================================
    // BUSCAR PRODUTOS DA VITRINE
    // ======================================

    const {
        data,
        error
    } =
        await supabaseClient
            .from("produtos")
            .select("*")
            .eq(
                "ativo",
                true
            )
            .eq(
                "vitrine_id",
                SITE_CONFIG.vitrineId
            )
            .order(
                "criado_em",
                {
                    ascending: false
                }
            );


    console.log(
        "DATA:",
        data
    );


    console.log(
        "ERROR:",
        error
    );


    // ======================================
    // ERRO
    // ======================================

    if (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );


        container.innerHTML = `
            <p>
                Erro ao carregar produtos.
            </p>
        `;


        return;
    }


    // ======================================
    // NENHUM PRODUTO
    // ======================================

    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `
            <p>
                Nenhum produto disponível.
            </p>
        `;


        return;
    }


    // ======================================
    // LIMPAR CONTAINER
    // ======================================

    container.innerHTML = "";


    // ======================================
    // CRIAR CARDS
    // ======================================

    data.forEach(produto => {

        const card =
            document.createElement(
                "article"
            );


        card.classList.add(
            "produto"
        );


        card.innerHTML = `
            <img
                src="${produto.imagem_url}"
                alt="${produto.nome}"
            >

            <div class="produto-info">

                <h3>
                    ${produto.nome}
                </h3>

                <p>
                    ${produto.descricao ?? ""}
                </p>

                <div class="preco">
                    R$
                    ${Number(produto.preco)
                        .toFixed(2)
                        .replace(".", ",")}
                </div>

                <a
                    class="btn-produto-whatsapp"
                    href="${criarLinkWhatsApp(produto)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Falar no WhatsApp
                </a>

            </div>
        `;


        // ==================================
        // ABRIR MODAL AO CLICAR NO CARD
        // ==================================

        card.addEventListener(
            "click",
            event => {

                // Se clicou no WhatsApp,
                // mantém o comportamento normal

                if (
                    event.target.closest(
                        ".btn-produto-whatsapp"
                    )
                ) {

                    return;
                }


                abrirProduto(produto);
            }
        );


        container.appendChild(
            card
        );

    });
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

async function iniciarSite() {

    configurarLinks();

    await carregarProdutos();
}


// ==========================================
// EXECUTAR QUANDO O HTML ESTIVER PRONTO
// ==========================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarSite
    );

} else {

    iniciarSite();

}