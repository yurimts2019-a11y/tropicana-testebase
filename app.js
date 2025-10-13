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
    const phone = '5565993321761'; // <-- 🚨 SUBSTITUA AQUI PELO SEU NÚMERO DE TELEFONE COM DDD
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
            description: '🍓Pequena na medida, gigante no sabor!', 
            imageURL: 'salada_300ml.jpg' 
        },
        { 
            nome: '400ml (M)', 
            preco: 20, 
            id: 'tam-m', 
            description: '🍍O equilíbrio perfeito entre frescor e sabor!', 
            imageURL: 'salada_400ml.jpg' 
        },
        { 
            nome: '500ml (G)', 
            preco: 24, 
            id: 'tam-g', 
            description: '🍇 Gigante em sabor, perfeita pra dividir (ou não)!', 
            imageURL: 'salada_500ml.jpg' 
        }
    ];

    // Frutas (Grátis - Máx 5)
    const fruits = ['🍍 Abacaxi', '🍓 Morango', '🥭 Mamão', '🍇 Uva', '🍌 Banana', '🥭 Manga', '🍎 Maçã']; 

    // Extras (R$2,00 cada - Adicionais)
    const extras = [
        { nome: '🥝 Kiwi', preco: 2, id: 'extra-kiwi' } 
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
      const now = new Date();
      const dataCuiaba = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/Cuiaba' })
      );

      const dia = dataCuiaba.getDay();
      const hora = dataCuiaba.getHours();
      const minuto = dataCuiaba.getMinutes();
      const horaDecimal = hora + minuto / 60;

      let aberto = false;

      if (dia >= 1 && dia <= 4) {
        if (horaDecimal >= 13 && horaDecimal < 22) aberto = true;
      } else if (dia === 5 || dia === 0) {
        if (horaDecimal >= 13 && horaDecimal < 17) aberto = true;
      }

      const storeStatusSpan = document.querySelector('.store-status');

      if (aberto) {
        storeStatusSpan.textContent = 'Aberto Agora';
        storeStatusSpan.style.backgroundColor = '#e8f5e9';
        storeStatusSpan.style.color = '#2e7d32';
        document.body.classList.remove('store-closed');
      } else {
        storeStatusSpan.textContent = 'Fechado';
        storeStatusSpan.style.backgroundColor = '#fff3e0';
        storeStatusSpan.style.color = 'var(--orange)';
        document.body.classList.add('store-closed');
      }
    }


    // 5. FUNÇÕES DO MODAL
    function calcularTotal(item) {
        if (!item.tamanho || !item.tamanho.preco) return 0;
        
        let total = item.tamanho.preco;
        
        // Custo de extras (R$2,00 por extra)
        const custoExtras = item.extras.length * extras[0].preco;
        total += custoExtras;

        item.total = total; 
        modalTotalSpan.textContent = formatCurrency(total);
        return total;
    }

    function atualizarModalResumo() {
        calcularTotal(itemAtual);
    }
    
    function renderizarOpcoes(container, lista, tipo, limit) {
        container.innerHTML = '';
        const tipoLower = tipo.toLowerCase();
        
        container.classList.add('list-options');
        
        lista.forEach(item => {
            const nome = typeof item === 'string' ? item : item.nome;
            const id = nome.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const checked = itemAtual[tipoLower].some(i => i.nome === nome);
            const isDisabled = !checked && itemAtual[tipoLower].length >= limit && limit > 0;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = `option-item ${checked ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`;
            itemDiv.setAttribute('tabindex', isDisabled ? '-1' : '0'); 
            
            let nomeComPreco = nome;
            if (tipoLower === 'extras') {
                nomeComPreco += ' (+R$ 2,00)';
            }

            itemDiv.innerHTML = `
                <label class="option-label" for="${tipo}-${id}">
                    <span class="option-name">${nomeComPreco}</span> 
                </label>
                <input type="checkbox" id="${tipo}-${id}" data-nome="${nome}" data-tipo="${tipo}" 
                        ${checked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
            `;
            
            itemDiv.addEventListener('click', (e) => {
                if (isDisabled && !checked) {
                    e.preventDefault();
                    if (tipo === 'FRUITS') {
                        alert(`Limite de ${FRUIT_LIMIT} frutas grátis atingido!`);
                    } else if (tipo === 'EXTRAS') {
                        alert(`Limite de ${EXTRA_LIMIT} adicionais de fruta atingido!`);
                    }
                    return;
                }
                
                if (e.target.tagName !== 'INPUT') {
                    const checkbox = itemDiv.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                
                handleOptionToggle(nome, tipo); 
            });
            
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

        if (index !== -1) {
            itemEmEdicaoIndex = index;
            itemAtual = JSON.parse(JSON.stringify(pedidos[index])); 
            modalTitle.textContent = `Editar Salada #${index + 1} (${itemAtual.tamanho.nome})`;
            addToOrderBtn.textContent = 'Salvar Alterações'; 
            obsInput.value = itemAtual.obs || itemAtual.observacoes || '';
        } else {
            itemEmEdicaoIndex = -1;
            itemAtual = { 
                tamanho: tamanho, 
                fruits: [], 
                extras: [], 
                acomp: [], 
                obs: '', 
                total: 0 
            };
            modalTitle.textContent = `Personalizar Salada ${tamanho.nome}`;
            addToOrderBtn.textContent = 'Adicionar ao Pedido - ' + formatCurrency(tamanho.preco);
            obsInput.value = '';
        } 
        renderizarOpcoes(frutasOpcoesDiv, fruits, 'FRUITS', FRUIT_LIMIT);
        renderizarOpcoes(extrasOpcoesDiv, extras, 'EXTRAS', EXTRA_LIMIT);
        renderizarOpcoes(acompOpcoesDiv, acomp, 'ACOMP', 99);
        atualizarModalResumo();
        window.scrollTo(0, 0); 
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        document.body.classList.remove('modal-open');
        itemAtual = {};
        itemEmEdicaoIndex = -1;
    }

    // 6. RENDERIZAÇÃO E MANIPULAÇÃO DO PEDIDO (Simplificado)
    
    function renderizarSelecaoTamanho() {
        sizeSelectionContainer.innerHTML = '';
        tamanhos.forEach(tamanho => {
            const card = document.createElement('div');
            card.className = 'size-card';
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${tamanho.imageURL}" alt="Salada de ${tamanho.nome}">
                </div>
                <div class="card-content">
                    <div>
                        <div class="card-header-row">
                            <h3 class="size-name">${tamanho.nome}</h3>
                            <p class="size-price">${formatCurrency(tamanho.preco)}</p>
                        </div>
                        <p class="size-description">${tamanho.description}</p>
                    </div>
                    <button class="btn small-btn" onclick="openModal(tamanhos.find(t => t.id === '${tamanho.id}'))">
                        Personalizar
                    </button>
                </div>
            `;
            sizeSelectionContainer.appendChild(card);
        });
    }

    function formatItem(item) {
        let resumo = `<span class="detail-label">${item.tamanho.nome}</span> (${formatCurrency(item.total)})`;
        
        if (item.fruits.length > 0) {
            resumo += ' | Frutas: ' + item.fruits.map(f => f.nome.split(' ')[1]).join(', ');
        }
        if (item.extras.length > 0) {
            resumo += ' | Extras: ' + item.extras.map(e => e.nome.split(' ')[1]).join(', ');
        }
        if (item.acomp.length > 0) {
            resumo += ' | Acomp: ' + item.acomp.map(a => a.nome).join(', ');
        }
        if (item.obs) {
             resumo += ` | Obs: ${item.obs}`;
        }
        return resumo;
    }
    
    function renderizarResumoPedido() {
        pedidos = JSON.parse(localStorage.getItem('tropicanaPedidos') || '[]');
        resumoContent.innerHTML = '';
        let total = 0;
        
        if (pedidos.length === 0) {
            resumoContent.innerHTML = '<p class="empty-cart">Seu pedido está vazio. Escolha um tamanho acima!</p>';
            document.getElementById('adicionarPedidoBtn').style.display = 'none';
            document.getElementById('totalResumo').textContent = '';
            return;
        }

        pedidos.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'resumo-item-card section-card';
            itemDiv.innerHTML = `
                <div class="item-header">
                    <h4 class="item-title">Salada #${index + 1}</h4>
                    <div class="item-actions">
                         <button class="action-btn edit-btn" onclick="editItem(${index})">
                            <span class="icon">✏️</span>
                        </button>
                        <button class="action-btn delete-btn" onclick="excluirItem(${index})">
                            <span class="icon">🗑️</span>
                        </button>
                    </div>
                </div>
                <p class="item-details">${formatItem(item)}</p>
                <div class="item-price-final">
                   Total: ${formatCurrency(item.total)}
                </div>
            `;
            resumoContent.appendChild(itemDiv);
            total += item.total;
        });
        
        document.getElementById('totalResumo').textContent = formatCurrency(total);
        document.getElementById('adicionarPedidoBtn').style.display = 'block';
    }

    function addToOrder() {
        if (!itemAtual.tamanho) return;

        // Pega o valor da observação
        itemAtual.obs = obsInput.value.trim(); 
        
        if (itemAtual.fruits.length < 1) {
            alert('Por favor, escolha pelo menos uma fruta grátis.');
            return;
        }

        if (itemEmEdicaoIndex !== -1) {
            // Modo Edição
            pedidos[itemEmEdicaoIndex] = itemAtual;
            itemEmEdicaoIndex = -1;
        } else {
            // Novo Item
            pedidos.push(itemAtual);
        }
        
        saveToLocalStorage();
        closeModal();
    }
    
    function saveToLocalStorage() {
        localStorage.setItem('tropicanaPedidos', JSON.stringify(pedidos));
        renderizarResumoPedido(); 
    }
    
    function excluirItem(index) {
        if (confirm(`Tem certeza que deseja remover a Salada #${index + 1} do pedido?`)) {
            pedidos.splice(index, 1);
            saveToLocalStorage(); 
        }
    }
        
    function editItem(index) {
        openModal(pedidos[index].tamanho, index); 
    }

    // 9. FUNÇÃO DE ENVIO DO PEDIDO (WHATSAPP)
    function enviarPedido() {
        
        if (pedidos.length === 0) {
             alert('Adicione pelo menos um item ao pedido.');
             return;
        }
        
        saveToLocalStorage(); 
        
        // ✅ LINHA CHAVE: Usa a transição para ir para a página de confirmação
        handlePageTransition('confirmacao.html');
    }


    // 11. LISTENERS E INICIALIZAÇÃO
    window.excluirItem = excluirItem; 
    window.openModal = openModal; 
    window.editItem = editItem; 
    window.handlePageTransition = handlePageTransition; 

    document.getElementById('closeModal').addEventListener('click', closeModal);
        
    addToOrderBtn.addEventListener('click', addToOrder);
    
    // Listener do botão "Adicionar Pedido" na barra inferior
    document.getElementById('adicionarPedidoBtn').addEventListener('click', enviarPedido);

    // Inicialização
    renderizarSelecaoTamanho();
    checkStoreStatus();
    setInterval(checkStoreStatus, 60000); 
    renderizarResumoPedido(); 
});
