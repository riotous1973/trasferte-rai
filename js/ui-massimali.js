/**
 * Vista 4: Massimali & Codici Paesi (aggiornamento cambi Banca d'Italia, tariffe IT e 187 paesi esteri).
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

  let searchQuery = '';
  let filterBaseCurr = 'ALL';

  function renderMassimali(container, state, actions) {
    const { settings } = state;
    const ex = settings.exchangeRates;
    const it = settings.italyRates;

    container.innerHTML = `
      <div class="massimali-top-grid">
        <!-- Card Cambi Banca d'Italia -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Cambi Ufficiali Banca d'Italia</h2>
              <div class="card-subtitle">Usati per convertire in € i massimali espressi in USD e GBP</div>
            </div>
            <a href="${escHtml(ex.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-xs btn-secondary">
              Apri Banca d'Italia ↗
            </a>
          </div>
          <div class="card-body">
            <div class="form-grid">
              <div class="field">
                <label for="ms-usd">1 € = USD (Dollaro USA)</label>
                <input id="ms-usd" class="input num" type="number" step="0.0001" min="0.0001" data-ex-f="usd" value="${escHtml(ex.usd)}">
              </div>
              <div class="field">
                <label for="ms-gbp">1 € = GBP (Sterlina UK)</label>
                <input id="ms-gbp" class="input num" type="number" step="0.0001" min="0.0001" data-ex-f="gbp" value="${escHtml(ex.gbp)}">
              </div>
              <div class="field">
                <label for="ms-ex-date">Data Aggiornamento Cambi</label>
                <input id="ms-ex-date" class="input" type="date" data-ex-f="updatedAt" value="${escHtml(ex.updatedAt)}">
              </div>
            </div>
            <div style="margin-top:10px; font-size:12px; color:var(--text-muted);" id="ex-inv-info">
              1 USD = € ${(1 / (Calc.toNum(ex.usd) || 1)).toFixed(4)} · 1 GBP = € ${(1 / (Calc.toNum(ex.gbp) || 1)).toFixed(4)}
            </div>
          </div>
        </div>

        <!-- Card Massimali Italia (IT) -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Massimali &amp; Forfait Italia (Codice IT)</h2>
              <div class="card-subtitle">Valori in Euro applicati alle trasferte sul territorio nazionale</div>
            </div>
          </div>
          <div class="card-body">
            <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));">
              <div class="field"><label>1 Pasto (€)</label><input class="input num" type="number" step="0.01" data-it-f="pasto1" value="${escHtml(it.pasto1)}"></div>
              <div class="field"><label>Pasto MM (€)</label><input class="input num" type="number" step="0.01" data-it-f="pastoMM" value="${escHtml(it.pastoMM)}"></div>
              <div class="field"><label>P.S. Notti (€)</label><input class="input num" type="number" step="0.01" data-it-f="piccoleSpeseNotti" value="${escHtml(it.piccoleSpeseNotti)}"></div>
              <div class="field"><label>P.S. Pasti (€)</label><input class="input num" type="number" step="0.01" data-it-f="piccoleSpesePasti" value="${escHtml(it.piccoleSpesePasti)}"></div>
              <div class="field"><label>Ind. Trasferta (€)</label><input class="input num" type="number" step="0.01" data-it-f="indennitaTrasferta" value="${escHtml(it.indennitaTrasferta)}"></div>
              <div class="field"><label>FF Colazioni (€)</label><input class="input num" type="number" step="0.01" data-it-f="forfaitColazioni" value="${escHtml(it.forfaitColazioni)}"></div>
              <div class="field"><label>FF Pasti (€)</label><input class="input num" type="number" step="0.01" data-it-f="forfaitPasti" value="${escHtml(it.forfaitPasti)}"></div>
              <div class="field"><label>FF Pasti MM (€)</label><input class="input num" type="number" step="0.01" data-it-f="forfaitPastiMM" value="${escHtml(it.forfaitPastiMM)}"></div>
              <div class="field"><label>FF Notti (€)</label><input class="input num" type="number" step="0.01" data-it-f="forfaitNotti" value="${escHtml(it.forfaitNotti)}"></div>
            </div>
            <div class="field" style="margin-top:10px;">
              <label for="ms-mm-cities">Città con Massimale Maggiorato (MM / FMM, separate da virgola)</label>
              <input id="ms-mm-cities" class="input" type="text" value="${escHtml((settings.italyMmCities || []).join(', '))}">
            </div>
          </div>
        </div>
      </div>

      <!-- Card Codici Paesi -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Codici Paesi &amp; Massimali Esteri (${settings.countries.length} paesi)</h2>
            <div class="card-subtitle">Modifica i forfait in valuta base: tutti gli equivalenti in Euro (2 Pasti, 1 Pasto, Piccole Spese) si aggiornano in automatico</div>
          </div>
          <div class="toolbar-inline">
            <button type="button" id="btn-export-settings" class="btn btn-sm btn-ghost">Esporta JSON</button>
            <button type="button" id="btn-import-settings" class="btn btn-sm btn-ghost">Importa JSON</button>
            <input type="file" id="input-import-settings" accept=".json,application/json" hidden>
            <button type="button" id="btn-export-csv" class="btn btn-sm btn-ghost">Esporta CSV</button>
            <button type="button" id="btn-reset-settings" class="btn btn-sm btn-ghost-danger">Ripristina Originali</button>
          </div>
        </div>

        <div class="card-body">
          <!-- Barra filtri + aggiungi paese -->
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
            <div class="toolbar-inline">
              <input id="ms-search" class="input" style="width:240px;" type="search" value="${escHtml(searchQuery)}" placeholder="Cerca codice, paese o moneta...">
              <select id="ms-filter-curr" class="select" style="width:140px;">
                <option value="ALL"${filterBaseCurr === 'ALL' ? ' selected' : ''}>Tutte le valute</option>
                <option value="EUR"${filterBaseCurr === 'EUR' ? ' selected' : ''}>Base EUR</option>
                <option value="USD"${filterBaseCurr === 'USD' ? ' selected' : ''}>Base USD</option>
                <option value="GBP"${filterBaseCurr === 'GBP' ? ' selected' : ''}>Base GBP</option>
              </select>
              <span class="card-subtitle" id="ms-count-info"></span>
            </div>

            <form id="add-country-form" class="toolbar-inline" style="background:var(--surface-alt); padding:6px 8px; border:1px solid var(--border); border-radius:var(--radius-sm);">
              <input class="cell-input" style="width:70px;" name="code" placeholder="Cod." maxlength="6" required>
              <input class="cell-input" style="width:150px;" name="name" placeholder="Nome Paese" required>
              <select class="cell-select" style="width:74px;" name="baseCurrency">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
              <input class="cell-input num" style="width:82px;" name="forfaitMistoValuta" type="number" step="0.01" placeholder="Forf. Misto">
              <input class="cell-input num" style="width:86px;" name="forfaitTotaleValuta" type="number" step="0.01" placeholder="Forf. Totale">
              <input class="cell-input" style="width:68px;" name="localCurrency" placeholder="ISO" maxlength="5">
              <button type="submit" class="btn btn-xs btn-primary">+ Aggiungi Paese</button>
            </form>
          </div>

          <div class="table-wrap" style="max-height:540px; overflow:auto;">
            <table class="data-table">
              <thead style="position:sticky; top:0; z-index:2;">
                <tr>
                  <th style="width:72px;">Codice</th>
                  <th style="min-width:165px; text-align:left;">Paese</th>
                  <th style="width:78px;">Val. Base</th>
                  <th style="width:95px;">Forf. Misto (Val.)</th>
                  <th style="width:95px;">Forf. Totale (Val.)</th>
                  <th style="width:84px;">Forf. Misto (€)</th>
                  <th style="width:84px;">Forf. Totale (€)</th>
                  <th style="width:84px;">2 Pasti (€)</th>
                  <th style="width:84px;">1 Pasto (€)</th>
                  <th style="width:84px;">Picc. Spese (€)</th>
                  <th style="width:70px;">Moneta</th>
                  <th style="width:80px;">Cambio Ind.</th>
                  <th style="width:55px;"></th>
                </tr>
              </thead>
              <tbody id="ms-countries-tbody"></tbody>
            </table>
          </div>

          <details class="accordion" style="margin-top:14px;">
            <summary>Riferimento Fasce U.S.A. (A, B, C)</summary>
            <div class="accordion-body">
              ${Defaults.USA_BANDS.map(
                (b) => `<p style="margin:6px 0; font-size:12.5px;"><strong>${escHtml(b.band)}:</strong> ${escHtml(b.cities)}</p>`
              ).join('')}
            </div>
          </details>
        </div>
      </div>
    `;

    renderCountriesRows(container, state, actions);
    bindMassimaliStaticEvents(container, state, actions);
  }

  function renderCountriesRows(container, state, actions) {
    const tbody = container.querySelector('#ms-countries-tbody');
    const countInfo = container.querySelector('#ms-count-info');
    if (!tbody) return;

    const q = searchQuery.trim().toLowerCase();
    const qNorm = q.replace(/[.\s-]+/g, '');
    const list = state.settings.countries
      .map((c, idx) => ({ country: c, idx }))
      .filter(({ country }) => {
        if (filterBaseCurr !== 'ALL' && country.baseCurrency !== filterBaseCurr) return false;
        if (!q) return true;
        const fields = [country.code, country.name, country.localCurrency || '', country.currencyName || ''];
        return fields.some((f) => {
          const fl = f.toLowerCase();
          return fl.includes(q) || (qNorm && fl.replace(/[.\s-]+/g, '').includes(qNorm));
        });
      });

    if (countInfo) {
      countInfo.textContent = `${list.length} su ${state.settings.countries.length} visualizzati`;
    }

    tbody.innerHTML = list
      .map(({ country: c, idx }) => {
        const rates = Calc.computeCountryRates(c, state.settings.exchangeRates);
        return `
          <tr data-c-idx="${idx}">
            <td><input class="cell-input" type="text" data-c-f="code" value="${escHtml(c.code)}"></td>
            <td><input class="cell-input" type="text" data-c-f="name" value="${escHtml(c.name)}"></td>
            <td>
              <select class="cell-select" data-c-f="baseCurrency">
                <option value="EUR"${c.baseCurrency === 'EUR' ? ' selected' : ''}>EUR</option>
                <option value="USD"${c.baseCurrency === 'USD' ? ' selected' : ''}>USD</option>
                <option value="GBP"${c.baseCurrency === 'GBP' ? ' selected' : ''}>GBP</option>
              </select>
            </td>
            <td><input class="cell-input num" type="number" step="0.01" data-c-f="forfaitMistoValuta" value="${escHtml(c.forfaitMistoValuta ?? '')}"></td>
            <td><input class="cell-input num" type="number" step="0.01" data-c-f="forfaitTotaleValuta" value="${escHtml(c.forfaitTotaleValuta ?? '')}"></td>
            <td><span class="cell-readonly" data-c-out="fmEur">${Calc.formatItCurrency(rates.forfaitMistoEur)}</span></td>
            <td><span class="cell-readonly" data-c-out="ftEur">${Calc.formatItCurrency(rates.forfaitTotaleEur)}</span></td>
            <td><span class="cell-readonly" data-c-out="p2Eur">${Calc.formatItCurrency(rates.twoMealsEur)}</span></td>
            <td><span class="cell-readonly" data-c-out="p1Eur">${Calc.formatItCurrency(rates.oneMealEur)}</span></td>
            <td><span class="cell-readonly" data-c-out="psEur">${Calc.formatItCurrency(rates.piccoleSpeseEur)}</span></td>
            <td><input class="cell-input" type="text" data-c-f="localCurrency" value="${escHtml(c.localCurrency)}" title="${escHtml(c.currencyName)}"></td>
            <td><input class="cell-input num" type="number" step="0.0001" data-c-f="indicativeRate" value="${escHtml(c.indicativeRate ?? '')}"></td>
            <td style="text-align:center;"><button type="button" class="btn btn-xs btn-ghost-danger" data-c-del="${idx}" title="Elimina paese">✕</button></td>
          </tr>
        `;
      })
      .join('');

    tbody.querySelectorAll('input, select').forEach((el) => {
      const tr = el.closest('tr[data-c-idx]');
      const idx = Number(tr.dataset.cIdx);
      const field = el.dataset.cF;
      const evName = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evName, () => {
        let val = el.value;
        if (el.type === 'number') val = val === '' ? null : Number(val);
        else if (field === 'code' || field === 'localCurrency') val = val.trim().toUpperCase();
        actions.updateCountry(idx, field, val);
        syncSingleCountryOutputs(tr, state.settings.countries[idx], state.settings.exchangeRates);
      });
    });

    tbody.querySelectorAll('[data-c-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.cDel);
        const c = state.settings.countries[idx];
        if (c && window.confirm(`Eliminare il paese ${c.code} (${c.name}) dalla tabella massimali?`)) {
          actions.removeCountry(idx);
          renderCountriesRows(container, state, actions);
        }
      });
    });
  }

  function syncSingleCountryOutputs(tr, country, exchangeRates) {
    if (!tr || !country) return;
    const rates = Calc.computeCountryRates(country, exchangeRates);
    const set = (k, v) => {
      const el = tr.querySelector(`[data-c-out="${k}"]`);
      if (el) el.textContent = Calc.formatItCurrency(v);
    };
    set('fmEur', rates.forfaitMistoEur);
    set('ftEur', rates.forfaitTotaleEur);
    set('p2Eur', rates.twoMealsEur);
    set('p1Eur', rates.oneMealEur);
    set('psEur', rates.piccoleSpeseEur);
  }

  function syncAllCountryOutputs(container, state) {
    container.querySelectorAll('#ms-countries-tbody tr[data-c-idx]').forEach((tr) => {
      const idx = Number(tr.dataset.cIdx);
      syncSingleCountryOutputs(tr, state.settings.countries[idx], state.settings.exchangeRates);
    });
  }

  function bindMassimaliStaticEvents(container, state, actions) {
    container.querySelectorAll('[data-ex-f]').forEach((el) => {
      el.addEventListener('input', () => {
        const f = el.dataset.exF;
        const val = el.type === 'number' ? Calc.toNum(el.value) : el.value;
        actions.updateExchangeRate(f, val);
        const ex = state.settings.exchangeRates;
        const info = container.querySelector('#ex-inv-info');
        if (info) {
          info.textContent = `1 USD = € ${(1 / (Calc.toNum(ex.usd) || 1)).toFixed(4)} · 1 GBP = € ${(1 / (Calc.toNum(ex.gbp) || 1)).toFixed(4)}`;
        }
        syncAllCountryOutputs(container, state);
      });
    });

    container.querySelectorAll('[data-it-f]').forEach((el) => {
      el.addEventListener('input', () => {
        actions.updateItalyRate(el.dataset.itF, Calc.toNum(el.value));
      });
    });

    const citiesInp = container.querySelector('#ms-mm-cities');
    if (citiesInp) {
      citiesInp.addEventListener('change', () => {
        const arr = citiesInp.value
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean);
        actions.updateItalyMmCities(arr);
      });
    }

    const searchInp = container.querySelector('#ms-search');
    if (searchInp) {
      searchInp.addEventListener('input', () => {
        searchQuery = searchInp.value;
        renderCountriesRows(container, state, actions);
      });
    }

    const currSel = container.querySelector('#ms-filter-curr');
    if (currSel) {
      currSel.addEventListener('change', () => {
        filterBaseCurr = currSel.value;
        renderCountriesRows(container, state, actions);
      });
    }

    const addForm = container.querySelector('#add-country-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(addForm);
        const code = String(fd.get('code') || '').trim().toUpperCase();
        const name = String(fd.get('name') || '').trim();
        if (!code || !name) return;
        const ok = actions.addCountry({
          code,
          name,
          baseCurrency: String(fd.get('baseCurrency') || 'EUR'),
          forfaitMistoValuta: fd.get('forfaitMistoValuta') ? Number(fd.get('forfaitMistoValuta')) : null,
          forfaitTotaleValuta: fd.get('forfaitTotaleValuta') ? Number(fd.get('forfaitTotaleValuta')) : null,
          indicativeRate: null,
          localCurrency: String(fd.get('localCurrency') || 'EUR').trim().toUpperCase(),
          currencyName: '',
        });
        if (ok) {
          addForm.reset();
          renderMassimali(container, state, actions);
        }
      });
    }

    container.querySelector('#btn-export-settings').addEventListener('click', () => {
      actions.exportSettings();
    });

    const impInput = container.querySelector('#input-import-settings');
    container.querySelector('#btn-import-settings').addEventListener('click', () => impInput.click());
    impInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        actions.importSettings(String(reader.result || ''));
        renderMassimali(container, state, actions);
      };
      reader.readAsText(file, 'utf-8');
      impInput.value = '';
    });

    container.querySelector('#btn-export-csv').addEventListener('click', () => {
      actions.exportCsv();
    });

    container.querySelector('#btn-reset-settings').addEventListener('click', () => {
      if (window.confirm('Ripristinare tutti i cambi, massimali Italia e codici paesi ai valori originali del file Excel?')) {
        actions.resetSettings();
        renderMassimali(container, state, actions);
      }
    });
  }

  root.TrasferteUIMassimali = { renderMassimali };
})(typeof window !== 'undefined' ? window : globalThis);
