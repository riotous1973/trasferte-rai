/**
 * Vista 1: Compilazione guidata (dati trasferta, paesi/cambi, diarie, biglietti, spese varie).
 * Progettata per preservare sempre il focus durante la digitazione e salvare in tempo reale.
 */
(function (root) {
  'use strict';

  const Defaults = root.TrasferteDefaults;
  const Calc = root.TrasferteCalc;

  function escHtml(val) {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isMealFixedNote(note) {
    return note === 'Forfait' || note === 'FMM' || note === 'Forf.Misto' || note === 'Forf.Tot' || note === 'InViaggio';
  }

  function isPernottoFixedNote(note) {
    return note === 'Forfait' || note === 'FT' || note === 'OFF' || note === 'InViaggio';
  }

  function isColazFixedNote(note) {
    return note === 'Forfait';
  }

  function formatQuotaDisplay(meal, isColazione) {
    if (!meal) return { text: '—', cls: 'cell-readonly', title: '' };
    if (!isColazione && meal.forfEstero > 0) {
      return {
        text: `€ ${Calc.formatItCurrency(meal.forfEstero)}`,
        cls: 'cell-readonly cell-forfait',
        title: 'Forfait estero calcolato (incluso in Nota Spese; su Modulo 1 compare la nota senza importo)',
      };
    }
    if (meal.forfIt > 0) {
      return {
        text: `€ ${Calc.formatItCurrency(meal.forfIt)}`,
        cls: 'cell-readonly cell-forfait',
        title: 'Forfait Italia calcolato',
      };
    }
    if (!isColazione && (meal.note === 'Forf.Misto' || meal.note === 'Forf.Tot') && (!meal.code || meal.code === 'IT')) {
      return {
        text: 'Estero?',
        cls: 'cell-readonly cell-hint-warn',
        title: 'Seleziona un paese estero per calcolare il forfait estero',
      };
    }
    if ((meal.note === 'Forfait' || meal.note === 'FMM') && meal.code && meal.code !== 'IT') {
      return {
        text: 'Solo IT',
        cls: 'cell-readonly cell-hint-warn',
        title: "Forfait / FMM valgono solo per Italia (IT); per l'estero usa Forf.Misto o Forf.Tot",
      };
    }
    if (meal.quota !== null && meal.quota !== undefined) {
      return { text: Calc.formatItCurrency(meal.quota), cls: 'cell-readonly', title: '' };
    }
    return { text: '—', cls: 'cell-readonly', title: '' };
  }

  function buildVisitedOptionsHtml(visitedEntries, selectedCode, includeEmpty) {
    let html = includeEmpty ? '<option value="">—</option>' : '';
    visitedEntries.forEach((vc) => {
      const sel = vc.code === selectedCode ? ' selected' : '';
      const label = vc.isItaly ? 'IT · Italia' : `${vc.code} · ${vc.name} (${vc.localCurrency})`;
      html += `<option value="${escHtml(vc.code)}"${sel}>${escHtml(label)}</option>`;
    });
    return html;
  }

  function buildSelectOptionsHtml(items, selectedVal, valKey, lblKey) {
    return items
      .map((item) => {
        const v = valKey ? item[valKey] : item;
        const l = lblKey ? item[lblKey] : (item || '—');
        const sel = v === selectedVal ? ' selected' : '';
        return `<option value="${escHtml(v)}"${sel}>${escHtml(l)}</option>`;
      })
      .join('');
  }

  function renderEditor(container, state, actions) {
    const { trip, settings, calc } = state;
    const cutoffs = settings.mealCutoffs;

    container.innerHTML = `
      <!-- KPI Bar Sticky -->
      <div id="editor-kpi" class="kpi-bar"></div>

      <!-- Card 1: Dati Dipendente & Trasferte -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Dati Dipendente &amp; Periodi di Trasferta</h2>
            <div class="card-subtitle">Compila i dati anagrafici e gli orari di partenza/rientro (Trasferta 1 obbligatoria; 2 e 3 facoltative)</div>
          </div>
          <button type="button" id="btn-load-demo" class="btn btn-sm btn-secondary" title="Popola una trasferta di esempio completa per testare calcolo e stampa">
            Carica Esempio
          </button>
        </div>
        <div class="card-body">
          <div class="form-grid" style="grid-template-columns: 2fr 1fr; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border);">
            <div class="field">
              <label for="ed-nome">Nome / Riferimento Trasferta <span style="font-weight:400; text-transform:none;">(solo per archivio, non stampato su Modulo 1)</span></label>
              <input id="ed-nome" class="input" type="text" data-trip-field="nome" value="${escHtml(trip.nome)}" placeholder="es. Sanremo 2026, Milano Marzo, Londra...">
            </div>
            <div class="field">
              <label for="ed-stato">Stato Trasferta</label>
              <select id="ed-stato" class="select" data-trip-field="stato">
                <option value="in_corso"${trip.stato !== 'completata' ? ' selected' : ''}>In corso (bozza modificabile)</option>
                <option value="completata"${trip.stato === 'completata' ? ' selected' : ''}>Completata (pronta / archiviata)</option>
              </select>
            </div>
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="ed-matricola">Matricola RAI</label>
              <input id="ed-matricola" class="input" type="text" data-trip-field="matricola" value="${escHtml(trip.matricola)}" placeholder="es. 000000">
            </div>
            <div class="field">
              <label for="ed-nominativo">Nominativo</label>
              <input id="ed-nominativo" class="input" type="text" data-trip-field="nominativo" value="${escHtml(trip.nominativo)}" placeholder="Cognome e Nome">
            </div>
            <div class="field">
              <label for="ed-foglio">Autorizzazione di Viaggio N.</label>
              <input id="ed-foglio" class="input" type="text" data-trip-field="numFoglioViaggio" value="${escHtml(trip.numFoglioViaggio)}" placeholder="es. 2026/0418">
            </div>
            <div class="field">
              <label for="ed-data-comp">Data di Compilazione</label>
              <input id="ed-data-comp" class="input" type="date" data-trip-field="dataCompilazione" value="${escHtml(trip.dataCompilazione)}">
            </div>
            <div class="field">
              <label for="ed-anticipi">Anticipi Ricevuti (€)</label>
              <input id="ed-anticipi" class="input num" type="number" step="0.01" min="0" data-trip-field="anticipi" value="${escHtml(trip.anticipi)}" placeholder="0,00">
            </div>
          </div>

          <div class="field" style="margin-top: 12px;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
              <label for="ed-annotazioni">Annotazioni su Modulo 1</label>
              <button type="button" id="btn-toggle-mat-az" class="btn btn-xs btn-ghost">
                Inserisci "Viaggiato con materiale aziendale"
              </button>
            </div>
            <input id="ed-annotazioni" class="input" type="text" data-trip-field="annotazioni" value="${escHtml(trip.annotazioni)}" placeholder="Annotazioni libere per la distinta...">
          </div>

          <div class="table-wrap" style="margin-top: 14px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:110px;">Trasferta</th>
                  <th>Data Inizio (DAL)</th>
                  <th>Ora Inizio</th>
                  <th>Part. da Sede</th>
                  <th>Data Fine (AL)</th>
                  <th>Ora Fine</th>
                  <th>Rientro in Sede</th>
                  <th style="width:120px;">Durata</th>
                </tr>
              </thead>
              <tbody id="trasferte-tbody">
                ${[0, 1, 2]
                  .map((i) => {
                    const t = trip.trasferte[i] || {};
                    const leg = calc.schedule.legs[i];
                    const durText = leg && leg.valid ? `${leg.giorni} gg · ${leg.notti} notti` : '—';
                    return `
                      <tr data-leg="${i}">
                        <td style="font-weight:700; text-align:center; color:var(--rai-blue);">TRASFERTA ${i + 1}</td>
                        <td><input class="cell-input" type="date" data-leg-field="dal" value="${escHtml(t.dal)}"></td>
                        <td><input class="cell-input" type="time" data-leg-field="oraDal" value="${escHtml(t.oraDal)}"></td>
                        <td>
                          <select class="cell-select" data-leg-field="partDaSede">
                            <option value="NO"${t.partDaSede !== 'SI' ? ' selected' : ''}>NO</option>
                            <option value="SI"${t.partDaSede === 'SI' ? ' selected' : ''}>SI</option>
                          </select>
                        </td>
                        <td><input class="cell-input" type="date" data-leg-field="al" value="${escHtml(t.al)}"></td>
                        <td><input class="cell-input" type="time" data-leg-field="oraAl" value="${escHtml(t.oraAl)}"></td>
                        <td>
                          <select class="cell-select" data-leg-field="rientroInSede">
                            <option value="NO"${t.rientroInSede !== 'SI' ? ' selected' : ''}>NO</option>
                            <option value="SI"${t.rientroInSede === 'SI' ? ' selected' : ''}>SI</option>
                          </select>
                        </td>
                        <td style="text-align:center;" data-leg-duration="${i}">
                          <span class="badge ${leg && leg.valid ? 'badge-blue' : ''}">${escHtml(durText)}</span>
                        </td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>

          <details class="accordion">
            <summary>Orari limite per conteggio automatico pasti (parametri avanzati)</summary>
            <div class="accordion-body">
              <div class="form-grid">
                <div class="field"><label>Pranzo</label><input class="input" type="time" data-cutoff="pranzo" value="${escHtml(cutoffs.pranzo)}"></div>
                <div class="field"><label>Cena</label><input class="input" type="time" data-cutoff="cena" value="${escHtml(cutoffs.cena)}"></div>
                <div class="field"><label>Colazione</label><input class="input" type="time" data-cutoff="colazione" value="${escHtml(cutoffs.colazione)}"></div>
                <div class="field"><label>Pranzo Part. da Sede</label><input class="input" type="time" data-cutoff="pranzoPartSede" value="${escHtml(cutoffs.pranzoPartSede)}"></div>
                <div class="field"><label>Pranzo Rientro in Sede</label><input class="input" type="time" data-cutoff="pranzoRientroSede" value="${escHtml(cutoffs.pranzoRientroSede)}"></div>
                <div class="field"><label>Cena Part. da Sede</label><input class="input" type="time" data-cutoff="cenaPartSede" value="${escHtml(cutoffs.cenaPartSede)}"></div>
                <div class="field"><label>Cena Rientro in Sede</label><input class="input" type="time" data-cutoff="cenaRientroSede" value="${escHtml(cutoffs.cenaRientroSede)}"></div>
              </div>
            </div>
          </details>
        </div>
      </div>

      <!-- Card 2: Paesi Visitati & Cambi -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Paesi Visitati &amp; Cambi Valuta</h2>
            <div class="card-subtitle">L'Italia (IT) è sempre attiva. Aggiungi eventuali paesi esteri per abilitarli nelle diarie e calcolare i cambi</div>
          </div>
          <div class="toolbar-inline">
            <input id="add-country-input" class="input" style="width: 260px;" list="countries-datalist" placeholder="Cerca paese o codice (es. GB, FR, USA)...">
            <button type="button" id="btn-add-country" class="btn btn-sm btn-primary">+ Aggiungi Paese</button>
          </div>
        </div>
        <div class="card-body" id="visited-countries-wrap"></div>
      </div>

      <!-- Card 3: Diarie Giorno per Giorno -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Diarie a Piè di Lista &amp; Forfait (Giorno per Giorno)</h2>
            <div class="card-subtitle">Le righe vengono generate automaticamente dalle date di trasferta; i dati restano associati a ciascuna data</div>
          </div>
          <div id="diarie-toolbar" class="toolbar-inline"></div>
        </div>
        <div class="card-body" id="diarie-wrap"></div>
      </div>

      <!-- Card 4: Tappe & Biglietti di Viaggio -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Destinazione, Tappe e Spese Trasporto (Biglietti Viaggio)</h2>
            <div class="card-subtitle">Fino a 16 righe stampate su Modulo 1. Inserisci ogni tappa/arrivo (anche senza importo biglietto) oppure il costo in € / valuta estera</div>
          </div>
          <button type="button" id="btn-add-ticket" class="btn btn-sm btn-secondary">+ Aggiungi Tappa / Biglietto</button>
        </div>
        <div class="card-body" id="tickets-wrap"></div>
      </div>

      <!-- Card 5: Spese Varie Documentate -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Spese Varie Documentate</h2>
            <div class="card-subtitle">Fino a 24 righe (1–8 su Modulo 1, 9–16 su Modulo 2, 17–24 su Modulo 3)</div>
          </div>
          <button type="button" id="btn-add-spesa" class="btn btn-sm btn-secondary">+ Aggiungi Spesa</button>
        </div>
        <div class="card-body" id="spese-varie-wrap"></div>
      </div>
    `;

    renderKpiBar(container, calc);
    renderVisitedCountriesSection(container, state, actions);
    renderDiarieSection(container, state, actions);
    renderTicketsSection(container, state, actions);
    renderSpeseVarieSection(container, state, actions);
    bindStaticEditorEvents(container, state, actions);
  }

  function renderKpiBar(container, calc) {
    const kpiEl = container.querySelector('#editor-kpi');
    if (!kpiEl) return;
    const ns = calc.notaSpese;
    const warns = calc.warnings || [];
    const warnHtml =
      warns.length > 0
        ? `<span class="badge badge-amber" title="${escHtml(warns.join('\n'))}">${warns.length} avvis${warns.length === 1 ? 'o' : 'i'}: ${escHtml(warns[0])}</span>`
        : `<span class="badge badge-green">Dati coerenti</span>`;

    kpiEl.innerHTML = `
      <div class="kpi-items">
        <div class="kpi-item">
          <span class="kpi-label">Periodo</span>
          <span class="kpi-value">${calc.schedule.totGiorni} gg · ${calc.schedule.totNotti} notti</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-label">Totale Diarie</span>
          <span class="kpi-value">€ ${Calc.formatItCurrency(ns.totaliDiarie.impTot)}</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-label">Viaggio &amp; Varie</span>
          <span class="kpi-value">€ ${Calc.formatItCurrency(ns.speseViaggioDoc)}</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-label">Altre Spese</span>
          <span class="kpi-value">€ ${Calc.formatItCurrency(ns.altreSpese)}</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-label">Totale Trasferta</span>
          <span class="kpi-value accent">€ ${Calc.formatItCurrency(ns.totaleTrasferta)}</span>
        </div>
        <div class="kpi-item">
          <span class="kpi-label">Residuo Netto</span>
          <span class="kpi-value net">€ ${Calc.formatItCurrency(ns.residuoNetto)}</span>
        </div>
      </div>
      <div class="kpi-warnings">
        ${warnHtml}
      </div>
    `;
  }

  function renderVisitedCountriesSection(container, state, actions) {
    const wrap = container.querySelector('#visited-countries-wrap');
    if (!wrap) return;
    const entries = state.calc.visitedCountries.entries;

    const rowsHtml = entries
      .map((vc) => {
        if (vc.isItaly) {
          return `
            <tr data-vc-code="IT">
              <td><strong>IT · Italia</strong></td>
              <td style="text-align:center;">EUR</td>
              <td class="num" style="text-align:right;">1,00</td>
              <td class="num" style="text-align:right;">1,00</td>
              <td class="num" style="text-align:right; font-weight:700;">1,0000</td>
              <td class="num" style="text-align:right;">—</td>
              <td class="num" style="text-align:right;">—</td>
              <td class="num" style="text-align:right;">€ ${Calc.formatItCurrency(vc.twoMealsValuta)}</td>
              <td class="num" style="text-align:right;">—</td>
              <td style="text-align:center;">—</td>
              <td style="text-align:center;"><span class="badge badge-blue">Fisso</span></td>
            </tr>
          `;
        }
        const savedItem = (state.trip.paesiVisitati || []).find((p) => p.code === vc.code) || {};
        return `
          <tr data-vc-code="${escHtml(vc.code)}">
            <td><strong>${escHtml(vc.code)}</strong> · ${escHtml(vc.name)}</td>
            <td style="text-align:center;">${escHtml(vc.localCurrency)}</td>
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-vc-field="euro" value="${escHtml(savedItem.euro ?? '')}" placeholder="€"></td>
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-vc-field="valuta" value="${escHtml(savedItem.valuta ?? '')}" placeholder="${escHtml(vc.localCurrency)}"></td>
            <td><span class="cell-readonly" data-vc-out="cambio">${vc.cambio.toFixed(4).replace('.', ',')}</span></td>
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-vc-field="commEur" value="${escHtml(savedItem.commEur ?? '')}" placeholder="€"></td>
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-vc-field="commValuta" value="${escHtml(savedItem.commValuta ?? '')}" placeholder="${escHtml(vc.localCurrency)}"></td>
            <td><span class="cell-readonly" data-vc-out="cap2">${Calc.formatItCurrency(vc.twoMealsValuta)} ${escHtml(vc.localCurrency)}</span></td>
            <td><span class="cell-readonly" data-vc-out="cap1">${Calc.formatItCurrency(vc.oneMealValuta)} ${escHtml(vc.localCurrency)}</span></td>
            <td style="text-align:center;">
              <input type="checkbox" data-vc-field="showOnModulo"${savedItem.showOnModulo !== false ? ' checked' : ''} title="Includi nella tabella CAMBI su Modulo 1">
            </td>
            <td style="text-align:center;">
              <button type="button" class="btn btn-xs btn-ghost-danger" data-vc-remove="${escHtml(vc.code)}">Rimuovi</button>
            </td>
          </tr>
        `;
      })
      .join('');

    wrap.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Paese</th>
              <th>Valuta</th>
              <th style="width:95px;">Euro Cambiati</th>
              <th style="width:95px;">Valuta Ottenuta</th>
              <th style="width:80px;">1 € =</th>
              <th style="width:90px;">Comm. (€)</th>
              <th style="width:90px;">Comm. (Val.)</th>
              <th style="width:110px;">Mass. 2 Pasti</th>
              <th style="width:110px;">Mass. 1 Pasto</th>
              <th style="width:75px;">Su Mod.1</th>
              <th style="width:75px;">Azioni</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    `;

    wrap.querySelectorAll('input').forEach((inp) => {
      const tr = inp.closest('tr[data-vc-code]');
      const code = tr.dataset.vcCode;
      inp.addEventListener('input', () => {
        const field = inp.dataset.vcField;
        if (inp.type === 'checkbox') {
          actions.updateVisitedCountry(code, field, inp.checked);
        } else {
          actions.updateVisitedCountry(code, field, inp.value === '' ? '' : Number(inp.value));
        }
        syncVisitedCountryOutputs(container, state.calc);
        renderKpiBar(container, state.calc);
        syncDiarieOutputs(container, state.calc);
        syncTicketsOutputs(container, state.calc);
        syncSpeseOutputs(container, state.calc);
      });
    });

    wrap.querySelectorAll('[data-vc-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.removeVisitedCountry(btn.dataset.vcRemove);
        renderVisitedCountriesSection(container, state, actions);
        renderDiarieSection(container, state, actions);
        renderTicketsSection(container, state, actions);
        renderSpeseVarieSection(container, state, actions);
        renderKpiBar(container, state.calc);
      });
    });
  }

  function syncVisitedCountryOutputs(container, calc) {
    calc.visitedCountries.entries.forEach((vc) => {
      if (vc.isItaly) return;
      const tr = container.querySelector(`tr[data-vc-code="${CSS.escape(vc.code)}"]`);
      if (!tr) return;
      const cEl = tr.querySelector('[data-vc-out="cambio"]');
      const c2El = tr.querySelector('[data-vc-out="cap2"]');
      const c1El = tr.querySelector('[data-vc-out="cap1"]');
      if (cEl) cEl.textContent = vc.cambio.toFixed(4).replace('.', ',');
      if (c2El) c2El.textContent = `${Calc.formatItCurrency(vc.twoMealsValuta)} ${vc.localCurrency}`;
      if (c1El) c1El.textContent = `${Calc.formatItCurrency(vc.oneMealValuta)} ${vc.localCurrency}`;
    });
  }

  function renderDiarieSection(container, state, actions) {
    const wrap = container.querySelector('#diarie-wrap');
    const toolbar = container.querySelector('#diarie-toolbar');
    if (!wrap || !toolbar) return;

    const rows = state.calc.dailyRows;
    const visited = state.calc.visitedCountries.entries;

    if (rows.length === 0) {
      toolbar.innerHTML = '';
      wrap.innerHTML = `
        <div class="empty-state">
          <p style="margin:0 0 10px;"><strong>Nessun giorno di trasferta impostato.</strong> Inserisci le date DAL / AL in Trasferta 1 qui sopra per generare la tabella delle spese giornaliere.</p>
          <button type="button" id="btn-empty-demo" class="btn btn-sm btn-secondary">Carica Trasferta di Esempio</button>
        </div>
      `;
      const btn = wrap.querySelector('#btn-empty-demo');
      if (btn) btn.addEventListener('click', () => actions.loadDemo());
      return;
    }

    toolbar.innerHTML = `
      <select id="bulk-country-select" class="select" style="width:170px; height:29px;">
        ${buildVisitedOptionsHtml(visited, visited.length > 1 ? visited[1].code : 'IT', false)}
      </select>
      <button type="button" id="btn-bulk-fill-country" class="btn btn-xs btn-secondary" title="Compila il codice paese sulle celle vuote">
        Imposta Paese su vuoti
      </button>
      <button type="button" id="btn-bulk-colaz-it" class="btn btn-xs btn-ghost" title="Imposta Forfait Colazione IT sulle notti vuote">
        Forfait Colaz. IT
      </button>
    `;

    const trHtml = rows
      .map((row, idx) => {
        const modBadge = row.moduleNumber > 1 ? `<span class="badge badge-blue">M${row.moduleNumber}</span>` : '';
        const pFixed = isMealFixedNote(row.pranzo.note);
        const cFixed = isMealFixedNote(row.cena.note);
        const nFixed = isPernottoFixedNote(row.pernotto.note);
        const colFixed = isColazFixedNote(row.colazione.note);
        const pqDisp = formatQuotaDisplay(row.pranzo, false);
        const cqDisp = formatQuotaDisplay(row.cena, false);
        const colqDisp = formatQuotaDisplay(row.colazione, true);
        const pernForfVal = row.pernotto.forfEstero > 0 ? row.pernotto.forfEstero : row.pernotto.forfIt;
        const pernPlaceholder = pernForfVal > 0 ? `€ ${Calc.formatItCurrency(pernForfVal)}` : '';

        return `
          <tr class="diarie-row" data-iso="${escHtml(row.iso)}">
            <td>
              <div class="day-cell">
                <span>${escHtml(row.dateParts.ddmm)}</span>
                <span class="day-wday">${escHtml(row.weekdayInitial)}</span>
                ${modBadge}
                <span class="row-warn-dot" data-row-warn="${escHtml(row.iso)}" hidden></span>
                ${idx > 0 ? `<button type="button" class="btn btn-xs btn-ghost" data-copy-prev="${escHtml(row.iso)}" title="Copia note e paesi dal giorno precedente">↶</button>` : ''}
              </div>
            </td>

            <!-- PRANZO -->
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-sec="pranzo" data-f="ricevuta" value="${escHtml(row.pranzo.ricevuta)}"${pFixed ? ' disabled' : ''}></td>
            <td><input class="cell-input num" type="number" step="1" min="1" data-sec="pranzo" data-f="coperti" value="${escHtml(row.pranzo.coperti)}"${pFixed ? ' disabled' : ''}></td>
            <td><span class="${pqDisp.cls}" data-out="pranzo-quota" title="${escHtml(pqDisp.title)}">${escHtml(pqDisp.text)}</span></td>
            <td><select class="cell-select" data-sec="pranzo" data-f="note">${buildSelectOptionsHtml(Defaults.NOTE_PASTO, row.pranzo.note, 'value', 'value')}</select></td>
            <td><select class="cell-select" data-sec="pranzo" data-f="code">${buildVisitedOptionsHtml(visited, row.pranzo.code, true)}</select></td>

            <!-- CENA -->
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-sec="cena" data-f="ricevuta" value="${escHtml(row.cena.ricevuta)}"${cFixed ? ' disabled' : ''}></td>
            <td><input class="cell-input num" type="number" step="1" min="1" data-sec="cena" data-f="coperti" value="${escHtml(row.cena.coperti)}"${cFixed ? ' disabled' : ''}></td>
            <td><span class="${cqDisp.cls}" data-out="cena-quota" title="${escHtml(cqDisp.title)}">${escHtml(cqDisp.text)}</span></td>
            <td><select class="cell-select" data-sec="cena" data-f="note">${buildSelectOptionsHtml(Defaults.NOTE_PASTO, row.cena.note, 'value', 'value')}</select></td>
            <td><select class="cell-select" data-sec="cena" data-f="code">${buildVisitedOptionsHtml(visited, row.cena.code, true)}</select></td>

            <!-- PERNOTTO -->
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-sec="pernotto" data-f="ricevuta" value="${escHtml(row.pernotto.ricevuta)}" placeholder="${escHtml(pernPlaceholder)}"${nFixed ? ' disabled' : ''}></td>
            <td><select class="cell-select" data-sec="pernotto" data-f="note">${buildSelectOptionsHtml(Defaults.NOTE_PERNOTTO, row.pernotto.note, 'value', 'value')}</select></td>
            <td><select class="cell-select" data-sec="pernotto" data-f="code">${buildVisitedOptionsHtml(visited, row.pernotto.code, true)}</select></td>

            <!-- COLAZIONE -->
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-sec="colazione" data-f="ricevuta" value="${escHtml(row.colazione.ricevuta)}"${colFixed ? ' disabled' : ''}></td>
            <td><input class="cell-input num" type="number" step="1" min="1" data-sec="colazione" data-f="coperti" value="${escHtml(row.colazione.coperti)}"${colFixed ? ' disabled' : ''}></td>
            <td><span class="${colqDisp.cls}" data-out="colaz-quota" title="${escHtml(colqDisp.title)}">${escHtml(colqDisp.text)}</span></td>
            <td><select class="cell-select" data-sec="colazione" data-f="note">${buildSelectOptionsHtml(Defaults.NOTE_COLAZIONE, row.colazione.note, 'value', 'value')}</select></td>
            <td><select class="cell-select" data-sec="colazione" data-f="code">${buildVisitedOptionsHtml(visited, row.colazione.code, true)}</select></td>

            <!-- RIENTRO -->
            <td><select class="cell-select" data-sec="rientro" data-f="rientro">${buildSelectOptionsHtml(Defaults.RIENTRO_OPTIONS, row.rientro, null, null)}</select></td>
          </tr>
        `;
      })
      .join('');

    wrap.innerHTML = `
      <div class="mobile-scroll-hint">← Scorri la tabella a destra per Cena, Pernottamento e Colazione →</div>
      <div class="table-wrap">
        <table class="data-table diarie-table">
          <thead>
            <tr>
              <th rowspan="2" class="grp-date" style="width:92px;">Giorno</th>
              <th colspan="5" class="grp-pranzo">Pranzo</th>
              <th colspan="5" class="grp-cena">Cena</th>
              <th colspan="3" class="grp-pernotto">Pernottamento</th>
              <th colspan="5" class="grp-colazione">Colazione</th>
              <th rowspan="2" class="grp-rientro" style="width:74px;">Rientro</th>
            </tr>
            <tr>
              <th class="grp-pranzo" style="width:68px;">Ricev.</th>
              <th class="grp-pranzo" style="width:42px;">Cop.</th>
              <th class="grp-pranzo" style="width:64px;">Quota</th>
              <th class="grp-pranzo" style="width:96px;">Note</th>
              <th class="grp-pranzo" style="width:105px;">Paese</th>

              <th class="grp-cena" style="width:68px;">Ricev.</th>
              <th class="grp-cena" style="width:42px;">Cop.</th>
              <th class="grp-cena" style="width:64px;">Quota</th>
              <th class="grp-cena" style="width:96px;">Note</th>
              <th class="grp-cena" style="width:105px;">Paese</th>

              <th class="grp-pernotto" style="width:74px;">Ricev.</th>
              <th class="grp-pernotto" style="width:86px;">Note</th>
              <th class="grp-pernotto" style="width:105px;">Paese</th>

              <th class="grp-colazione" style="width:64px;">Ricev.</th>
              <th class="grp-colazione" style="width:42px;">Cop.</th>
              <th class="grp-colazione" style="width:62px;">Quota</th>
              <th class="grp-colazione" style="width:82px;">Note</th>
              <th class="grp-colazione" style="width:105px;">Paese</th>
            </tr>
          </thead>
          <tbody>${trHtml}</tbody>
        </table>
      </div>
    `;

    syncDiarieOutputs(container, state.calc);

    wrap.querySelectorAll('input, select').forEach((el) => {
      const tr = el.closest('tr[data-iso]');
      const iso = tr.dataset.iso;
      const sec = el.dataset.sec;
      const f = el.dataset.f;
      const evName = el.tagName === 'SELECT' ? 'change' : 'input';

      el.addEventListener(evName, () => {
        let val = el.value;
        if (el.type === 'number') {
          val = val === '' ? '' : Number(val);
        }
        // Auto-compila 1 coperto quando si inserisce una ricevuta su pranzo/cena/colazione
        if (f === 'ricevuta' && (sec === 'pranzo' || sec === 'cena' || sec === 'colazione') && val > 0) {
          const copEl = tr.querySelector(`[data-sec="${sec}"][data-f="coperti"]`);
          if (copEl && copEl.value === '') {
            copEl.value = '1';
            actions.updateDayField(iso, sec, 'coperti', 1);
          }
        }
        // Disabilita ricevuta/coperti se si sceglie una nota forfait
        if (f === 'note') {
          const ricEl = tr.querySelector(`[data-sec="${sec}"][data-f="ricevuta"]`);
          const copEl = tr.querySelector(`[data-sec="${sec}"][data-f="coperti"]`);
          const lock =
            sec === 'pernotto'
              ? isPernottoFixedNote(val)
              : sec === 'colazione'
                ? isColazFixedNote(val)
                : isMealFixedNote(val);
          if (ricEl) {
            ricEl.disabled = lock;
            if (lock) {
              ricEl.value = '';
              actions.updateDayField(iso, sec, 'ricevuta', '');
            }
          }
          if (copEl) {
            copEl.disabled = lock;
            if (lock) {
              copEl.value = '';
              actions.updateDayField(iso, sec, 'coperti', '');
            }
          }
        }

        actions.updateDayField(iso, sec, f, val);
        syncDiarieOutputs(container, state.calc);
        renderKpiBar(container, state.calc);
      });
    });

    wrap.querySelectorAll('[data-copy-prev]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const iso = btn.dataset.copyPrev;
        const idx = state.calc.dailyRows.findIndex((r) => r.iso === iso);
        if (idx > 0) {
          actions.copyPreviousDay(state.calc.dailyRows[idx - 1].iso, iso);
          renderDiarieSection(container, state, actions);
          renderKpiBar(container, state.calc);
        }
      });
    });

    toolbar.querySelector('#btn-bulk-fill-country').addEventListener('click', () => {
      const code = toolbar.querySelector('#bulk-country-select').value;
      actions.bulkFillCountry(code);
      renderDiarieSection(container, state, actions);
      renderKpiBar(container, state.calc);
    });

    toolbar.querySelector('#btn-bulk-colaz-it').addEventListener('click', () => {
      actions.bulkFillItalyBreakfast();
      renderDiarieSection(container, state, actions);
      renderKpiBar(container, state.calc);
    });
  }

  function syncDiarieOutputs(container, calc) {
    calc.dailyRows.forEach((row) => {
      const tr = container.querySelector(`tr[data-iso="${CSS.escape(row.iso)}"]`);
      if (!tr) return;

      const applyQuota = (selector, meal, isColazione) => {
        const el = tr.querySelector(selector);
        if (!el) return;
        const d = formatQuotaDisplay(meal, isColazione);
        el.textContent = d.text;
        el.className = d.cls;
        el.title = d.title;
      };

      applyQuota('[data-out="pranzo-quota"]', row.pranzo, false);
      applyQuota('[data-out="cena-quota"]', row.cena, false);
      applyQuota('[data-out="colaz-quota"]', row.colazione, true);

      const pernRic = tr.querySelector('[data-sec="pernotto"][data-f="ricevuta"]');
      if (pernRic) {
        const pernForfVal = row.pernotto.forfEstero > 0 ? row.pernotto.forfEstero : row.pernotto.forfIt;
        pernRic.placeholder = pernForfVal > 0 ? `€ ${Calc.formatItCurrency(pernForfVal)}` : '';
      }

      const warnMessages = [];
      if (row.warnings.pMissingCovers) warnMessages.push('Pranzo: coperti mancanti');
      if (row.warnings.cMissingCovers) warnMessages.push('Cena: coperti mancanti');
      if (row.warnings.colMissingCovers) warnMessages.push('Colazione: coperti mancanti');
      if (row.warnings.pOverCap) warnMessages.push('Pranzo estero oltre massimale (tagliato al limite)');
      if (row.warnings.cOverCap) warnMessages.push('Cena estera oltre massimale (tagliata al limite)');
      if (row.warnings.pDisallowed) warnMessages.push('Pranzo IT non spettante per orario');
      if (row.warnings.cDisallowed) warnMessages.push('Cena IT non spettante per orario');
      if (row.warnings.nDisallowed) warnMessages.push('Pernotto Forfait IT oltre notti spettanti');

      const dot = tr.querySelector(`[data-row-warn="${CSS.escape(row.iso)}"]`);
      if (dot) {
        dot.hidden = warnMessages.length === 0;
        dot.title = warnMessages.join(' · ');
      }
      tr.classList.toggle('warn-row', warnMessages.length > 0);
    });
  }

  function renderTicketsSection(container, state, actions) {
    const wrap = container.querySelector('#tickets-wrap');
    if (!wrap) return;
    const list = state.trip.biglietti || [];
    const evalRows = state.calc.tickets.rows;
    const visited = state.calc.visitedCountries.entries;

    if (list.length === 0) {
      wrap.innerHTML = `<div class="empty-state">Nessuna tappa o biglietto inserito. Clicca <strong>+ Aggiungi Tappa / Biglietto</strong> per aggiungere arrivi intermedi, spostamenti o biglietti di viaggio.</div>`;
      return;
    }

    const rowsHtml = list
      .map((b, i) => {
        const ev = evalRows[i] || { totDipEur: 0 };
        const isFirst = i === 0;
        const isLast = i === list.length - 1;
        return `
          <tr data-tk-idx="${i}">
            <td style="text-align:center; color:var(--text-muted);">${i + 1}</td>
            <td>
              <select class="cell-select" data-tk-f="nTrasf">
                <option value="1"${Number(b.nTrasf) === 1 ? ' selected' : ''}>1</option>
                <option value="2"${Number(b.nTrasf) === 2 ? ' selected' : ''}>2</option>
                <option value="3"${Number(b.nTrasf) === 3 ? ' selected' : ''}>3</option>
              </select>
            </td>
            <td><input class="cell-input" type="text" data-tk-f="localita" value="${escHtml(b.localita)}" placeholder="es. PISA, RENNES, LAVAL..."></td>
            <td><input class="cell-input" type="date" data-tk-f="dataArrivo" value="${escHtml(b.dataArrivo)}"></td>
            <td><select class="cell-select" data-tk-f="mezzo">${buildSelectOptionsHtml(Defaults.MEZZI_TRASPORTO, b.mezzo || 'AE', 'code', 'label')}</select></td>
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-tk-f="pagatiDipEur" value="${escHtml(b.pagatiDipEur)}" placeholder="€"></td>
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-tk-f="pagatiDipValuta" value="${escHtml(b.pagatiDipValuta)}" placeholder="Val."></td>
            <td><select class="cell-select" data-tk-f="code">${buildVisitedOptionsHtml(visited, b.code || 'IT', false)}</select></td>
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-tk-f="pagatiRaiEur" value="${escHtml(b.pagatiRaiEur)}" placeholder="€"></td>
            <td><span class="cell-readonly" data-tk-out="eur">€ ${Calc.formatItCurrency(ev.totDipEur)}</span></td>
            <td style="text-align:center; white-space:nowrap;">
              <button type="button" class="btn btn-xs btn-ghost" data-tk-move="up" title="Sposta su"${isFirst ? ' disabled' : ''}>↑</button>
              <button type="button" class="btn btn-xs btn-ghost" data-tk-move="down" title="Sposta giù"${isLast ? ' disabled' : ''}>↓</button>
              <button type="button" class="btn btn-xs btn-ghost-danger" data-tk-del="${i}" title="Elimina riga">✕</button>
            </td>
          </tr>
        `;
      })
      .join('');

    wrap.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:34px;">#</th>
              <th style="width:65px;">Trasf.</th>
              <th>Località di Destinazione</th>
              <th style="width:130px;">Data Arrivo</th>
              <th style="width:155px;">Mezzo</th>
              <th style="width:92px;">Pag. Dip (€)</th>
              <th style="width:92px;">Pag. Dip (Val.)</th>
              <th style="width:130px;">Paese</th>
              <th style="width:92px;">Pag. RAI (€)</th>
              <th style="width:95px;">Tot. Dip (€)</th>
              <th style="width:96px;">Ordine / Az.</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot>
            <tr style="background:var(--surface-alt); font-weight:700;">
              <td colspan="8" style="text-align:right;">Totali Biglietti / Tappe:</td>
              <td class="num" style="text-align:right;" id="tk-tot-rai">€ ${Calc.formatItCurrency(state.calc.tickets.totPagatiRaiEur)}</td>
              <td class="num" style="text-align:right;" id="tk-tot-dip">€ ${Calc.formatItCurrency(state.calc.tickets.totPagatiDipComplEur)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    wrap.querySelectorAll('input, select').forEach((el) => {
      const idx = Number(el.closest('tr').dataset.tkIdx);
      const field = el.dataset.tkF;
      const evName = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evName, () => {
        let val = el.value;
        if (el.type === 'number') val = val === '' ? '' : Number(val);
        if (field === 'pagatiDipEur' && val !== '' && val > 0) {
          const other = wrap.querySelector(`tr[data-tk-idx="${idx}"] [data-tk-f="pagatiDipValuta"]`);
          if (other) other.value = '';
          actions.updateTicketField(idx, 'pagatiDipValuta', '');
        }
        if (field === 'pagatiDipValuta' && val !== '' && val > 0) {
          const other = wrap.querySelector(`tr[data-tk-idx="${idx}"] [data-tk-f="pagatiDipEur"]`);
          if (other) other.value = '';
          actions.updateTicketField(idx, 'pagatiDipEur', '');
        }
        actions.updateTicketField(idx, field, val);
        syncTicketsOutputs(container, state.calc);
        renderKpiBar(container, state.calc);
      });
    });

    wrap.querySelectorAll('[data-tk-move]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.closest('tr').dataset.tkIdx);
        const delta = btn.dataset.tkMove === 'up' ? -1 : 1;
        actions.moveTicket(idx, delta);
        renderTicketsSection(container, state, actions);
      });
    });

    wrap.querySelectorAll('[data-tk-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.removeTicket(Number(btn.dataset.tkDel));
        renderTicketsSection(container, state, actions);
        renderKpiBar(container, state.calc);
      });
    });
  }

  function syncTicketsOutputs(container, calc) {
    calc.tickets.rows.forEach((r, i) => {
      const out = container.querySelector(`tr[data-tk-idx="${i}"] [data-tk-out="eur"]`);
      if (out) out.textContent = `€ ${Calc.formatItCurrency(r.totDipEur)}`;
    });
    const tDip = container.querySelector('#tk-tot-dip');
    const tRai = container.querySelector('#tk-tot-rai');
    if (tDip) tDip.textContent = `€ ${Calc.formatItCurrency(calc.tickets.totPagatiDipComplEur)}`;
    if (tRai) tRai.textContent = `€ ${Calc.formatItCurrency(calc.tickets.totPagatiRaiEur)}`;
  }

  function renderSpeseVarieSection(container, state, actions) {
    const wrap = container.querySelector('#spese-varie-wrap');
    if (!wrap) return;
    const list = state.trip.speseVarie || [];
    const evalRows = state.calc.speseVarie.rows;
    const visited = state.calc.visitedCountries.entries;

    if (list.length === 0) {
      wrap.innerHTML = `<div class="empty-state">Nessuna spesa varia inserita. Clicca <strong>+ Aggiungi Spesa</strong> per taxi, mezzi pubblici, parcheggi, ecc.</div>`;
      return;
    }

    const rowsHtml = list
      .map((s, i) => {
        const ev = evalRows[i] || { convEur: 0, moduleNumber: Math.floor(i / 8) + 1 };
        return `
          <tr data-sv-idx="${i}">
            <td style="text-align:center;">
              <span class="badge badge-blue">M${ev.moduleNumber}</span> ${i + 1}
            </td>
            <td><input class="cell-input" type="date" data-sv-f="data" value="${escHtml(s.data)}"></td>
            <td><input class="cell-input" type="text" data-sv-f="descrizione" value="${escHtml(s.descrizione)}" placeholder="Descrizione spesa documentata..."></td>
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-sv-f="pagateDipEur" value="${escHtml(s.pagateDipEur)}" placeholder="€"></td>
            <td><input class="cell-input num" type="number" step="0.01" min="0" data-sv-f="pagateDipValuta" value="${escHtml(s.pagateDipValuta)}" placeholder="Val."></td>
            <td><select class="cell-select" data-sv-f="code">${buildVisitedOptionsHtml(visited, s.code || 'IT', false)}</select></td>
            <td><span class="cell-readonly" data-sv-out="eur">€ ${Calc.formatItCurrency(ev.convEur)}</span></td>
            <td style="text-align:center;"><button type="button" class="btn btn-xs btn-ghost-danger" data-sv-del="${i}">✕</button></td>
          </tr>
        `;
      })
      .join('');

    wrap.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:70px;">Riga</th>
              <th style="width:130px;">Data</th>
              <th>Descrizione della Spesa</th>
              <th style="width:98px;">Pagate (€)</th>
              <th style="width:98px;">Pagate (Val.)</th>
              <th style="width:140px;">Paese</th>
              <th style="width:100px;">Equiv. (€)</th>
              <th style="width:40px;"></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot>
            <tr style="background:var(--surface-alt); font-weight:700;">
              <td colspan="6" style="text-align:right;">Totale Spese Varie Documentate:</td>
              <td class="num" style="text-align:right;" id="sv-tot-eur">€ ${Calc.formatItCurrency(state.calc.speseVarie.totEur)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    wrap.querySelectorAll('input, select').forEach((el) => {
      const idx = Number(el.closest('tr').dataset.svIdx);
      const field = el.dataset.svF;
      const evName = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evName, () => {
        let val = el.value;
        if (el.type === 'number') val = val === '' ? '' : Number(val);
        if (field === 'pagateDipEur' && val !== '' && val > 0) {
          const other = wrap.querySelector(`tr[data-sv-idx="${idx}"] [data-sv-f="pagateDipValuta"]`);
          if (other) other.value = '';
          actions.updateSpesaField(idx, 'pagateDipValuta', '');
        }
        if (field === 'pagateDipValuta' && val !== '' && val > 0) {
          const other = wrap.querySelector(`tr[data-sv-idx="${idx}"] [data-sv-f="pagateDipEur"]`);
          if (other) other.value = '';
          actions.updateSpesaField(idx, 'pagateDipEur', '');
        }
        actions.updateSpesaField(idx, field, val);
        syncSpeseOutputs(container, state.calc);
        renderKpiBar(container, state.calc);
      });
    });

    wrap.querySelectorAll('[data-sv-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.removeSpesa(Number(btn.dataset.svDel));
        renderSpeseVarieSection(container, state, actions);
        renderKpiBar(container, state.calc);
      });
    });
  }

  function syncSpeseOutputs(container, calc) {
    calc.speseVarie.rows.forEach((r, i) => {
      const out = container.querySelector(`tr[data-sv-idx="${i}"] [data-sv-out="eur"]`);
      if (out) out.textContent = `€ ${Calc.formatItCurrency(r.convEur)}`;
    });
    const tot = container.querySelector('#sv-tot-eur');
    if (tot) tot.textContent = `€ ${Calc.formatItCurrency(calc.speseVarie.totEur)}`;
  }

  function bindStaticEditorEvents(container, state, actions) {
    container.querySelectorAll('[data-trip-field]').forEach((el) => {
      const evName = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evName, () => {
        const f = el.dataset.tripField;
        const val = el.type === 'number' ? (el.value === '' ? '' : Number(el.value)) : el.value;
        actions.updateTripField(f, val);
        renderKpiBar(container, state.calc);
      });
    });

    const btnMat = container.querySelector('#btn-toggle-mat-az');
    if (btnMat) {
      btnMat.addEventListener('click', () => {
        const inp = container.querySelector('#ed-annotazioni');
        const txt = 'VIAGGIATO CON MATERIALE AZIENDALE AL SEGUITO';
        inp.value = inp.value.trim() === txt ? '' : txt;
        actions.updateTripField('annotazioni', inp.value);
      });
    }

    const btnDemo = container.querySelector('#btn-load-demo');
    if (btnDemo) {
      btnDemo.addEventListener('click', () => actions.loadDemo());
    }

    container.querySelectorAll('tr[data-leg] input, tr[data-leg] select').forEach((el) => {
      const legIdx = Number(el.closest('tr').dataset.leg);
      const field = el.dataset.legField;
      const evName = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evName, () => {
        const prevDaysLen = state.calc.schedule.days.length;
        actions.updateTrasfertaLeg(legIdx, field, el.value);
        const leg = state.calc.schedule.legs[legIdx];
        const durCell = container.querySelector(`[data-leg-duration="${legIdx}"]`);
        if (durCell) {
          durCell.innerHTML = `<span class="badge ${leg && leg.valid ? 'badge-blue' : ''}">${leg && leg.valid ? `${leg.giorni} gg · ${leg.notti} notti` : '—'}</span>`;
        }
        renderKpiBar(container, state.calc);
        if (field === 'dal' || field === 'al' || state.calc.schedule.days.length !== prevDaysLen) {
          renderDiarieSection(container, state, actions);
        }
      });
    });

    container.querySelectorAll('[data-cutoff]').forEach((el) => {
      el.addEventListener('change', () => {
        actions.updateMealCutoff(el.dataset.cutoff, el.value);
        renderKpiBar(container, state.calc);
        syncDiarieOutputs(container, state.calc);
      });
    });

    const addCountryBtn = container.querySelector('#btn-add-country');
    const addCountryInput = container.querySelector('#add-country-input');
    const handleAddCountry = () => {
      const added = actions.addVisitedCountryByQuery(addCountryInput.value);
      if (added) {
        addCountryInput.value = '';
        renderVisitedCountriesSection(container, state, actions);
        renderDiarieSection(container, state, actions);
        renderTicketsSection(container, state, actions);
        renderSpeseVarieSection(container, state, actions);
        renderKpiBar(container, state.calc);
      }
    };
    if (addCountryBtn) addCountryBtn.addEventListener('click', handleAddCountry);
    if (addCountryInput) {
      addCountryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddCountry();
        }
      });
    }

    const btnAddTicket = container.querySelector('#btn-add-ticket');
    if (btnAddTicket) {
      btnAddTicket.addEventListener('click', () => {
        if (actions.addTicket()) {
          renderTicketsSection(container, state, actions);
          renderKpiBar(container, state.calc);
        }
      });
    }

    const btnAddSpesa = container.querySelector('#btn-add-spesa');
    if (btnAddSpesa) {
      btnAddSpesa.addEventListener('click', () => {
        if (actions.addSpesa()) {
          renderSpeseVarieSection(container, state, actions);
          renderKpiBar(container, state.calc);
        }
      });
    }
  }

  root.TrasferteUIEditor = { renderEditor };
})(typeof window !== 'undefined' ? window : globalThis);
