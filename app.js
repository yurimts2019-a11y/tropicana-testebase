document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loaded');
});

// NOVO: Função para gerenciar a transição (fade-out)
function handlePageTransition(url) {
    document.documentElement.classList.add('fade-out');
    // Espera a duração da transição (0.3s) antes de navegar
    setTimeout(() => {
        window.location.href = url;
    }, 300); 
}

document.addEventListener('DOMContentLoaded', function() {
    
    // ===================================
    // 1. CONFIGURAÇÕES GLOBAIS E LIMITES
    // ===================================
    const phone = '5565984063195'; // <-- 🚨 SUBSTITUA AQUI PELO SEU NÚMERO DE TELEFONE COM DDD
    const EXTRA_LIMIT = 1; // Limite de adicionais pagos
    const FRUIT_LIMIT = 5; // Limite de frutas grátis

    // Utility para formatar preço (i18n)
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // 1.1 DADOS DO CARDÁPIO (LISTAS ATUALIZADAS com descrição e imagem)
    const tamanhos = [
        { 
            nome: '300ml (P)', 
            preco: 16, 
            id: 'tam-p', 
            description: '🍓Pequena na medida,gigante no sabor!', 
            imageURL: 'salada_300ml.jpg' // 🚨 Mude para o nome real da sua imagem
        },
        { 
            nome: '400ml (M)', 
            preco: 20, 
            id: 'tam-m', 
            description: '🍍O equilíbrio perfeito entre frescor e sabor!', 
            imageURL: 'salada_400ml.jpg' // 🚨 Mude para o nome real da sua imagem
        },
        { 
            nome: '500ml (G)', 
            preco: 24, 
            id: 'tam-g', 
            description: '🍇 Gigante em sabor, perfeita pra dividir (ou não)!', 
            imageURL: 'salada_500ml.jpg' // 🚨 Mude para o nome real da sua imagem
        }
    ];

    // Frutas (Grátis - Máx 5)
    const fruits = ['🍍 Abacaxi', '🍓 Morango', '🥭 Mamão', '🍇 Uva', '🍌 Banana', '🥭 Manga', '🍎 Maçã']; 

    // Extras (R$2,00 cada - Adicionais)
    const extras = [
        { nome: '🥝 Kiwi', preco: 2, id: 'extra-kiwi' } // Emoji de kiwi
    ];

    // Acompanhamentos (Grátis)
    const acomp = ['Creme de Maracujá', 'Creme de Ninho', 'Granola', 'Mel', 'Aveia'];

    // 2. REFERÊNCIAS DO DOM
    const cardsContainer = document.getElementById('cardsContainer');
    const sizeSelectionContainer = document.getElementById('sizeSelectionContainer'); 
    const resumoContent = document.getElementById('resumoContent');
    const modalOverlay = document.getElementById('customizationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalTotalSpan = document.getElementById('modalTotal');
    const addToOrderBtn = document.getElementById('addToOrder');
    const storeStatusSpan = document.querySelector('.store-status');
    // NOVO: Referência ao campo de Observações
    const obsInput = document.getElementById('obsInput'); 

    // Opções de frutas, extras e acomp no modal
    const frutasOpcoesDiv = document.getElementById('frutasOpcoes');
    const extrasOpcoesDiv = document.getElementById('extrasOpcoes');
    const acompOpcoesDiv = document.getElementById('acompOpcoes');

    // 3. ESTADO GLOBAL
    let pedidos = [];
    let itemEmEdicaoIndex = -1; 
    let itemAtual = {};


    // 4. FUNÇÕES DE UTILIDADE E STATUS
    
function checkStoreStatus() {
    // Fuso horário de Cuiabá (MT)
    const now = new Date();
    const dataCuiaba = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/Cuiaba' })
    );

    const dia = dataCuiaba.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const hora = dataCuiaba.getHours();
    const minuto = dataCuiaba.getMinutes();
    const horaDecimal = hora + minuto / 60;

    let aberto = false;

    // Segunda (1) a Quinta (4): 13h às 22h
    if (dia >= 1 && dia <= 4) {
        if (horaDecimal >= 13 && horaDecimal < 22) aberto = true;
    }
    // Sexta (5) e Domingo (0): 13h às 17h
    else if (dia === 5 || dia === 0) {
        // Correção: Se for domingo (0), pode abrir às 13h
        // Sua regra original para Domingo (0) e Sexta (5) era 13h-17h. Usei 10h-17h, vou reverter para 13h-17h
        if (horaDecimal >= 13 && horaDecimal < 17) aberto = true; 
    }
    // Sábado (6): fechado
    else if (dia === 6) {
        aberto = false;
    }

    // Atualiza o status na interface
    if (aberto) {
        storeStatusSpan.textContent = 'Aberto Agora';
        storeStatusSpan.style.backgroundColor = '#e8f5e9';
        storeStatusSpan.style.color = '#2e7d32';
    } else {
        storeStatusSpan.textContent = 'Fechado';
        storeStatusSpan.style.backgroundColor = '#fff3e0';
        storeStatusSpan.style.color = 'var(--orange)';
    }
}

    // 5. FUNÇÕES DO MODAL
    function calcularTotal(item) {
        if (!item.tamanho || !item.tamanho.preco) return 0;
        
        let total = item.tamanho.preco;
        
        // Custo de extras (R$2,00 por extra)
        const custoExtras = item.extras.length * extras[0].preco;
        total += custoExtras;

        item.total = total; // Salva o total no objeto do item
        modalTotalSpan.textContent = formatCurrency(total);
        return total;
    }

    function atualizarModalResumo() {
        // O resumo detalhado foi removido do modal. 
        // A função agora serve apenas para recalcular e atualizar o total na tela.
        calcularTotal(itemAtual);
    }
    
    function renderizarOpcoes(container, lista, tipo, limit) {
        container.innerHTML = '';
        const tipoLower = tipo.toLowerCase();
        
        // Adiciona uma classe para o novo estilo de lista
        container.classList.add('list-options');
        
        lista.forEach(item => {
            const nome = typeof item === 'string' ? item : item.nome;
            const id = nome.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const checked = itemAtual[tipoLower].some(i => i.nome === nome);
            const isDisabled = !checked && itemAtual[tipoLower].length >= limit && limit > 0;
            
            // Usa div para o item
            const itemDiv = document.createElement('div');
            itemDiv.className = `option-item ${checked ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`;
            itemDiv.setAttribute('tabindex', isDisabled ? '-1' : '0'); 
            
            // CÓDIGO DO PREÇO CONCATENADO NA MESMA LINHA:
            let nomeComPreco = nome;
            if (tipoLower === 'extras') {
                // Adiciona o preço diretamente ao nome para exibição na mesma linha
                nomeComPreco += ' (+R$ 2,00)';
            }
            // FIM CÓDIGO DO PREÇO CONCATENADO

            itemDiv.innerHTML = `
                <label class="option-label" for="${tipo}-${id}">
                    <span class="option-name">${nomeComPreco}</span> 
                </label>
                <input type="checkbox" id="${tipo}-${id}" data-nome="${nome}" data-tipo="${tipo}" 
                        ${checked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
            `;
            
            // Adiciona o listener principal ao itemDiv
            itemDiv.addEventListener('click', (e) => {
                // Se estiver desabilitado (e não estiver checado), impede a ação e alerta
                if (isDisabled && !checked) {
                    e.preventDefault();
                    if (tipo === 'FRUITS') {
                        alert(`Limite de ${FRUIT_LIMIT} frutas grátis atingido!`);
                    } else if (tipo === 'EXTRAS') {
                        alert(`Limite de ${EXTRA_LIMIT} adicionais de fruta atingido!`);
                    }
                    return;
                }
                
                // Se o clique não foi no input, inverte o estado do checkbox antes de chamar o handler
                if (e.target.tagName !== 'INPUT') {
                    const checkbox = itemDiv.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                
                // Chamada do handler para atualizar o itemAtual e re-renderizar
                handleOptionToggle(nome, tipo); 
            });
            
            // Adiciona listener ao input (se alguém clicar especificamente nele)
            itemDiv.querySelector('input[type="checkbox"]').addEventListener('change', () => {
                     handleOptionToggle(nome, tipo); 
            });
            
            container.appendChild(itemDiv);
        });
        atualizarModalResumo();
    }
    
    function handleOptionToggle(nome, tipo) {
        const tipoLower = tipo.toLowerCase();
        const listaAtual = itemAtual[tipoLower];
        const isChecked = listaAtual.some(i => i.nome === nome);
        const limit = tipoLower === 'fruits' ? FRUIT_LIMIT : tipoLower === 'extras' ? EXTRA_LIMIT : 99;

        if (isChecked) {
            itemAtual[tipoLower] = listaAtual.filter(i => i.nome !== nome);
        } else if (listaAtual.length < limit) {
            const itemObj = tipoLower === 'extras' ? extras.find(e => e.nome === nome) : { nome: nome };
            itemAtual[tipoLower].push(itemObj);
        }

        // Re-renderiza para atualizar o estado de checked/disabled E o visual do novo item
        if (tipoLower === 'fruits') {
            renderizarOpcoes(frutasOpcoesDiv, fruits, 'FRUITS', FRUIT_LIMIT);
        } else if (tipoLower === 'extras') {
            renderizarOpcoes(extrasOpcoesDiv, extras, 'EXTRAS', EXTRA_LIMIT);
        } else if (tipoLower === 'acomp') {
            renderizarOpcoes(acompOpcoesDiv, acomp, 'ACOMP', 99);
        }
        
        atualizarModalResumo();
    }

    function openModal(tamanho, index = -1) {
        modalOverlay.style.display = 'flex';
        document.body.classList.add('modal-open');

        // Se estiver editando, carrega o item existente
        if (index !== -1) {
            itemEmEdicaoIndex = index;
            itemAtual = JSON.parse(JSON.stringify(pedidos[index])); // Clonar o objeto para edição
            modalTitle.textContent = `Editar Salada #${index + 1} (${itemAtual.tamanho.nome})`;
            addToOrderBtn.textContent = 'Salvar Alterações';
            
            // ✅ CORRIGIDO: Preenche o campo de observações ao editar, usando a chave 'obs' (ou 'observacoes' para compatibilidade)
            obsInput.value = itemAtual.obs || itemAtual.observacoes || ''; 
        } else {
            itemEmEdicaoIndex = -1;
            itemAtual = { 
                tamanho: tamanho, 
                fruits: [], 
                extras: [], 
                acomp: [], 
                obs: '', // ✅ CORRIGIDO: Usa a chave 'obs' (limpa para novo item)
                total: 0
            };
            modalTitle.textContent = `Personalizar Salada ${tamanho.nome}`;
            addToOrderBtn.textContent = 'Adicionar ao Pedido - ' + formatCurrency(tamanho.preco);
            
            // NOVO: Limpa o campo para novo item
            obsInput.value = ''; 
        }

        renderizarOpcoes(frutasOpcoesDiv, fruits, 'FRUITS', FRUIT_LIMIT);
        renderizarOpcoes(extrasOpcoesDiv, extras, 'EXTRAS', EXTRA_LIMIT);
        renderizarOpcoes(acompOpcoesDiv, acomp, 'ACOMP', 99);
        atualizarModalResumo();
        
        // 🚀 NOVO CÓDIGO: Rola a página para o topo assim que o modal é aberto/carregado
        window.scrollTo(0, 0); 
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        document.body.classList.remove('modal-open');
        itemAtual = {};
        itemEmEdicaoIndex = -1;
    }
    
    // 6. RENDERIZAÇÃO INICIAL (SELEÇÃO DE TAMANHO)
    function renderizarSelecaoTamanho() {
        sizeSelectionContainer.innerHTML = '';
        tamanhos.forEach(tamanho => {
            const precoTexto = formatCurrency(tamanho.preco);
            const card = document.createElement('div');
            // Usando a nova classe 'vertical-card' para o novo layout
            card.className = 'size-card vertical-card'; 
            
            // Cria um data-attribute com o objeto tamanho
            const tamanhoStr = JSON.stringify(tamanho).replace(/"/g, '&quot;'); 
            card.setAttribute('data-tamanho', tamanhoStr);

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${tamanho.imageURL}" alt="Salada de Frutas ${tamanho.nome}" loading="lazy">
                </div>
                <div class="card-content">
                    <div class="card-header-row">
                        <div class="size-name">${tamanho.nome}</div>
                        <div class="size-price">${precoTexto}</div>
                    </div>
                    <p class="size-description">${tamanho.description}</p>
                    <button class="btn small-btn">Montar</button>
                </div>
            `;
            
            sizeSelectionContainer.appendChild(card);
        });
        attachSizeCardListeners();
    }

    // Função para anexar listeners de forma programática
    function attachSizeCardListeners() {
        document.querySelectorAll('.size-card').forEach(card => {
            // Remove listener para evitar duplicação em re-renderizações
            card.removeEventListener('click', handleSizeCardClick); 
            card.addEventListener('click', handleSizeCardClick);
        });
    }

    // Função de tratamento de clique isolada
    function handleSizeCardClick() {
        try {
            // Lê o objeto JSON diretamente do data-attribute
            const tamanho = JSON.parse(this.dataset.tamanho.replace(/&quot;/g, '\"'));
            openModal(tamanho);
