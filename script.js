(() => {
  const LS_KEY = 'cartorio';
  let registros = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  let editId = null;

  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

  function saveStorage() {
    localStorage.setItem(LS_KEY, JSON.stringify(registros));
  }

  function setActiveTab(tipo) {
    qsa('.tab').forEach(t => t.classList.toggle('active', t.dataset.tipo === tipo));
    qsa('.campos').forEach(c => {
      const show = c.id === tipo;
      c.style.display = show ? 'block' : 'none';
      c.setAttribute('aria-hidden', show ? 'false' : 'true');
    });
    editId = null;
    updateSaveLabel();
    const first = qs(`#${tipo} input`);
    if (first) first.focus();
  }

  function getActiveTipo() {
    const t = qs('.tab.active');
    return t ? t.dataset.tipo : null;
  }

  function getVisibleInputs() {
    const tipo = getActiveTipo();
    if (!tipo) return [];
    return qsa(`#${tipo} input`);
  }

  function clearForm() {
    const form = qs('#form');
    if (form) form.reset();
    editId = null;
    updateSaveLabel();
    const first = getVisibleInputs()[0];
    if (first) first.focus();
  }

  function updateSaveLabel() {
    const btn = qs('.salvar');
    if (btn) btn.textContent = editId ? 'Atualizar' : 'Salvar';
  }

  function validateInputs(inputs) {
    for (let i = 0; i < inputs.length; i++) {
      if ((inputs[i].value || '').trim() === '') {
        inputs[i].focus();
        return false;
      }
    }
    return true;
  }

  function render() {
    const tbody = qs('#lista');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!registros.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 3;
      td.textContent = 'Nenhum registro salvo.';
      td.style.textAlign = 'center';
      td.style.padding = '14px';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    registros.forEach(r => {
      const tr = document.createElement('tr');

      // marca a linha com o tipo (nascimento / casamento / obito)
      if (r.tipo) tr.classList.add(r.tipo);

      const tdTipo = document.createElement('td');
      tdTipo.textContent = (r.tipo || '').charAt(0).toUpperCase() + (r.tipo || '').slice(1);
      const tdResumo = document.createElement('td');
      tdResumo.textContent = (r.dados || []).slice(0,3).join(' | ') + ((r.dados && r.dados.length>3)?'...':'');
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'acoes';

      const btnEdit = document.createElement('button');
      btnEdit.type = 'button';
      btnEdit.className = 'acao editar';
      btnEdit.textContent = 'Editar';
      btnEdit.addEventListener('click', (e) => { e.stopPropagation(); startEdit(r.id); });

      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'acao excluir';
      btnDel.textContent = 'Excluir';
      btnDel.addEventListener('click', (e) => { e.stopPropagation(); remove(r.id); });

      tdAcoes.appendChild(btnEdit);
      tdAcoes.appendChild(btnDel);

      tr.appendChild(tdTipo);
      tr.appendChild(tdResumo);
      tr.appendChild(tdAcoes);

      tr.addEventListener('click', () => startEdit(r.id));
      tbody.appendChild(tr);
    });
  }

  function startEdit(id) {
    const r = registros.find(x => x.id == id);
    if (!r) return;
    setActiveTab(r.tipo);
    const inputs = getVisibleInputs();
    (r.dados || []).forEach((val, idx) => {
      if (inputs[idx]) inputs[idx].value = val;
    });
    editId = id;
    updateSaveLabel();
    const first = inputs[0];
    if (first) first.focus();
  }

  function remove(id) {
    if (!confirm('Excluir este registro?')) return;
    registros = registros.filter(r => r.id != id);
    saveStorage();
    render();
  }

  // handlers
  function onSave(e) {
    if (e && e.preventDefault) e.preventDefault();
    const inputs = getVisibleInputs();
    if (!inputs.length) { alert('Não há campos visíveis.'); return; }
    if (!validateInputs(inputs)) { alert('Preencha todos os campos.'); return; }
    const dados = inputs.map(i => i.value.trim());
    if (editId) {
      const idx = registros.findIndex(r => r.id == editId);
      if (idx >= 0) registros[idx] = { id: editId, tipo: getActiveTipo(), dados };
      editId = null;
    } else {
      registros.push({ id: Date.now(), tipo: getActiveTipo(), dados });
    }
    saveStorage();
    clearForm();
    render();
  }

  function init() {
    // attach tab clicks
    qsa('.tab').forEach(t => t.addEventListener('click', () => setActiveTab(t.dataset.tipo)));

    // save/clear
    const form = qs('#form');
    if (form) form.addEventListener('submit', onSave);
    const btnSave = qs('.salvar');
    if (btnSave) btnSave.addEventListener('click', onSave);
    qsa('.limpar').forEach(b => b.addEventListener('click', clearForm));

    // ensure a tab is active
    const active = qs('.tab.active') || qs('.tab');
    if (active && active.dataset && active.dataset.tipo) setActiveTab(active.dataset.tipo);

    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
