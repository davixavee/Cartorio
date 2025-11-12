let registros = JSON.parse(localStorage.getItem('cartorio') || '[]');
let editando = null;

// Trocar aba
function trocarAba(tipo) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  const bot = document.querySelector(`.tab[data-tipo="${tipo}"]`);
  if (bot) bot.classList.add('active');
  
  document.querySelectorAll('.campos').forEach(c => c.style.display = 'none');
  const el = document.getElementById(tipo);
  if (el) el.style.display = 'block';
  
  editando = null; // limpa edição
}

// Limpar formulário
function limparForm() {
  document.getElementById('form').reset();
  editando = null;
}

// Salvar
function salvar(e) {
  e.preventDefault();
  const activeTab = document.querySelector('.tab.active');
  const tipo = activeTab && activeTab.dataset.tipo;
  if (!tipo) {
    alert('Erro: aba ativa não encontrada.');
    return;
  }
  const inputs = document.querySelectorAll(`#${tipo} input`);
  if (!inputs || inputs.length === 0) {
    alert('Erro: campos não encontrados para o tipo selecionado.');
    return;
  }
  const dados = Array.from(inputs).map(i => i.value.trim());

  const reg = {
    id: editando || Date.now(),
    tipo: tipo,
    dados: dados
  };

  if (editando) {
    const i = registros.findIndex(r => r.id == editando);
    if (i >= 0) registros[i] = reg;
    editando = null;
  } else {
    registros.push(reg);
  }

  localStorage.setItem('cartorio', JSON.stringify(registros));
  limparForm();
  renderizar();
}

// Renderizar tabela
function renderizar() {
  const tbody = document.getElementById('lista');
  tbody.innerHTML = '';

  registros.forEach(r => {
    const tr = document.createElement('tr');
    const resumo = (r.dados || []).slice(0, 3).join(' | ') + ((r.dados || []).length > 3 ? '...' : '');
    const tipoNome = r.tipo.charAt(0).toUpperCase() + r.tipo.slice(1);

    tr.innerHTML = `
      <td>${tipoNome}</td>
      <td>${resumo}</td>
      <td>
        <button class="acao editar" onclick="editar(${r.id})">Editar</button>
        <button class="acao excluir" onclick="excluir(${r.id})">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Editar
function editar(id) {
  const r = registros.find(x => x.id == id);
  if (!r) return;
  trocarAba(r.tipo);
  
  const inputs = document.querySelectorAll(`#${r.tipo} input`);
  inputs.forEach((inp, i) => inp.value = r.dados[i] || '');
  
  editando = id;
  window.scrollTo(0, 0);
}

// Excluir
function excluir(id) {
  if (confirm('Excluir este registro?')) {
    registros = registros.filter(r => r.id != id);
    localStorage.setItem('cartorio', JSON.stringify(registros));
    renderizar();
  }
}

// Iniciar
renderizar();