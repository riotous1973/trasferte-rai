/**
 * Vista 3: Modulo 1 / 2 / 3 (MOD.31426-) fedele all'originale Excel e pronto per la stampa A4.
 */
(function (root) {
  'use strict';

  const Defaults = root.TrasferteDefaults;
  const Calc = root.TrasferteCalc;

  const COL_WIDTH_PCTS = [
    2.70, 2.70, 2.60, 2.75, 6.45,
    2.45, 2.75, 6.45, 2.60, 2.75,
    6.45, 2.50, 2.70, 6.45, 2.60,
    2.75, 6.45, 2.50, 2.70, 6.45,
    2.85, 3.05, 6.45, 2.60, 2.75, 6.55,
  ];

  function escHtml(val) {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtAmt(num, decimals) {
    return Calc.formatItNumber(num, decimals === undefined ? 2 : decimals);
  }

  function formatMealCell(meal, countryTruncLen) {
    if (!meal) return { curr: '', amt: '', cop: '', note: '' };
    const rawRic = Calc.toNum(meal.ricevuta);
    const quota = meal.quota !== null && meal.quota !== undefined ? Calc.toNum(meal.quota) : 0;
    const val = rawRic > 0 ? rawRic : quota;
    const amt = fmtAmt(val, 2);
    const curr = amt ? meal.currencyLabel || '' : '';
    const cop = amt && rawRic > 0 && meal.coperti ? `${meal.coperti} P` : '';

    let note = '';
    if (meal.note === 'InViaggio') {
      note = 'InViaggio';
    } else if (!meal.note) {
      note = meal.countryName || '';
    } else {
      const cShort = (meal.countryName || '').slice(0, countryTruncLen || 16);
      note = cShort ? `${meal.note}\n${cShort}` : meal.note;
    }
    return { curr, amt, cop, note };
  }

  function formatPernottoCell(p) {
    if (!p) return { curr: '', amt: '', note: '', country: '' };
    const amt = fmtAmt(Calc.toNum(p.ricevuta), 2);
    const curr = amt ? p.currencyLabel || '' : '';
    return {
      curr,
      amt,
      note: p.note || '',
      country: p.countryName || '',
    };
  }

  function formatColazioneCell(col) {
    if (!col) return { curr: '', amt: '', cop: '', note: '' };
    const rawRic = Calc.toNum(col.ricevuta);
    const quota = col.quota !== null && col.quota !== undefined ? Calc.toNum(col.quota) : 0;
    const val = rawRic > 0 ? rawRic : quota;
    const amt = fmtAmt(val, 2);
    const curr = amt ? col.currencyLabel || '' : '';
    const cop = amt && rawRic > 0 && col.coperti ? `${col.coperti} P` : '';
    const note = amt && col.countryName ? `${col.note || ''} - ${col.countryName}` : '';
    return { curr, amt, cop, note };
  }

  function renderSingleModuloSheet(page) {
    const colgroup = COL_WIDTH_PCTS.map((w) => `<col style="width:${w}%">`).join('');

    const t1 = page.trasferte[0] || { inizio: {}, termine: {} };
    const t2 = page.trasferte[1] || { inizio: {}, termine: {} };
    const t3 = page.trasferte[2] || { inizio: {}, termine: {} };

    const renderTimeBlocks = (t) => `
      <td colspan="2" class="m-trasf-val bt-thin bb-thin bl-thin br-thin">${escHtml(t.inizio.ddmm || '')}</td>
      <td colspan="2" class="m-trasf-val bt-thin bb-thin bl-thin br-thin">${escHtml(t.inizio.hhmm || '')}</td>
      <td colspan="2" class="m-trasf-val bt-thin bb-thin bl-thin br-thin">${escHtml(t.termine.ddmm || '')}</td>
      <td colspan="2" class="m-trasf-val bt-thin bb-thin bl-thin br-thin">${escHtml(t.termine.hhmm || '')}</td>
    `;

    // Righe 13..28 (16 righe centrali)
    const midRowsHtml = [];
    for (let r = 0; r < 16; r++) {
      const tk = page.biglietti[r];
      const topCls = r === 0 ? 'bt-thin' : 'bt-hair';
      const botCls = r === 15 ? 'bb-thin' : 'bb-hair';

      const tkHtml = `
        <td class="m-td-ticket ${topCls} ${botCls} bl-thin br-thin">${tk && tk.nTrasf ? escHtml(tk.nTrasf) : ''}</td>
        <td colspan="5" class="m-td-ticket-loc ${topCls} ${botCls} bl-thin br-thin">${tk ? escHtml(tk.localita || '') : ''}</td>
        <td class="m-td-ticket-day ${topCls} ${botCls} bl-thin br-thin">${tk && tk.dateParts.day ? escHtml(tk.dateParts.day) : ''}</td>
        <td class="m-td-ticket-day ${topCls} ${botCls} bl-thin br-thin">${tk && tk.dateParts.month ? escHtml(tk.dateParts.month) : ''}</td>
        <td class="m-td-ticket ${topCls} ${botCls} bl-thin br-thin">${tk ? escHtml(tk.mezzo || '') : ''}</td>
        <td class="m-td-curr-6 ${topCls} ${botCls} bl-thin">${tk && tk.displayDipAmount > 0 ? escHtml(tk.displayDipCurrency) : ''}</td>
        <td colspan="2" class="m-td-ticket ${topCls} ${botCls} br-thin" style="text-align:right; padding-right:2px;">${tk ? fmtAmt(tk.displayDipAmount, 2) : ''}</td>
        <td class="m-td-curr-8 ${topCls} ${botCls} bl-thin">${tk && tk.raiEur > 0 ? '€' : ''}</td>
        <td colspan="2" class="m-td-ticket ${topCls} ${botCls} br-thin" style="text-align:right; padding-right:2px;">${tk ? fmtAmt(tk.raiEur, 2) : ''}</td>
      `;

      let rightHtml = '';
      if (r <= 7) {
        const sv = page.speseVarie[r];
        const svBot = r === 7 ? 'bb-thin' : 'bb-hair';
        rightHtml = `
          <td colspan="2" class="m-td-spesa-dt ${topCls} ${svBot} bl-thin br-hair">${sv && sv.dateParts.ddmm ? escHtml(sv.dateParts.ddmm) : ''}</td>
          <td colspan="5" class="m-td-spesa-desc ${topCls} ${svBot} bl-thin br-thin">${sv ? escHtml(sv.descrizione || '') : ''}</td>
          <td class="m-td-spesa-curr ${topCls} ${svBot}">${sv && sv.displayAmount > 0 ? escHtml(sv.displayCurrency) : ''}</td>
          <td colspan="2" class="m-td-spesa-imp ${topCls} ${svBot} br-thin">${sv ? fmtAmt(sv.displayAmount, 2) : ''}</td>
        `;
      } else if (r === 8) {
        // Riga 21: intestazione CAMBI
        rightHtml = `<td colspan="10" class="m-sec-title-7 bt-thin bb-thin">CAMBI</td>`;
      } else if (r === 9) {
        // Riga 22: colonne CAMBI
        rightHtml = `
          <td colspan="2" class="m-th-6 bt-thin bb-thin bl-thin br-thin">PAESE</td>
          <td colspan="2" class="m-th-6 bt-thin bb-thin bl-thin br-thin">CONTR.VALUTA</td>
          <td colspan="2" class="m-th-6 bt-thin bb-thin bl-thin br-thin">CONTR.EURO</td>
          <td colspan="2" class="m-th-6 bt-thin bb-thin bl-thin br-thin">COMMISSIONI</td>
          <td colspan="2" class="m-th-6 bt-thin bb-thin bl-thin br-thin">CAMBIO</td>
        `;
      } else {
        // Righe 23..28 (c = 0..5)
        const c = page.cambi[r - 10];
        const cTop = r === 10 ? 'bt-thin' : 'bt-hair';
        const cBot = r === 15 ? 'bb-thin' : 'bb-hair';
        let cValStr = '';
        let cEurStr = '';
        let cCommStr = '';
        let cRateStr = '';
        if (c) {
          if (c.valuta > 0) cValStr = `${fmtAmt(c.valuta, 2)} ${c.localCurrency}`;
          if (c.euro > 0) cEurStr = `${fmtAmt(c.euro, 2)} EUR`;
          if (c.commEur > 0 || c.commValuta > 0) {
            const sumComm = c.commEur + c.commValuta;
            cCommStr = `${fmtAmt(sumComm, 2)} ${c.commEur > 0 ? 'Eur' : c.localCurrency}`;
          }
          if (c.valuta > 0 && c.euro > 0) {
            cRateStr = c.cambio.toLocaleString('it-IT', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
          }
        }
        rightHtml = `
          <td colspan="2" class="m-td-cambi-paese ${cTop} ${cBot} bl-thin br-thin">${c ? escHtml(c.name) : ''}</td>
          <td colspan="2" class="m-td-cambi-val ${cTop} ${cBot} bl-thin br-thin">${escHtml(cValStr)}</td>
          <td colspan="2" class="m-td-cambi-val ${cTop} ${cBot} bl-thin br-thin">${escHtml(cEurStr)}</td>
          <td colspan="2" class="m-td-cambi-val ${cTop} ${cBot} bl-thin br-thin">${escHtml(cCommStr)}</td>
          <td colspan="2" class="m-td-cambi-rate ${cTop} ${cBot} bl-thin br-thin">${escHtml(cRateStr)}</td>
        `;
      }

      midRowsHtml.push(`<tr class="mod-r-mid">${tkHtml}<td></td>${rightHtml}</tr>`);
    }

    // Righe 36..68 (33 righe diarie)
    const diarieRowsHtml = [];
    for (let i = 0; i < 33; i++) {
      const d = page.diarie[i];
      const topCls = i === 0 ? 'bt-thin' : 'bt-hair';
      const botCls = i === 32 ? 'bb-thin' : 'bb-hair';

      const p1 = d ? formatMealCell(d.pranzo, 16) : { curr: '', amt: '', cop: '', note: '' };
      const p2 = d ? formatMealCell(d.cena, 12) : { curr: '', amt: '', cop: '', note: '' };
      const pe = d ? formatPernottoCell(d.pernotto) : { curr: '', amt: '', note: '', country: '' };
      const co = d ? formatColazioneCell(d.colazione) : { curr: '', amt: '', cop: '', note: '' };

      diarieRowsHtml.push(`
        <tr class="mod-r-diaria">
          <td colspan="2" class="m-diaria-dt ${topCls} ${botCls} bl-thin br-thin">${d ? escHtml(d.dateParts.dmmm) : ''}</td>

          <td class="m-diaria-curr ${topCls} ${botCls} bl-thin">${escHtml(p1.curr)}</td>
          <td colspan="2" class="m-diaria-imp ${topCls} ${botCls} br-hair">${escHtml(p1.amt)}</td>
          <td class="m-diaria-cop ${topCls} ${botCls}">${escHtml(p1.cop)}</td>
          <td colspan="2" class="m-diaria-note ${topCls} ${botCls} br-thin">${escHtml(p1.note)}</td>

          <td class="m-diaria-curr ${topCls} ${botCls} bl-thin">${escHtml(p2.curr)}</td>
          <td colspan="2" class="m-diaria-imp ${topCls} ${botCls} br-hair">${escHtml(p2.amt)}</td>
          <td class="m-diaria-cop ${topCls} ${botCls}">${escHtml(p2.cop)}</td>
          <td colspan="2" class="m-diaria-note ${topCls} ${botCls} br-thin">${escHtml(p2.note)}</td>

          <td class="m-diaria-curr ${topCls} ${botCls} bl-thin">${escHtml(pe.curr)}</td>
          <td colspan="2" class="m-diaria-imp ${topCls} ${botCls} br-hair">${escHtml(pe.amt)}</td>
          <td class="m-diaria-note ${topCls} ${botCls} bl-hair">${escHtml(pe.note)}</td>
          <td colspan="2" class="m-diaria-note ${topCls} ${botCls} br-thin">${escHtml(pe.country)}</td>

          <td class="m-diaria-curr ${topCls} ${botCls} bl-thin">${escHtml(co.curr)}</td>
          <td colspan="2" class="m-diaria-imp ${topCls} ${botCls} br-hair">${escHtml(co.amt)}</td>
          <td class="m-diaria-cop ${topCls} ${botCls}">${escHtml(co.cop)}</td>
          <td colspan="2" class="m-diaria-note ${topCls} ${botCls} br-thin">${escHtml(co.note)}</td>
        </tr>
      `);
    }

    const dataCompText = page.dataCompilazione
      ? `DATA DI COMPILAZIONE  ${page.dataCompilazione}`
      : 'DATA DI COMPILAZIONE …………………………………………………..';

    return `
      <div class="modulo-sheet" data-modulo="${page.foglioN}">
        <img class="mod-logo" src="${Defaults.RAI_LOGO_DATA_URI}" alt="RAI">
        <table class="mod-grid">
          <colgroup>${colgroup}</colgroup>
          <tbody>
            <!-- R1 -->
            <tr class="mod-r1">
              <td colspan="6"></td>
              <td colspan="13" class="m-title">DISTINTA DELLE SPESE DI TRASFERTA</td>
              <td colspan="4"></td>
              <td colspan="2" class="m-foglio-lbl">Foglio n.</td>
              <td class="m-foglio-val">${page.foglioN}</td>
            </tr>
            <!-- R2 -->
            <tr class="mod-r2"><td colspan="26"></td></tr>
            <!-- R3 -->
            <tr class="mod-r3">
              <td colspan="8" class="m-hdr-lbl">AUTORIZZAZIONE DI VIAGGIO N.</td>
              <td colspan="4" class="m-hdr-num">${escHtml(page.autorizzazione)}</td>
              <td colspan="6" class="m-hdr-nom">${escHtml(page.nominativo)}</td>
              <td colspan="4" class="m-hdr-lbl">MATRICOLA N.</td>
              <td colspan="4" class="m-hdr-matr">${escHtml(page.matricola)}</td>
            </tr>
            <!-- R4 -->
            <tr class="mod-r4"><td colspan="26"></td></tr>
            <!-- R5 -->
            <tr class="mod-r5">
              <td colspan="8" class="m-trasf-title">TRASFERTA &nbsp;N. 1</td>
              <td></td>
              <td colspan="8" class="m-trasf-title">TRASFERTA &nbsp;N. 2</td>
              <td></td>
              <td colspan="8" class="m-trasf-title">TRASFERTA &nbsp;N. 3</td>
            </tr>
            <!-- R6 -->
            <tr class="mod-r6">
              <td colspan="4" class="m-trasf-sub bb-thin bl-thin br-thin">INIZIO</td>
              <td colspan="4" class="m-trasf-sub bb-thin bl-thin br-thin">TERMINE</td>
              <td></td>
              <td colspan="4" class="m-trasf-sub bb-thin bl-thin br-thin">INIZIO</td>
              <td colspan="4" class="m-trasf-sub bb-thin bl-thin br-thin">TERMINE</td>
              <td></td>
              <td colspan="4" class="m-trasf-sub bb-thin bl-thin br-thin">INIZIO</td>
              <td colspan="4" class="m-trasf-sub bb-thin bl-thin br-thin">TERMINE</td>
            </tr>
            <!-- R7 -->
            <tr class="mod-r7">
              <td class="m-trasf-micro bt-thin bb-thin bl-thin br-thin">GIORNO</td>
              <td class="m-trasf-micro bt-thin bb-thin br-thin">MESE</td>
              <td class="m-trasf-micro bt-thin bb-thin bl-thin">ORE</td>
              <td class="m-trasf-micro bt-thin bb-thin br-thin">MINUTI</td>
              <td class="m-trasf-micro bt-thin bb-thin bl-thin">GIORNO</td>
              <td class="m-trasf-micro bt-thin bb-thin br-thin">MESE</td>
              <td class="m-trasf-micro bt-thin bb-thin bl-thin">ORE</td>
              <td class="m-trasf-micro bt-thin bb-thin br-thin">MINUTI</td>
              <td></td>
              <td class="m-trasf-micro bt-thin bb-thin bl-thin">GIORNO</td>
              <td class="m-trasf-micro bt-thin bb-thin">MESE</td>
              <td class="m-trasf-micro bt-thin bb-thin">ORE</td>
              <td class="m-trasf-micro bt-thin bb-thin br-thin">MINUTI</td>
              <td class="m-trasf-micro bt-thin bb-thin bl-thin">GIORNO</td>
              <td class="m-trasf-micro bt-thin bb-thin br-thin">MESE</td>
              <td class="m-trasf-micro bt-thin bb-thin bl-thin">ORE</td>
              <td class="m-trasf-micro bt-thin bb-thin br-thin">MINUTI</td>
              <td></td>
              <td class="m-trasf-micro bt-thin bb-thin bl-thin">GIORNO</td>
              <td class="m-trasf-micro bt-thin bb-thin br-thin">MESE</td>
              <td class="m-trasf-micro bt-thin bb-thin bl-thin">ORE</td>
              <td class="m-trasf-micro bt-thin bb-thin br-thin">MINUTI</td>
              <td class="m-trasf-micro bt-thin bb-thin bl-thin">GIORNO</td>
              <td class="m-trasf-micro bt-thin bb-thin br-thin">MESE</td>
              <td class="m-trasf-micro bt-thin bb-thin bl-thin">ORE</td>
              <td class="m-trasf-micro bt-thin bb-thin br-thin">MINUTI</td>
            </tr>
            <!-- R8 -->
            <tr class="mod-r8">
              ${renderTimeBlocks(t1)}
              <td></td>
              ${renderTimeBlocks(t2)}
              <td></td>
              ${renderTimeBlocks(t3)}
            </tr>
            <!-- R9 -->
            <tr class="mod-r9"><td colspan="26"></td></tr>
            <!-- R10 -->
            <tr class="mod-r10">
              <td colspan="15" class="m-sec-title bb-thin">DESTINAZIONE E SPESE TRASPORTO COME DA ALLEGATI DI VIAGGIO</td>
              <td></td>
              <td colspan="10" class="m-sec-title-7 bb-thin">SPESE VARIE DOCUMENTATE</td>
            </tr>
            <!-- R11 -->
            <tr class="mod-r11">
              <td class="m-th-6 bt-thin bl-thin br-thin">N.</td>
              <td colspan="5" rowspan="2" class="m-th-6 bt-thin bb-thin bl-thin br-thin">LOCALITA' &nbsp;DI DESTINAZIONE</td>
              <td colspan="2" class="m-th-5 bt-thin bl-thin br-thin">DATA DI ARRIVO</td>
              <td rowspan="2" class="m-th-5 bt-thin bb-thin bl-thin br-thin">MEZZO</td>
              <td colspan="6" class="m-th-6 bt-thin bb-thin bl-thin br-thin">IMPORTO BIGLIETTO DI VIAGGIO</td>
              <td></td>
              <td colspan="2" class="m-th-5 bt-thin bl-thin br-thin">DATA</td>
              <td colspan="5" rowspan="2" class="m-th-7 bt-thin bb-thin bl-thin br-thin">DESCRIZIONE DELLA SPESA</td>
              <td colspan="3" rowspan="2" class="m-th-7 bt-thin bb-thin br-thin">IMPORTO</td>
            </tr>
            <!-- R12 -->
            <tr class="mod-r12">
              <td class="m-th-5 bb-thin bl-thin br-thin">TRASF.</td>
              <td class="m-th-6 bb-thin bl-thin br-thin">G</td>
              <td class="m-th-6 bb-thin bl-thin br-thin">M</td>
              <td colspan="3" class="m-th-5 bb-thin bl-thin br-hair">PAGATI DIPENDENTE</td>
              <td colspan="3" class="m-th-5 bb-thin bl-thin br-thin">PAGATI RAI</td>
              <td></td>
              <td class="m-th-6 bb-thin bl-thin">G</td>
              <td class="m-th-6 bb-thin">M</td>
            </tr>

            ${midRowsHtml.join('')}

            <!-- R29 -->
            <tr class="mod-r29"><td colspan="26"></td></tr>
            <!-- R30-31 -->
            <tr class="mod-r30">
              <td colspan="4" class="m-annot-lbl">ANNOTAZIONI:</td>
              <td colspan="22" rowspan="2" class="m-annot-val">${escHtml(page.annotazioni)}</td>
            </tr>
            <tr class="mod-r31"><td colspan="4"></td></tr>
            <!-- R32 -->
            <tr class="mod-r32"><td colspan="26"></td></tr>
            <!-- R33 -->
            <tr class="mod-r33">
              <td colspan="26" class="m-diaria-hdr">DIARIE A PIE' DI LISTA COME DA ALLEGATE RICEVUTE FISCALI</td>
            </tr>
            <!-- R34 -->
            <tr class="mod-r34">
              <td colspan="2" class="m-th-7 bt-thin bb-thin bl-thin br-thin">DATA</td>
              <td colspan="6" class="m-th-8 bt-thin bb-thin bl-thin br-thin">1 &nbsp;PASTO</td>
              <td colspan="6" class="m-th-8 bt-thin bb-thin bl-thin br-thin">2 &nbsp;PASTO</td>
              <td colspan="6" class="m-th-8 bt-thin bb-thin bl-thin br-thin">PERNOTTAMENTO</td>
              <td colspan="6" class="m-th-8 bt-thin bb-thin bl-thin br-thin">COLAZIONE</td>
            </tr>
            <!-- R35 -->
            <tr class="mod-r35">
              <td class="m-th-7 bt-thin bb-thin bl-thin">G</td>
              <td class="m-th-7 bt-thin bb-thin bl-thin br-thin">M</td>
              <td colspan="3" class="m-th-8 bt-thin bb-thin bl-thin br-hair">IMPORTO</td>
              <td colspan="3" class="m-th-8 bt-thin bb-thin br-thin">NOTE</td>
              <td colspan="3" class="m-th-8 bt-thin bb-thin bl-thin br-hair">IMPORTO</td>
              <td colspan="3" class="m-th-8 bt-thin bb-thin br-thin">NOTE</td>
              <td colspan="3" class="m-th-8 bt-thin bb-thin bl-thin br-hair">IMPORTO</td>
              <td colspan="3" class="m-th-8 bt-thin bb-thin br-thin">NOTE</td>
              <td colspan="3" class="m-th-8 bt-thin bb-thin bl-thin br-hair">IMPORTO</td>
              <td colspan="3" class="m-th-8 bt-thin bb-thin br-thin">NOTE</td>
            </tr>

            ${diarieRowsHtml.join('')}

            <!-- R69 -->
            <tr class="mod-r69"><td colspan="26"></td></tr>
            <!-- R70 -->
            <tr class="mod-r70">
              <td></td>
              <td colspan="11" class="m-footer-l">${escHtml(dataCompText)}</td>
              <td colspan="5" class="m-footer-c">MOD.31426-</td>
              <td colspan="9" class="m-footer-r">FIRMA ………..……………………………………….</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  let selectedFilter = 'all';

  function renderModuloPrint(container, state) {
    const pages = state.calc.moduloPages || [];
    if (selectedFilter !== 'all' && Number(selectedFilter) > pages.length) {
      selectedFilter = 'all';
    }
    const visiblePages =
      selectedFilter === 'all'
        ? pages
        : pages.filter((p) => String(p.foglioN) === String(selectedFilter));

    const filterBtns = [
      `<button type="button" class="btn btn-sm ${selectedFilter === 'all' ? 'btn-primary' : 'btn-ghost'}" data-mod-filter="all">Tutti i fogli (${pages.length})</button>`,
    ];
    pages.forEach((p) => {
      filterBtns.push(
        `<button type="button" class="btn btn-sm ${String(selectedFilter) === String(p.foglioN) ? 'btn-primary' : 'btn-ghost'}" data-mod-filter="${p.foglioN}">Modulo ${p.foglioN}</button>`
      );
    });

    container.innerHTML = `
      <div class="print-toolbar no-print">
        <div>
          <strong style="color:var(--rai-blue); font-size:15px;">Anteprima di Stampa Ufficiale · MOD.31426-</strong>
          <div class="card-subtitle">Imposta la stampante su <strong>A4 Verticale</strong> · Margini predefiniti o minimi · Sfondo/grafica attivi</div>
        </div>
        <div class="toolbar-inline">
          ${filterBtns.join('')}
          <button type="button" id="btn-print-modulo-now" class="btn btn-primary">
            Stampa / Salva PDF
          </button>
        </div>
      </div>

      <div class="print-preview-stage">
        ${visiblePages.map(renderSingleModuloSheet).join('')}
      </div>
    `;

    container.querySelectorAll('[data-mod-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedFilter = btn.dataset.modFilter;
        renderModuloPrint(container, state);
      });
    });

    const btnPrint = container.querySelector('#btn-print-modulo-now');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        document.body.classList.add('printing-modulo');
        setTimeout(() => {
          window.print();
          document.body.classList.remove('printing-modulo');
        }, 50);
      });
    }
  }

  root.TrasferteUIModuloPrint = { renderModuloPrint };
})(typeof window !== 'undefined' ? window : globalThis);
