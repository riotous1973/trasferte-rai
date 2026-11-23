/**
 * Orchestratore principale dell'app Trasferte RAI (stato, auto-salvataggio, archivio, navigazione).
 */
(function (root) {
  'use strict';

  const Defaults = root.TrasferteDefaults;
  const Calc = root.TrasferteCalc;
  const Storage = root.TrasferteStorage;
  const UIEditor = root.TrasferteUIEditor;
  const UINotaSpese = root.TrasferteUINotaSpese;
  const UIModuloPrint = root.TrasferteUIModuloPrint;
  const UIMassimali = root.TrasferteUIMassimali;
  const UIArchive = root.TrasferteUIArchive;

  let archiveState = null;
  let settingsState = null;
  let activeTab = 'editor';
  let saveTimer = null;

  const state = {
    get trip() {
      return archiveState.trips.find((t) => t.id === archiveState.activeTripId) || archiveState.trips[0];
    },
    get settings() {
      return settingsState;
    },
    calc: null,
  };

  function showToast(msg, variant) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `toast ${variant || ''}`;
    div.textContent = msg;
    container.appendChild(div);
    setTimeout(() => {
      div.remove();
    }, 3200);
  }

  function updateAutosaveBadge(status, detail) {
    const badge = document.getElementById('autosave-status');
    const txt = document.getElementById('autosave-text');
    if (!badge || !txt) return;
    badge.classList.remove('saving', 'error');
    if (status === 'saving') {
      badge.classList.add('saving');
      txt.textContent = 'Salvataggio...';
    } else if (status === 'error') {
      badge.classList.add('error');
      txt.textContent = detail || 'Errore salvataggio';
    } else {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      txt.textContent = `Salvato in tempo reale · ${hh}:${mm}:${ss}`;
    }
  }

  function recompute() {
    state.calc = Calc.calculateTrip(state.trip, state.settings);
  }

  function persistNow(saveBoth) {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    state.trip.updatedAt = new Date().toISOString();
    if (state.trip.matricola) archiveState.profile.matricola = state.trip.matricola;
    if (state.trip.nominativo) archiveState.profile.nominativo = state.trip.nominativo;

    const r1 = Storage.saveArchive(archiveState);
    const r2 = saveBoth ? Storage.saveSettings(settingsState) : { ok: true };
    if (!r1.ok || !r2.ok) {
      updateAutosaveBadge('error', 'Spazio esaurito: esporta JSON');
      const banner = document.getElementById('storage-warning');
      if (banner) {
        banner.hidden = false;
        banner.textContent = `Attenzione: salvataggio locale non riuscito (${r1.error || r2.error}). Usa "Esporta JSON" per non perdere i dati.`;
      }
      return;
    }
    updateAutosaveBadge('saved');
    renderArchiveSelector();
  }

  function scheduleSave(saveBoth) {
    recompute();
    updateAutosaveBadge('saving');
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => persistNow(Boolean(saveBoth)), 180);
  }

  function hydrateCountriesDatalist() {
    const dl = document.getElementById('countries-datalist');
    if (!dl) return;
    dl.innerHTML = settingsState.countries
      .map((c) => {
        const val = `${c.code} - ${c.name} (${c.localCurrency})`;
        return `<option value="${val.replace(/"/g, '&quot;')}"></option>`;
      })
      .join('');
  }

  function updateDocumentTitle() {
    const t = state.trip;
    const prefix = t && t.nome && t.nome.trim() ? `${t.nome.trim()} · ` : '';
    document.title = `${prefix}Gestione Trasferte RAI · MOD. 31426`;
  }

  function renderArchiveSelector() {
    const sel = document.getElementById('trip-selector');
    if (sel) {
      const html = archiveState.trips
        .map((t) => {
          const lbl = Storage.getTripDisplayLabel(t);
          const isSel = t.id === archiveState.activeTripId ? ' selected' : '';
          return `<option value="${t.id}"${isSel}>${lbl.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</option>`;
        })
        .join('');
      sel.innerHTML = html;
    }
    const countEl = document.getElementById('archive-count');
    if (countEl) {
      countEl.textContent = String(archiveState.trips.length);
    }
    updateDocumentTitle();
  }

  function renderActiveTab() {
    recompute();
    const panels = {
      editor: document.getElementById('view-editor'),
      'nota-spese': document.getElementById('view-nota-spese'),
      modulo: document.getElementById('view-modulo'),
      massimali: document.getElementById('view-massimali'),
      archive: document.getElementById('view-archive'),
    };
    Object.keys(panels).forEach((k) => {
      if (!panels[k]) return;
      const isAct = k === activeTab;
      panels[k].hidden = !isAct;
      panels[k].classList.toggle('active', isAct);
    });
    document.querySelectorAll('.nav-tab').forEach((btn) => {
      const isAct = btn.dataset.tab === activeTab;
      btn.classList.toggle('active', isAct);
      btn.setAttribute('aria-selected', isAct ? 'true' : 'false');
    });

    if (activeTab === 'editor') {
      UIEditor.renderEditor(panels.editor, state, actions);
    } else if (activeTab === 'nota-spese') {
      UINotaSpese.renderNotaSpese(panels['nota-spese'], state);
    } else if (activeTab === 'modulo') {
      UIModuloPrint.renderModuloPrint(panels.modulo, state);
    } else if (activeTab === 'massimali') {
      UIMassimali.renderMassimali(panels.massimali, state, actions);
    } else if (activeTab === 'archive') {
      UIArchive.renderArchive(panels.archive, archiveState, settingsState, actions);
    }
  }

  function switchTab(tabName) {
    if (!tabName) return;
    persistNow(true);
    activeTab = tabName;
    renderActiveTab();
  }

  const actions = {
    updateTripField(field, value) {
      state.trip[field] = value;
      if (field === 'nome' || field === 'numFoglioViaggio') {
        renderArchiveSelector();
      }
      scheduleSave(false);
    },

    updateTrasfertaLeg(legIndex, field, value) {
      if (!state.trip.trasferte[legIndex]) return;
      state.trip.trasferte[legIndex][field] = value;
      scheduleSave(false);
    },

    updateMealCutoff(key, value) {
      settingsState.mealCutoffs[key] = value;
      scheduleSave(true);
    },

    addVisitedCountryByQuery(rawQuery) {
      const q = String(rawQuery || '').trim();
      if (!q) return false;
      const qLower = q.toLowerCase();
      const firstToken = q.split(/[\s-]+/)[0].trim().toUpperCase();
      const found =
        settingsState.countries.find((c) => c.code.toUpperCase() === firstToken) ||
        settingsState.countries.find((c) => c.code.toUpperCase() === q.toUpperCase()) ||
        settingsState.countries.find((c) => c.name.toLowerCase() === qLower) ||
        settingsState.countries.find((c) => c.name.toLowerCase().includes(qLower));

      if (!found) {
        showToast('Paese non trovato nella tabella Codici Paesi', 'error');
        return false;
      }
      if (state.trip.paesiVisitati.some((p) => p.code === found.code)) {
        showToast(`${found.name} (${found.code}) è già presente nella trasferta`, 'error');
        return false;
      }
      if (state.trip.paesiVisitati.length >= 9) {
        showToast('Puoi aggiungere fino a 9 paesi esteri per trasferta', 'error');
        return false;
      }
      state.trip.paesiVisitati.push({
        code: found.code,
        euro: '',
        valuta: '',
        commEur: '',
        commValuta: '',
        showOnModulo:
          found.localCurrency !== 'EUR' &&
          state.trip.paesiVisitati.filter((p) => p.showOnModulo !== false).length < 6,
      });
      persistNow(false);
      recompute();
      showToast(`Aggiunto: ${found.name} (${found.code})`, 'success');
      return true;
    },

    updateVisitedCountry(code, field, value) {
      const item = state.trip.paesiVisitati.find((p) => p.code === code);
      if (!item) return;
      item[field] = value;
      scheduleSave(false);
    },

    removeVisitedCountry(code) {
      state.trip.paesiVisitati = state.trip.paesiVisitati.filter((p) => p.code !== code);
      persistNow(false);
      recompute();
    },

    updateDayField(iso, section, field, value) {
      if (!state.trip.giorni[iso]) {
        state.trip.giorni[iso] = {
          pranzo: { ricevuta: '', coperti: '', note: '', code: '' },
          cena: { ricevuta: '', coperti: '', note: '', code: '' },
          pernotto: { ricevuta: '', note: '', code: '' },
          colazione: { ricevuta: '', coperti: '', note: '', code: '' },
          rientro: '',
        };
      }
      if (section === 'rientro') {
        state.trip.giorni[iso].rientro = value;
      } else {
        if (!state.trip.giorni[iso][section]) state.trip.giorni[iso][section] = {};
        state.trip.giorni[iso][section][field] = value;
      }
      scheduleSave(false);
    },

    copyPreviousDay(prevIso, targetIso) {
      const prev = state.trip.giorni[prevIso];
      if (!prev) return;
      const cur = state.trip.giorni[targetIso] || {};
      state.trip.giorni[targetIso] = {
        pranzo: Object.assign({ ricevuta: '', coperti: '', note: '', code: '' }, cur.pranzo || {}, {
          note: (prev.pranzo && prev.pranzo.note) || '',
          code: (prev.pranzo && prev.pranzo.code) || '',
        }),
        cena: Object.assign({ ricevuta: '', coperti: '', note: '', code: '' }, cur.cena || {}, {
          note: (prev.cena && prev.cena.note) || '',
          code: (prev.cena && prev.cena.code) || '',
        }),
        pernotto: Object.assign({ ricevuta: '', note: '', code: '' }, cur.pernotto || {}, {
          note: (prev.pernotto && prev.pernotto.note) || '',
          code: (prev.pernotto && prev.pernotto.code) || '',
        }),
        colazione: Object.assign({ ricevuta: '', coperti: '', note: '', code: '' }, cur.colazione || {}, {
          note: (prev.colazione && prev.colazione.note) || '',
          code: (prev.colazione && prev.colazione.code) || '',
        }),
        rientro: cur.rientro || '',
      };
      persistNow(false);
      recompute();
    },

    bulkFillCountry(code) {
      if (!code) return;
      const days = state.calc.schedule.days;
      days.forEach((d, idx) => {
        if (!state.trip.giorni[d.iso]) {
          state.trip.giorni[d.iso] = {
            pranzo: { ricevuta: '', coperti: '', note: '', code: '' },
            cena: { ricevuta: '', coperti: '', note: '', code: '' },
            pernotto: { ricevuta: '', note: '', code: '' },
            colazione: { ricevuta: '', coperti: '', note: '', code: '' },
            rientro: '',
          };
        }
        const g = state.trip.giorni[d.iso];
        if (!g.pranzo.code) g.pranzo.code = code;
        if (!g.cena.code) g.cena.code = code;
        if (idx < days.length - 1 && !g.pernotto.code) g.pernotto.code = code;
      });
      persistNow(false);
      recompute();
      showToast(`Applicato codice ${code} ai giorni vuoti`, 'success');
    },

    bulkFillItalyBreakfast() {
      const days = state.calc.schedule.days;
      days.forEach((d, idx) => {
        if (idx === 0) return;
        if (!state.trip.giorni[d.iso]) {
          state.trip.giorni[d.iso] = {
            pranzo: { ricevuta: '', coperti: '', note: '', code: '' },
            cena: { ricevuta: '', coperti: '', note: '', code: '' },
            pernotto: { ricevuta: '', note: '', code: '' },
            colazione: { ricevuta: '', coperti: '', note: '', code: '' },
            rientro: '',
          };
        }
        const col = state.trip.giorni[d.iso].colazione;
        if (!col.ricevuta && !col.note && !col.code) {
          col.note = 'Forfait';
          col.code = 'IT';
        }
      });
      persistNow(false);
      recompute();
      showToast('Impostato Forfait Colazione IT sulle notti vuote', 'success');
    },

    addTicket() {
      if (state.trip.biglietti.length >= 16) {
        showToast('Massimo 16 righe biglietti su Modulo 1', 'error');
        return false;
      }
      state.trip.biglietti.push({
        nTrasf: 1,
        localita: '',
        dataArrivo: (state.trip.trasferte[0] && state.trip.trasferte[0].dal) || '',
        mezzo: 'AE',
        pagatiDipEur: '',
        pagatiDipValuta: '',
        code: 'IT',
        pagatiRaiEur: '',
      });
      persistNow(false);
      recompute();
      return true;
    },

    updateTicketField(idx, field, value) {
      if (!state.trip.biglietti[idx]) return;
      state.trip.biglietti[idx][field] = value;
      scheduleSave(false);
    },

    removeTicket(idx) {
      state.trip.biglietti.splice(idx, 1);
      persistNow(false);
      recompute();
    },

    moveTicket(idx, delta) {
      const target = idx + delta;
      const list = state.trip.biglietti;
      if (idx < 0 || idx >= list.length || target < 0 || target >= list.length) return;
      const tmp = list[idx];
      list[idx] = list[target];
      list[target] = tmp;
      persistNow(false);
      recompute();
    },

    addSpesa() {
      if (state.trip.speseVarie.length >= 24) {
        showToast('Massimo 24 righe spese varie (Moduli 1–3)', 'error');
        return false;
      }
      state.trip.speseVarie.push({
        data: (state.trip.trasferte[0] && state.trip.trasferte[0].dal) || '',
        descrizione: '',
        pagateDipEur: '',
        pagateDipValuta: '',
        code: 'IT',
      });
      persistNow(false);
      recompute();
      return true;
    },

    updateSpesaField(idx, field, value) {
      if (!state.trip.speseVarie[idx]) return;
      state.trip.speseVarie[idx][field] = value;
      scheduleSave(false);
    },

    removeSpesa(idx) {
      state.trip.speseVarie.splice(idx, 1);
      persistNow(false);
      recompute();
    },

    loadDemo() {
      const demo = Storage.createDemoTrip(archiveState.profile);
      const idx = archiveState.trips.findIndex((t) => t.id === archiveState.activeTripId);
      if (idx >= 0) {
        demo.id = archiveState.trips[idx].id;
        archiveState.trips[idx] = demo;
      }
      persistNow(false);
      renderActiveTab();
      showToast('Trasferta di esempio caricata', 'success');
    },

    // Massimali & Codici Paesi actions
    updateExchangeRate(field, value) {
      settingsState.exchangeRates[field] = value;
      scheduleSave(true);
    },

    updateItalyRate(field, value) {
      settingsState.italyRates[field] = value;
      if (field === 'pasto1' || field === 'pastoMM') {
        settingsState.italyRates.pastoMMDelta = Calc.round2(
          Calc.toNum(settingsState.italyRates.pastoMM) - Calc.toNum(settingsState.italyRates.pasto1)
        );
      }
      scheduleSave(true);
    },

    updateItalyMmCities(citiesArray) {
      settingsState.italyMmCities = citiesArray;
      persistNow(true);
      recompute();
    },

    updateCountry(idx, field, value) {
      if (!settingsState.countries[idx]) return;
      settingsState.countries[idx][field] = value;
      hydrateCountriesDatalist();
      scheduleSave(true);
    },

    addCountry(countryObj) {
      if (settingsState.countries.some((c) => c.code.toUpperCase() === countryObj.code.toUpperCase())) {
        showToast(`Il codice paese ${countryObj.code} esiste già`, 'error');
        return false;
      }
      settingsState.countries.unshift(countryObj);
      hydrateCountriesDatalist();
      persistNow(true);
      recompute();
      showToast(`Aggiunto paese ${countryObj.code} (${countryObj.name})`, 'success');
      return true;
    },

    removeCountry(idx) {
      settingsState.countries.splice(idx, 1);
      hydrateCountriesDatalist();
      persistNow(true);
      recompute();
    },

    exportSettings() {
      Storage.exportSettingsJson(settingsState);
    },

    importSettings(jsonText) {
      try {
        settingsState = Storage.parseImportedSettings(jsonText);
        hydrateCountriesDatalist();
        persistNow(true);
        recompute();
        showToast('Massimali e codici paesi importati con successo', 'success');
      } catch (err) {
        showToast(err.message || 'Errore importazione JSON massimali', 'error');
      }
    },

    exportCsv() {
      Storage.exportCountriesCsv(
        settingsState.countries,
        settingsState.exchangeRates,
        Calc.computeCountryRates
      );
    },

    resetSettings() {
      settingsState = Storage.resetSettingsToDefaults();
      hydrateCountriesDatalist();
      recompute();
      showToast('Massimali ripristinati ai valori originali', 'success');
    },

    // Salva con nome & Archivio Trasferte actions
    saveCurrentWithName(nome, stato) {
      state.trip.nome = String(nome || '').trim();
      state.trip.stato = stato === 'completata' ? 'completata' : 'in_corso';
      persistNow(false);
      if (activeTab === 'editor') {
        const nomeEl = document.getElementById('ed-nome');
        const statoEl = document.getElementById('ed-stato');
        if (nomeEl) nomeEl.value = state.trip.nome;
        if (statoEl) statoEl.value = state.trip.stato;
      } else if (activeTab === 'archive') {
        renderActiveTab();
      }
      showToast(`Trasferta salvata come "${Storage.getTripDisplayLabel(state.trip)}"`, 'success');
    },

    saveAsNewCopy(nome, stato) {
      persistNow(true);
      const copy = Storage.normalizeTrip(JSON.parse(JSON.stringify(state.trip)));
      copy.id = Storage.generateId('tr');
      copy.nome = String(nome || '').trim() || `${Storage.getTripDisplayLabel(state.trip)} (copia)`;
      copy.stato = stato === 'completata' ? 'completata' : 'in_corso';
      copy.createdAt = new Date().toISOString();
      copy.updatedAt = copy.createdAt;
      archiveState.trips.unshift(copy);
      archiveState.activeTripId = copy.id;
      persistNow(false);
      renderArchiveSelector();
      renderActiveTab();
      showToast(`Salvata nuova copia "${copy.nome}" in archivio`, 'success');
    },

    saveAndDownloadJson(nome, stato) {
      state.trip.nome = String(nome || '').trim();
      state.trip.stato = stato === 'completata' ? 'completata' : 'in_corso';
      persistNow(false);
      if (activeTab === 'editor') {
        const nomeEl = document.getElementById('ed-nome');
        const statoEl = document.getElementById('ed-stato');
        if (nomeEl) nomeEl.value = state.trip.nome;
        if (statoEl) statoEl.value = state.trip.stato;
      }
      Storage.exportTripJson(state.trip);
      showToast('Trasferta salvata ed esportata in JSON', 'success');
    },

    createAndOpenNewTrip() {
      persistNow(true);
      const nt = Storage.createEmptyTrip(archiveState.profile);
      archiveState.trips.unshift(nt);
      archiveState.activeTripId = nt.id;
      persistNow(false);
      renderArchiveSelector();
      switchTab('editor');
      showToast('Creata nuova trasferta', 'success');
    },

    openTrip(id, targetTab) {
      if (!archiveState.trips.some((t) => t.id === id)) return;
      persistNow(true);
      archiveState.activeTripId = id;
      persistNow(false);
      renderArchiveSelector();
      switchTab(targetTab || 'editor');
    },

    renameTrip(id, newName) {
      const t = archiveState.trips.find((item) => item.id === id);
      if (!t) return;
      t.nome = String(newName || '').trim();
      t.updatedAt = new Date().toISOString();
      Storage.saveArchive(archiveState);
      renderArchiveSelector();
      renderActiveTab();
      showToast(t.nome ? `Trasferta rinominata in "${t.nome}"` : 'Nome trasferta rimosso', 'success');
    },

    toggleTripStatus(id) {
      const t = archiveState.trips.find((item) => item.id === id);
      if (!t) return;
      t.stato = t.stato === 'completata' ? 'in_corso' : 'completata';
      t.updatedAt = new Date().toISOString();
      Storage.saveArchive(archiveState);
      renderArchiveSelector();
      renderActiveTab();
    },

    duplicateTripById(id) {
      const src = archiveState.trips.find((item) => item.id === id);
      if (!src) return;
      persistNow(true);
      const copy = Storage.normalizeTrip(JSON.parse(JSON.stringify(src)));
      copy.id = Storage.generateId('tr');
      copy.nome = copy.nome ? `${copy.nome} (copia)` : '';
      copy.numFoglioViaggio = copy.numFoglioViaggio ? `${copy.numFoglioViaggio} (copia)` : '';
      copy.createdAt = new Date().toISOString();
      copy.updatedAt = copy.createdAt;
      archiveState.trips.unshift(copy);
      archiveState.activeTripId = copy.id;
      persistNow(false);
      renderArchiveSelector();
      renderActiveTab();
      showToast('Trasferta duplicata', 'success');
    },

    deleteTripById(id) {
      const t = archiveState.trips.find((item) => item.id === id);
      if (!t) return;
      const label = Storage.getTripDisplayLabel(t);
      if (!window.confirm(`Eliminare definitivamente "${label}"?`)) return;
      archiveState.trips = archiveState.trips.filter((item) => item.id !== id);
      if (archiveState.trips.length === 0) {
        archiveState.trips.push(Storage.createEmptyTrip(archiveState.profile));
      }
      if (!archiveState.trips.some((item) => item.id === archiveState.activeTripId)) {
        archiveState.activeTripId = archiveState.trips[0].id;
      }
      Storage.saveArchive(archiveState);
      renderArchiveSelector();
      renderActiveTab();
      showToast('Trasferta eliminata', 'success');
    },

    exportTripById(id) {
      const t = archiveState.trips.find((item) => item.id === id);
      if (!t) return;
      Storage.exportTripJson(t);
    },

    exportFullArchive() {
      persistNow(true);
      Storage.exportArchiveJson(archiveState);
    },
  };

  function bindGlobalChrome() {
    const logoEl = document.getElementById('topbar-logo');
    if (logoEl) logoEl.src = Defaults.RAI_LOGO_DATA_URI;

    document.querySelectorAll('.nav-tab').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    const tripSel = document.getElementById('trip-selector');
    if (tripSel) {
      tripSel.addEventListener('change', () => {
        persistNow(true);
        archiveState.activeTripId = tripSel.value;
        persistNow(false);
        renderActiveTab();
      });
    }

    const btnNew = document.getElementById('btn-new-trip');
    btnNew.addEventListener('click', () => actions.createAndOpenNewTrip());

    const btnDup = document.getElementById('btn-dup-trip');
    btnDup.addEventListener('click', () => actions.duplicateTripById(archiveState.activeTripId));

    const btnDel = document.getElementById('btn-del-trip');
    btnDel.addEventListener('click', () => actions.deleteTripById(archiveState.activeTripId));

    // Modale "Salva con nome"
    const modal = document.getElementById('save-as-modal');
    const modalName = document.getElementById('save-as-name');
    const modalStatus = document.getElementById('save-as-status');
    const closeModal = () => {
      if (modal) modal.hidden = true;
    };
    const openSaveAsModal = () => {
      if (!modal) return;
      const cur = state.trip;
      const suggestion =
        (cur.nome && cur.nome.trim()) ||
        (cur.biglietti && cur.biglietti[0] && cur.biglietti[0].localita) ||
        (cur.numFoglioViaggio ? `Trasferta ${cur.numFoglioViaggio}` : '');
      modalName.value = suggestion;
      modalStatus.value = cur.stato === 'completata' ? 'completata' : 'in_corso';
      modal.hidden = false;
      modalName.focus();
      modalName.select();
    };

    document.getElementById('btn-save-as').addEventListener('click', openSaveAsModal);
    document.getElementById('save-as-close').addEventListener('click', closeModal);
    document.getElementById('save-as-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
    document.getElementById('save-as-current').addEventListener('click', () => {
      actions.saveCurrentWithName(modalName.value, modalStatus.value);
      closeModal();
    });
    document.getElementById('save-as-copy').addEventListener('click', () => {
      actions.saveAsNewCopy(modalName.value, modalStatus.value);
      closeModal();
    });
    document.getElementById('save-as-json').addEventListener('click', () => {
      actions.saveAndDownloadJson(modalName.value, modalStatus.value);
      closeModal();
    });

    document.getElementById('btn-export-trip').addEventListener('click', () => {
      persistNow(true);
      Storage.exportTripJson(state.trip);
    });

    const impTripInput = document.getElementById('input-import-trip');
    document.getElementById('btn-import-trip').addEventListener('click', () => impTripInput.click());
    impTripInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = Storage.parseImportedTripOrArchive(String(reader.result || ''));
          if (parsed.kind === 'single') {
            archiveState.trips.unshift(parsed.trip);
            archiveState.activeTripId = parsed.trip.id;
            showToast('Trasferta importata con successo', 'success');
          } else {
            archiveState.trips = parsed.trips.concat(archiveState.trips);
            archiveState.activeTripId = parsed.trips[0].id;
            showToast(`Importate ${parsed.trips.length} trasferte dall'archivio`, 'success');
          }
          persistNow(false);
          renderArchiveSelector();
          renderActiveTab();
        } catch (err) {
          showToast(err.message || 'File JSON non valido', 'error');
        }
      };
      reader.readAsText(file, 'utf-8');
      impTripInput.value = '';
    });

    document.getElementById('btn-quick-print').addEventListener('click', () => {
      switchTab('modulo');
      document.body.classList.add('printing-modulo');
      setTimeout(() => {
        window.print();
        document.body.classList.remove('printing-modulo');
      }, 60);
    });

    window.addEventListener('beforeunload', () => {
      if (saveTimer) persistNow(true);
    });
  }

  function init() {
    const sRes = Storage.loadSettings();
    const aRes = Storage.loadArchive();
    settingsState = sRes.settings;
    archiveState = aRes.archive;

    if (sRes.storageWarning || aRes.storageWarning) {
      const banner = document.getElementById('storage-warning');
      if (banner) {
        banner.hidden = false;
        banner.textContent = `Avviso archiviazione browser: ${sRes.storageWarning || aRes.storageWarning}. Puoi comunque lavorare e usare "Esporta JSON".`;
      }
    }

    hydrateCountriesDatalist();
    renderArchiveSelector();
    bindGlobalChrome();
    renderActiveTab();
    updateAutosaveBadge('saved');

    if (
      'serviceWorker' in navigator &&
      (window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
    ) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})(typeof window !== 'undefined' ? window : globalThis);
