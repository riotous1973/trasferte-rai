/**
 * Vista 5: Archivio Trasferte (elenco, ricerca, rinomina, stato, apertura, export e duplicazione).
 */
(function (root) {
  'use strict';

  const Calc = root.TrasferteCalc;
  const Storage = root.TrasferteStorage;

  let searchQuery = '';
  let statusFilter = 'ALL';

  function escHtml(val) {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDateTimeIt(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  }

  function formatDateRangeText(calc) {
    const leg1 = calc.schedule.legs[0];
    const days = calc.schedule.days;
    if (!days || days.length === 0) {
      return leg1 && leg1.dal ? Calc.formatDateDDMM(leg1.dal).ddmmyyyy : 'Date non impostate';
    }
    const start = days[0].dateParts.ddmmyyyy;
    const end = days[days.length - 1].dateParts.ddmmyyyy;
    return start === end ? start : `${start} → ${end}`;
  }

  function renderArchive(container, archiveState, settingsState, actions) {
    const trips = (archiveState && archiveState.trips) || [];
    const activeId = archiveState && archiveState.activeTripId;
    const countriesMap = Calc.buildCountriesMap(settingsState.countries);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Archivio Trasferte Salvate (${trips.length})</h2>
            <div class="card-subtitle">Ogni trasferta è salvata in automatico separatamente con il proprio nome di riferimento</div>
          </div>
          <div class="toolbar-inline">
            <button type="button" id="arch-new-trip" class="btn btn-sm btn-primary">+ Nuova Trasferta</button>
            <button type="button" id="arch-export-all" class="btn btn-sm btn-ghost">Esporta Tutto l'Archivio (JSON)</button>
            <button type="button" id="arch-import-json" class="btn btn-sm btn-ghost">Importa JSON</button>
          </div>
        </div>

        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
            <div class="toolbar-inline">
              <input id="arch-search" class="input" style="width:280px;" type="search" value="${escHtml(searchQuery)}" placeholder="Cerca per nome, autorizzazione, destinazione, paese...">
              <select id="arch-filter-status" class="select" style="width:165px;">
                <option value="ALL"${statusFilter === 'ALL' ? ' selected' : ''}>Tutti gli stati</option>
                <option value="in_corso"${statusFilter === 'in_corso' ? ' selected' : ''}>In corso</option>
                <option value="completata"${statusFilter === 'completata' ? ' selected' : ''}>Completate</option>
              </select>
              <span class="card-subtitle" id="arch-count-info"></span>
            </div>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="text-align:left; min-width:210px;">Nome / Riferimento</th>
                  <th style="width:110px;">Stato</th>
                  <th style="text-align:left; min-width:170px;">Autorizzazione &amp; Periodo</th>
                  <th style="text-align:left; min-width:150px;">Paesi / Destinazione</th>
                  <th style="width:115px;">Totale (€)</th>
                  <th style="width:115px;">Residuo (€)</th>
                  <th style="width:130px;">Ultimo Salvataggio</th>
                  <th style="width:310px;">Azioni</th>
                </tr>
              </thead>
              <tbody id="arch-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    renderArchiveRows(container, archiveState, settingsState, countriesMap, activeId, actions);

    container.querySelector('#arch-new-trip').addEventListener('click', () => {
      actions.createAndOpenNewTrip();
    });

    container.querySelector('#arch-export-all').addEventListener('click', () => {
      actions.exportFullArchive();
    });

    container.querySelector('#arch-import-json').addEventListener('click', () => {
      const imp = document.getElementById('input-import-trip');
      if (imp) imp.click();
    });

    container.querySelector('#arch-search').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderArchiveRows(container, archiveState, settingsState, countriesMap, activeId, actions);
    });

    container.querySelector('#arch-filter-status').addEventListener('change', (e) => {
      statusFilter = e.target.value;
      renderArchiveRows(container, archiveState, settingsState, countriesMap, activeId, actions);
    });
  }

  function renderArchiveRows(container, archiveState, settingsState, countriesMap, activeId, actions) {
    const tbody = container.querySelector('#arch-tbody');
    const info = container.querySelector('#arch-count-info');
    if (!tbody) return;

    const q = searchQuery.trim().toLowerCase();
    const sorted = archiveState.trips
      .slice()
      .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));

    const enriched = sorted.map((t) => {
      const visitedNames = (t.paesiVisitati || [])
        .map((p) => (countriesMap[p.code] ? countriesMap[p.code].name : p.code))
        .filter(Boolean);
      const firstDest =
        t.biglietti && t.biglietti[0] && t.biglietti[0].localita ? t.biglietti[0].localita : '';
      const calc = Calc.calculateTrip(t, settingsState);
      return { trip: t, calc, visitedNames, firstDest };
    });

    const filtered = enriched.filter(({ trip, visitedNames, firstDest }) => {
      if (statusFilter !== 'ALL' && (trip.stato || 'in_corso') !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        trip.nome || '',
        trip.numFoglioViaggio || '',
        trip.nominativo || '',
        trip.matricola || '',
        trip.annotazioni || '',
        firstDest,
        visitedNames.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    if (info) {
      info.textContent = `${filtered.length} su ${archiveState.trips.length} trasferte visualizzate`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">
            Nessuna trasferta corrisponde ai criteri di ricerca.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered
      .map(({ trip, calc, visitedNames, firstDest }) => {
        const isActive = trip.id === activeId;
        const isDone = trip.stato === 'completata';
        const title = trip.nome && trip.nome.trim() ? trip.nome.trim() : Storage.getTripDisplayLabel(trip);
        const periodText = formatDateRangeText(calc);
        const durBadge =
          calc.schedule.totGiorni > 0
            ? `${calc.schedule.totGiorni} gg · ${calc.schedule.totNotti} notti`
            : '—';
        const places = ['Italia', ...visitedNames].join(', ');
        const destLine = firstDest ? `${firstDest} (${places})` : places;

        return `
          <tr class="${isActive ? 'archive-row-active' : ''}" data-arch-id="${escHtml(trip.id)}">
            <td>
              <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                <strong>${escHtml(title)}</strong>
                ${isActive ? '<span class="badge badge-blue">Aperta</span>' : ''}
              </div>
              ${trip.nominativo ? `<div class="card-subtitle">${escHtml(trip.nominativo)}${trip.matricola ? ` · Matr. ${escHtml(trip.matricola)}` : ''}</div>` : ''}
            </td>
            <td style="text-align:center;">
              <button type="button" class="badge ${isDone ? 'badge-green' : 'badge-amber'}" style="border:none; cursor:pointer;" data-arch-toggle-status="${escHtml(trip.id)}" title="Clicca per cambiare stato">
                ${isDone ? 'Completata' : 'In corso'}
              </button>
            </td>
            <td>
              <div><strong>${trip.numFoglioViaggio ? `Autor. ${escHtml(trip.numFoglioViaggio)}` : 'Autor. n/d'}</strong></div>
              <div class="card-subtitle">${escHtml(periodText)} · ${escHtml(durBadge)}</div>
            </td>
            <td>
              <div style="font-size:12px;">${escHtml(destLine)}</div>
            </td>
            <td class="num" style="text-align:right; font-weight:700;">€ ${Calc.formatItCurrency(calc.notaSpese.totaleTrasferta)}</td>
            <td class="num" style="text-align:right; font-weight:700; color:var(--emerald);">€ ${Calc.formatItCurrency(calc.notaSpese.residuoNetto)}</td>
            <td style="text-align:center; font-size:11.5px; color:var(--text-muted);">${escHtml(formatDateTimeIt(trip.updatedAt))}</td>
            <td>
              <div class="toolbar-inline" style="gap:4px;">
                <button type="button" class="btn btn-xs ${isActive ? 'btn-secondary' : 'btn-primary'}" data-arch-open="${escHtml(trip.id)}">Apri</button>
                <button type="button" class="btn btn-xs btn-ghost" data-arch-print="${escHtml(trip.id)}">Modulo 1</button>
                <button type="button" class="btn btn-xs btn-ghost" data-arch-rename="${escHtml(trip.id)}">Rinomina</button>
                <button type="button" class="btn btn-xs btn-ghost" data-arch-dup="${escHtml(trip.id)}">Duplica</button>
                <button type="button" class="btn btn-xs btn-ghost" data-arch-exp="${escHtml(trip.id)}">JSON</button>
                <button type="button" class="btn btn-xs btn-ghost-danger" data-arch-del="${escHtml(trip.id)}">Elimina</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    tbody.querySelectorAll('[data-arch-open]').forEach((btn) => {
      btn.addEventListener('click', () => actions.openTrip(btn.dataset.archOpen, 'editor'));
    });

    tbody.querySelectorAll('[data-arch-print]').forEach((btn) => {
      btn.addEventListener('click', () => actions.openTrip(btn.dataset.archPrint, 'modulo'));
    });

    tbody.querySelectorAll('[data-arch-toggle-status]').forEach((btn) => {
      btn.addEventListener('click', () => actions.toggleTripStatus(btn.dataset.archToggleStatus));
    });

    tbody.querySelectorAll('[data-arch-rename]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.archRename;
        const t = archiveState.trips.find((item) => item.id === id);
        const curName = (t && t.nome) || '';
        const nextName = window.prompt('Inserisci il nome / riferimento della trasferta:', curName);
        if (nextName !== null) {
          actions.renameTrip(id, nextName.trim());
        }
      });
    });

    tbody.querySelectorAll('[data-arch-dup]').forEach((btn) => {
      btn.addEventListener('click', () => actions.duplicateTripById(btn.dataset.archDup));
    });

    tbody.querySelectorAll('[data-arch-exp]').forEach((btn) => {
      btn.addEventListener('click', () => actions.exportTripById(btn.dataset.archExp));
    });

    tbody.querySelectorAll('[data-arch-del]').forEach((btn) => {
      btn.addEventListener('click', () => actions.deleteTripById(btn.dataset.archDel));
    });
  }

  root.TrasferteUIArchive = { renderArchive };
})(typeof window !== 'undefined' ? window : globalThis);
