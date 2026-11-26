/**
 * Vista 2: Nota Spese (riepilogo completo e controllo massimali pasti Italia).
 */
(function (root) {
  'use strict';

  const Defaults = root.TrasferteDefaults;
  const Calc = root.TrasferteCalc;

  function fmt(v) {
    return `€ ${Calc.formatItCurrency(v)}`;
  }

  function escHtml(val) {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtWithExtras(v, unconvertedMap) {
    const extras = Calc.formatCurrencyExtras(unconvertedMap);
    if (!extras) return fmt(v);
    return `${fmt(v)}<div class="nota-sub-valuta" title="Importo in valuta locale (cambio a cura Uff. Trasferte)">+ ${escHtml(extras)}</div>`;
  }

  function renderNotaSpese(container, state) {
    const { calc, settings } = state;
    const ns = calc.notaSpese;
    const ctrl = ns.controlloPastiItalia;
    const mmCities = (settings && settings.italyMmCities) || Defaults.ITALY_MM_CITIES;
    const diffOk = ctrl.differenzaIt >= -0.001;
    const totalExtras = Calc.formatCurrencyExtras(ns.totaleUnconverted);
    const bigliettiExtras = Calc.formatCurrencyExtras(ns.bigliettiUnconverted);
    const speseVarieExtras = Calc.formatCurrencyExtras(ns.speseVarieUnconverted);
    const infoBannerHtml = totalExtras
      ? `<div class="info-banner-valuta"><strong>Importi in valuta locale (cambio a cura dell'Ufficio Trasferte):</strong> ${escHtml(totalExtras)}. Non vengono convertiti né sommati nei totali in Euro; su Modulo 1 sono riportati nell'importo reale pagato in valuta.</div>`
      : '';

    container.innerHTML = `
      <div class="nota-grid">
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Nota Spese — Riepilogo Rimborsi</h2>
              <div class="card-subtitle">Calcolo in tempo reale equivalente al foglio "Nota Spese"</div>
            </div>
            <button type="button" id="btn-goto-modulo" class="btn btn-sm btn-primary">Vai al Modulo 1 / Stampa →</button>
          </div>
          <div class="card-body">
            ${infoBannerHtml}
            <div class="table-wrap">
              <table class="data-table nota-table">
                <thead>
                  <tr>
                    <th rowspan="2" style="text-align:left;">Voce</th>
                    <th colspan="2">Complessivo</th>
                    <th colspan="2">Piè di Lista</th>
                    <th colspan="2">Forfait</th>
                  </tr>
                  <tr>
                    <th>Q.tà</th>
                    <th>Importo</th>
                    <th>Q.tà</th>
                    <th>Importo</th>
                    <th>Q.tà</th>
                    <th>Importo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>COLAZIONI</strong></td>
                    <td class="num" style="text-align:center;">${ns.colazioni.countTot}</td>
                    <td class="num" style="text-align:right;">${fmtWithExtras(ns.colazioni.impTot, ns.colazioni.unconverted)}</td>
                    <td class="num" style="text-align:center;">${ns.colazioni.countPdl}</td>
                    <td class="num" style="text-align:right;">${fmtWithExtras(ns.colazioni.impPdl, ns.colazioni.unconverted)}</td>
                    <td class="num" style="text-align:center;">${ns.colazioni.countForf}</td>
                    <td class="num" style="text-align:right;">${fmt(ns.colazioni.impForf)}</td>
                  </tr>
                  <tr>
                    <td><strong>PASTI</strong></td>
                    <td class="num" style="text-align:center;">${ns.pasti.countTot}</td>
                    <td class="num" style="text-align:right;">${fmtWithExtras(ns.pasti.impTot, ns.pasti.unconverted)}</td>
                    <td class="num" style="text-align:center;">${ns.pasti.countPdl}</td>
                    <td class="num" style="text-align:right;">${fmtWithExtras(ns.pasti.impPdl, ns.pasti.unconverted)}</td>
                    <td class="num" style="text-align:center;">${ns.pasti.countForf}</td>
                    <td class="num" style="text-align:right;">${fmt(ns.pasti.impForf)}</td>
                  </tr>
                  <tr>
                    <td><strong>PERNOTTAMENTI</strong></td>
                    <td class="num" style="text-align:center;">${ns.pernottamenti.countTot}</td>
                    <td class="num" style="text-align:right;">${fmtWithExtras(ns.pernottamenti.impTot, ns.pernottamenti.unconverted)}</td>
                    <td class="num" style="text-align:center;">${ns.pernottamenti.countPdl}</td>
                    <td class="num" style="text-align:right;">${fmtWithExtras(ns.pernottamenti.impPdl, ns.pernottamenti.unconverted)}</td>
                    <td class="num" style="text-align:center;">${ns.pernottamenti.countForf}</td>
                    <td class="num" style="text-align:right;">${fmt(ns.pernottamenti.impForf)}</td>
                  </tr>
                  <tr>
                    <td><strong>PICCOLE SPESE</strong></td>
                    <td class="num" style="text-align:center;">${ns.piccoleSpese.countTot}</td>
                    <td class="num" style="text-align:right;">${fmt(ns.piccoleSpese.impTot)}</td>
                    <td class="num" style="text-align:center;">—</td>
                    <td class="num" style="text-align:right;">—</td>
                    <td class="num" style="text-align:center;">${ns.piccoleSpese.countForf}</td>
                    <td class="num" style="text-align:right;">${fmt(ns.piccoleSpese.impForf)}</td>
                  </tr>
                  <tr>
                    <td><strong>INDENNITÀ TRASFERTA</strong></td>
                    <td class="num" style="text-align:center;">${ns.indennitaTrasferta.countTot}</td>
                    <td class="num" style="text-align:right;">${fmt(ns.indennitaTrasferta.impTot)}</td>
                    <td class="num" style="text-align:center;">—</td>
                    <td class="num" style="text-align:right;">—</td>
                    <td class="num" style="text-align:center;">${ns.indennitaTrasferta.countForf}</td>
                    <td class="num" style="text-align:right;">${fmt(ns.indennitaTrasferta.impForf)}</td>
                  </tr>
                  <tr class="total-row">
                    <td>TOTALI DIARIE</td>
                    <td></td>
                    <td class="num" style="text-align:right;">${fmtWithExtras(ns.totaliDiarie.impTot, ns.totaliDiarie.unconverted)}</td>
                    <td></td>
                    <td class="num" style="text-align:right;">${fmtWithExtras(ns.totaliDiarie.impPdl, ns.totaliDiarie.unconverted)}</td>
                    <td></td>
                    <td class="num" style="text-align:right;">${fmt(ns.totaliDiarie.impForf)}</td>
                  </tr>
                  <tr>
                    <td><strong>SPESE VIAGGIO DOCUMENTATE</strong> <span class="card-subtitle">(Biglietti dip. + Spese varie)</span></td>
                    <td></td>
                    <td class="num" style="text-align:right;"><strong>${fmtWithExtras(ns.speseViaggioDoc, ns.speseViaggioUnconverted)}</strong></td>
                    <td colspan="4" class="card-subtitle">Biglietti: ${fmt(ns.bigliettiDipEur)}${bigliettiExtras ? ` + ${escHtml(bigliettiExtras)}` : ''} · Spese Varie: ${fmt(ns.speseVarieEur)}${speseVarieExtras ? ` + ${escHtml(speseVarieExtras)}` : ''}</td>
                  </tr>
                  <tr>
                    <td><strong>ALTRE SPESE</strong> <span class="card-subtitle">(Commissioni cambi valuta)</span></td>
                    <td></td>
                    <td class="num" style="text-align:right;"><strong>${fmtWithExtras(ns.altreSpese, ns.altreSpeseUnconverted)}</strong></td>
                    <td colspan="4"></td>
                  </tr>
                  <tr class="grand-total">
                    <td>TOTALE TRASFERTA</td>
                    <td></td>
                    <td class="num" style="text-align:right;">${fmtWithExtras(ns.totaleTrasferta, ns.totaleUnconverted)}</td>
                    <td colspan="4"></td>
                  </tr>
                  <tr>
                    <td><strong>SPESE PER CONTO RAI</strong> <span class="card-subtitle">(Biglietti pagati direttamente da RAI)</span></td>
                    <td></td>
                    <td class="num" style="text-align:right; color:var(--text-muted);">${fmt(ns.spesePerContoRai)}</td>
                    <td colspan="4" class="card-subtitle">Non sommato al rimborso dipendente</td>
                  </tr>
                  <tr>
                    <td><strong>ANTICIPI</strong></td>
                    <td></td>
                    <td class="num" style="text-align:right;">- ${fmt(ns.anticipi)}</td>
                    <td colspan="4"></td>
                  </tr>
                  <tr class="net-row">
                    <td>RESIDUO NETTO A PAGARE</td>
                    <td></td>
                    <td class="num" style="text-align:right;">${fmtWithExtras(ns.residuoNetto, ns.totaleUnconverted)}</td>
                    <td colspan="4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Verifica Massimali Pasti (Italia &amp; Totale)</h2>
              <div class="card-subtitle">Controllo cumulativo del massimale pasti Italia</div>
            </div>
            <span class="badge ${diffOk ? 'badge-green' : 'badge-red'}">
              ${diffOk ? 'Entro il massimale' : 'Eccedenza oltre massimale'}
            </span>
          </div>
          <div class="card-body">
            <div class="table-wrap">
              <table class="data-table nota-table">
                <tbody>
                  <tr>
                    <td><strong>Pasti spettanti (per orari trasferta)</strong></td>
                    <td class="num" style="text-align:right; font-weight:700;">${ctrl.pastiSpettanti}</td>
                  </tr>
                  <tr>
                    <td>Num. pasti Italia ordinari (NO MM)</td>
                    <td class="num" style="text-align:right;">${ctrl.countNoMM}</td>
                  </tr>
                  <tr>
                    <td>Num. pasti Italia maggiorati (MM / FMM)</td>
                    <td class="num" style="text-align:right;">${ctrl.countMM}</td>
                  </tr>
                  <tr>
                    <td><strong>Massimale spettante Italia</strong></td>
                    <td class="num" style="text-align:right; font-weight:700;">${fmt(ctrl.spettanteIt)}</td>
                  </tr>
                  <tr>
                    <td>Spesa Italia (PDL + Forfait)</td>
                    <td class="num" style="text-align:right;">${fmt(ctrl.spesoIt)}</td>
                  </tr>
                  <tr class="${diffOk ? 'total-row' : ''}">
                    <td><strong>Differenza residua Italia</strong></td>
                    <td class="num" style="text-align:right; font-weight:700; color:${diffOk ? 'var(--emerald)' : 'var(--danger)'};">
                      ${fmt(ctrl.differenzaIt)}
                    </td>
                  </tr>
                  <tr>
                    <td>Spesa effettiva pasti (Italia + Estero)</td>
                    <td class="num" style="text-align:right;">${fmt(ctrl.spesaEffettivaTot)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mm-cities-box">
              <strong>Città con massimale pasti maggiorato (MM / FMM):</strong><br>
              ${mmCities.join(' – ')}
            </div>
          </div>
        </div>
      </div>
    `;

    const btnGo = container.querySelector('#btn-goto-modulo');
    if (btnGo) {
      btnGo.addEventListener('click', () => {
        const modTab = document.querySelector('.nav-tab[data-tab="modulo"]');
        if (modTab) modTab.click();
      });
    }
  }

  root.TrasferteUINotaSpese = { renderNotaSpese };
})(typeof window !== 'undefined' ? window : globalThis);
