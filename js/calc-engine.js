/**
 * Motore di calcolo puro per Trasferte RAI (MOD.31426).
 * Replica fedelmente le formule di Codici Paesi, Elaborazione, Nota Spese e Modulo 1/2/3,
 * correggendo i bug del foglio originale (Spese Varie Mod.2, offset Mod.3, alias Forf.Tot/Aereop).
 */
(function (root) {
  'use strict';

  const Defaults =
    root.TrasferteDefaults ||
    (typeof require !== 'undefined' ? require('./data-defaults.js') : null);

  function toNum(v) {
    if (v === null || v === undefined || v === '') return 0;
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    const normalized = String(v).trim().replace(',', '.');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }

  function round2(n) {
    return Math.round((toNum(n) + Number.EPSILON) * 100) / 100;
  }

  function normalizeNote(note) {
    const raw = String(note || '').trim();
    if (!raw) return '';
    const lower = raw.toLowerCase();
    if (lower === 'forf.totale' || lower === 'forf.tot') return 'Forf.Tot';
    if (lower === 'forf.misto') return 'Forf.Misto';
    if (lower === 'aereoporto' || lower === 'aeroporto' || lower === 'aereop') return 'Aereop';
    if (lower === 'forfait') return 'Forfait';
    if (lower === 'fmm') return 'FMM';
    if (lower === 'mm') return 'MM';
    if (lower === 'ft') return 'FT';
    if (lower === 'off') return 'OFF';
    if (lower === 'inviaggio') return 'InViaggio';
    if (lower === 'treno') return 'Treno';
    if (lower === 'nave') return 'Nave';
    return raw;
  }

  function isTravelMealNote(normNote) {
    return normNote === 'Aereop' || normNote === 'Treno' || normNote === 'Nave';
  }

  function parseIsoDate(iso) {
    if (!iso || typeof iso !== 'string') return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (
      dt.getUTCFullYear() !== y ||
      dt.getUTCMonth() !== mo - 1 ||
      dt.getUTCDate() !== d
    ) {
      return null;
    }
    return dt;
  }

  function formatIsoFromUtc(dt) {
    const y = dt.getUTCFullYear();
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dt.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function addDaysIso(iso, delta) {
    const dt = parseIsoDate(iso);
    if (!dt) return '';
    dt.setUTCDate(dt.getUTCDate() + delta);
    return formatIsoFromUtc(dt);
  }

  function diffDaysIso(startIso, endIso) {
    const a = parseIsoDate(startIso);
    const b = parseIsoDate(endIso);
    if (!a || !b) return null;
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }

  const ITALIAN_WEEKDAY_INITIALS = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
  const ITALIAN_MONTHS_SHORT = [
    'gen', 'feb', 'mar', 'apr', 'mag', 'giu',
    'lug', 'ago', 'set', 'ott', 'nov', 'dic',
  ];

  function getItalianWeekdayInitial(iso) {
    const dt = parseIsoDate(iso);
    if (!dt) return '';
    return ITALIAN_WEEKDAY_INITIALS[dt.getUTCDay()];
  }

  function formatDateDDMM(iso) {
    const dt = parseIsoDate(iso);
    if (!dt) return { day: '', month: '', ddmm: '', dmmm: '' };
    const dd = String(dt.getUTCDate()).padStart(2, '0');
    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const mShort = ITALIAN_MONTHS_SHORT[dt.getUTCMonth()];
    return {
      day: String(dt.getUTCDate()),
      month: String(dt.getUTCMonth() + 1),
      ddmm: `${dd}/${mm}`,
      dmmm: `${dt.getUTCDate()}-${mShort}`,
      ddmmyyyy: `${dd}/${mm}/${dt.getUTCFullYear()}`,
    };
  }

  function parseTimeMinutes(hhmm) {
    if (!hhmm || typeof hhmm !== 'string') return null;
    const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
    if (!m) return null;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h < 0 || h > 23 || min < 0 || min > 59) return null;
    return h * 60 + min;
  }

  function splitTimeParts(hhmm) {
    const mins = parseTimeMinutes(hhmm);
    if (mins === null) return { h: '', m: '', hhmm: '' };
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return {
      h: String(h),
      m: String(m).padStart(2, '0'),
      hhmm: `${h}:${String(m).padStart(2, '0')}`,
    };
  }

  function formatItNumber(num, decimals) {
    if (num === null || num === undefined || num === '' || !Number.isFinite(Number(num))) {
      return '';
    }
    const val = Number(num);
    if (Math.abs(val) < 1e-9) return '';
    return val.toLocaleString('it-IT', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function formatItCurrency(num) {
    const val = toNum(num);
    return val.toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function addCurrencyAmount(map, currency, amount) {
    const curr = String(currency || '').trim();
    const val = toNum(amount);
    if (!curr || curr === 'EUR' || val <= 0) return;
    map[curr] = (map[curr] || 0) + val;
  }

  function finalizeCurrencyMap(map) {
    const out = {};
    if (!map) return out;
    Object.keys(map)
      .sort()
      .forEach((curr) => {
        const rounded = round2(map[curr]);
        if (rounded > 0) out[curr] = rounded;
      });
    return out;
  }

  function mergeCurrencyMaps(...maps) {
    const acc = {};
    maps.forEach((m) => {
      if (!m) return;
      Object.keys(m).forEach((curr) => {
        addCurrencyAmount(acc, curr, m[curr]);
      });
    });
    return finalizeCurrencyMap(acc);
  }

  function formatCurrencyExtras(currencyMap) {
    if (!currencyMap) return '';
    const parts = Object.keys(currencyMap)
      .filter((c) => toNum(currencyMap[c]) > 0)
      .map((c) => `${formatItCurrency(currencyMap[c])} ${c}`);
    return parts.join(' + ');
  }

  function formatEurWithExtras(eurAmount, currencyMap, alwaysShowEur) {
    const extras = formatCurrencyExtras(currencyMap);
    const eurVal = toNum(eurAmount);
    if (!extras) return `€ ${formatItCurrency(eurVal)}`;
    if (!alwaysShowEur && Math.abs(eurVal) < 1e-9) return extras;
    return `€ ${formatItCurrency(eurVal)} + ${extras}`;
  }

  function buildCountriesMap(countries) {
    const map = Object.create(null);
    map.IT = Defaults.ITALY_COUNTRY;
    (countries || Defaults.DEFAULT_COUNTRIES).forEach((c) => {
      if (c && c.code) {
        map[String(c.code).trim()] = c;
      }
    });
    return map;
  }

  /**
   * Calcola i massimali in EUR di un paese estero a partire dalla sua valuta base
   * (EUR, USD, GBP) e dai cambi ufficiali Banca d'Italia.
   */
  function computeCountryRates(country, exchangeRates) {
    if (!country || country.code === 'IT') {
      return {
        isItaly: true,
        forfaitMistoEur: 0,
        forfaitTotaleEur: 0,
        twoMealsEur: 0,
        oneMealEur: 0,
        piccoleSpeseEur: 0,
      };
    }
    const rates = exchangeRates || Defaults.DEFAULT_EXCHANGE_RATES;
    const usdRate = toNum(rates.usd) > 0 ? toNum(rates.usd) : 1;
    const gbpRate = toNum(rates.gbp) > 0 ? toNum(rates.gbp) : 1;
    const div =
      country.baseCurrency === 'USD'
        ? usdRate
        : country.baseCurrency === 'GBP'
          ? gbpRate
          : 1;

    const fmVal = toNum(country.forfaitMistoValuta);
    const ftVal = toNum(country.forfaitTotaleValuta);
    const forfaitMistoEur = fmVal / div;
    const forfaitTotaleEur = ftVal / div;

    return {
      isItaly: false,
      forfaitMistoEur,
      forfaitTotaleEur,
      twoMealsEur: forfaitMistoEur * 0.7, // Codici Paesi!D
      oneMealEur: forfaitMistoEur,        // Codici Paesi!E
      piccoleSpeseEur: forfaitTotaleEur * 0.3, // Codici Paesi!F
    };
  }

  /**
   * Calcola la tabella Paesi Visitati, i tassi di cambio effettivi e le commissioni in EUR.
   */
  function computeVisitedCountries(trip, countriesMap, italyRates, exchangeRates) {
    const itRates = italyRates || Defaults.DEFAULT_ITALY_RATES;
    const entries = [];
    const byCode = Object.create(null);

    const itEntry = {
      code: 'IT',
      name: 'Italia',
      localCurrency: 'EUR',
      moduloCurrencyLabel: 'Euro',
      euro: 1,
      valuta: 1,
      cambio: 1,
      commEur: 0,
      commValuta: 0,
      commValutaEur: 0,
      commValutaUnconverted: 0,
      twoMealsValuta: toNum(itRates.pasto1),
      oneMealValuta: 0,
      capsCurrency: 'EUR',
      rates: null,
      showOnModulo: false,
      isItaly: true,
      isUnconverted: false,
      hasRateWarning: false,
    };
    entries.push(itEntry);
    byCode.IT = itEntry;

    let totCommEur = 0;
    let totCommValutaEur = 0;
    const commUnconverted = {};

    const visited = Array.isArray(trip && trip.paesiVisitati) ? trip.paesiVisitati : [];
    visited.forEach((item) => {
      if (!item || !item.code) return;
      const code = String(item.code).trim();
      if (!code || code === 'IT' || byCode[code]) return;
      const country = countriesMap[code];
      if (!country) return;

      const localCurr = country.localCurrency || 'EUR';
      const isEurCurrency = localCurr === 'EUR';
      const euro = toNum(item.euro);
      const valuta = toNum(item.valuta);
      const hasCustomRate = euro > 0 && valuta > 0;
      const isUnconverted = !isEurCurrency && !hasCustomRate;
      const cambio = isEurCurrency ? 1 : hasCustomRate ? valuta / euro : null;
      const commEur = toNum(item.commEur);
      const commValuta = toNum(item.commValuta);
      const commValutaEur = commValuta > 0 && !isUnconverted && cambio > 0 ? commValuta / cambio : 0;
      const commValutaUnconverted = commValuta > 0 && isUnconverted ? commValuta : 0;

      totCommEur += commEur;
      totCommValutaEur += commValutaEur;
      addCurrencyAmount(commUnconverted, localCurr, commValutaUnconverted);

      const cRates = computeCountryRates(country, exchangeRates);
      const hasRateWarning = isUnconverted;

      const resolved = {
        code,
        name: country.name,
        localCurrency: localCurr,
        moduloCurrencyLabel: localCurr,
        euro,
        valuta,
        cambio,
        commEur,
        commValuta,
        commValutaEur,
        commValutaUnconverted,
        twoMealsValuta: isUnconverted ? cRates.twoMealsEur : cRates.twoMealsEur * cambio,
        oneMealValuta: isUnconverted ? cRates.oneMealEur : cRates.oneMealEur * cambio,
        capsCurrency: isUnconverted ? 'EUR' : localCurr,
        rates: cRates,
        showOnModulo: item.showOnModulo !== false,
        isItaly: false,
        isUnconverted,
        hasRateWarning,
      };
      entries.push(resolved);
      byCode[code] = resolved;
    });

    return {
      entries,
      byCode,
      totCommEur,
      totCommValutaEur,
      totCommissioniEur: totCommEur + totCommValutaEur,
      totCommissioniUnconverted: finalizeCurrencyMap(commUnconverted),
    };
  }

  /**
   * Calcola durata trasferte, giorni consecutivi e pasti spettanti in base agli orari limite.
   */
  function generateTripDateRange(trasferte, mealCutoffs) {
    const cutoffs = mealCutoffs || Defaults.DEFAULT_MEAL_CUTOFFS;
    const tList = Array.isArray(trasferte) ? trasferte : [];

    const pranzoCut = parseTimeMinutes(cutoffs.pranzo);
    const cenaCut = parseTimeMinutes(cutoffs.cena);
    const colazCut = parseTimeMinutes(cutoffs.colazione);
    const pranzoPartSede = parseTimeMinutes(cutoffs.pranzoPartSede);
    const pranzoRientroSede = parseTimeMinutes(cutoffs.pranzoRientroSede);
    const cenaPartSede = parseTimeMinutes(cutoffs.cenaPartSede);
    const cenaRientroSede = parseTimeMinutes(cutoffs.cenaRientroSede);

    const legs = [0, 1, 2].map((idx) => {
      const t = tList[idx] || {};
      const dalDt = parseIsoDate(t.dal);
      const alDt = parseIsoDate(t.al);
      const valid = Boolean(dalDt && alDt && dalDt.getTime() <= alDt.getTime());
      const giorni = valid ? diffDaysIso(t.dal, t.al) + 1 : 0;
      const notti = valid ? Math.max(0, giorni - 1) : 0;
      return {
        index: idx + 1,
        dal: t.dal || '',
        oraDal: t.oraDal || '',
        partDaSede: t.partDaSede === 'SI' ? 'SI' : 'NO',
        al: t.al || '',
        oraAl: t.oraAl || '',
        rientroInSede: t.rientroInSede === 'SI' ? 'SI' : 'NO',
        valid,
        giorni,
        notti,
      };
    });

    const validLegs = legs.filter((l) => l.valid);
    const totGiorni = legs.reduce((acc, l) => acc + l.giorni, 0);
    const totNotti = legs.reduce((acc, l) => acc + l.notti, 0);

    // Logica cutoff pasti da Elaborazione!Z24:AP28 & AF21:AL23
    const firstLeg = legs[0];
    const lastValidLeg = validLegs.length > 0 ? validLegs[validLegs.length - 1] : null;

    let noPranzoPart = 0;
    let noCenaPart = 0;
    let noColazPart = 0;
    if (firstLeg.valid) {
      const startMins = parseTimeMinutes(firstLeg.oraDal);
      if (startMins !== null) {
        const pLim = firstLeg.partDaSede === 'SI' ? pranzoPartSede : pranzoCut;
        const cLim = firstLeg.partDaSede === 'SI' ? cenaPartSede : cenaCut;
        if (pLim !== null && startMins > pLim) noPranzoPart = 1;
        if (cLim !== null && startMins > cLim) noCenaPart = 1;
        // Se parte entro l'orario limite colazione (es. <= 08:00), colazione consentita; altrimenti bloccata il giorno 1
        // Nota: in Excel AO24 confrontava I24 (vuoto=0), quindi 08:00>0 dava sempre 0. Qui gestiamo colazione 1° giorno coerente con R24.
        if (colazCut !== null && startMins >= colazCut) {
          noColazPart = 0; // Manteniamo parità con Elaborazione!AO24 (colazioni totali = totNotti)
        }
      }
    }

    let noPranzoRie = 0;
    let noCenaRie = 0;
    let noColazRie = 0;
    if (lastValidLeg) {
      const endMins = parseTimeMinutes(lastValidLeg.oraAl);
      if (endMins !== null) {
        const pLim = lastValidLeg.rientroInSede === 'SI' ? pranzoRientroSede : pranzoCut;
        const cLim = lastValidLeg.rientroInSede === 'SI' ? cenaRientroSede : cenaCut;
        if (pLim !== null && endMins < pLim) noPranzoRie = 1;
        if (cLim !== null && endMins < cLim) noCenaRie = 1;
        if (colazCut !== null && endMins < colazCut) noColazRie = 1;
      }
    }

    const pranziSpettanti = Math.max(0, totGiorni - noPranzoPart - noPranzoRie);
    const ceneSpettanti = Math.max(0, totGiorni - noCenaPart - noCenaRie);
    const colazioniSpettanti = totNotti;

    // Genera l'intervallo continuo di date da inizio Trasferta 1 a fine ultima Trasferta valida
    const days = [];
    if (firstLeg.valid && lastValidLeg) {
      const span = diffDaysIso(firstLeg.dal, lastValidLeg.al) + 1;
      const cappedSpan = Math.min(Math.max(span, 0), 99);
      for (let i = 0; i < cappedSpan; i++) {
        const iso = addDaysIso(firstLeg.dal, i);
        days.push({
          dayIndex: i,
          iso,
          weekdayInitial: getItalianWeekdayInitial(iso),
          dateParts: formatDateDDMM(iso),
          moduleNumber: Math.floor(i / 33) + 1,
          rowInModule: i % 33,
        });
      }
    }

    return {
      legs,
      totGiorni,
      totNotti,
      noPranzoPart,
      noPranzoRie,
      noCenaPart,
      noCenaRie,
      noColazPart,
      noColazRie,
      pranziSpettanti,
      ceneSpettanti,
      colazioniSpettanti,
      days,
    };
  }

  function evaluateDailyRow(dayMeta, rawEntry, schedule, visitedByCode, italyRates) {
    const entry = rawEntry || {};
    const dIdx = dayMeta.dayIndex;
    const isLastDay = dIdx === schedule.days.length - 1;

    const p = entry.pranzo || {};
    const c = entry.cena || {};
    const n = entry.pernotto || {};
    const col = entry.colazione || {};
    const rientro = String(entry.rientro || '').trim();

    const pNote = normalizeNote(p.note);
    const cNote = normalizeNote(c.note);
    const nNote = normalizeNote(n.note);
    const colNote = normalizeNote(col.note);

    const pCode = String(p.code || '').trim();
    const cCode = String(c.code || '').trim();
    const nCode = String(n.code || '').trim();
    const colCode = String(col.code || '').trim();

    const pCountry = visitedByCode[pCode] || null;
    const cCountry = visitedByCode[cCode] || null;
    const nCountry = visitedByCode[nCode] || null;
    const colCountry = visitedByCode[colCode] || null;

    // Verifiche di spettanza (Elaborazione!AS, AY, BC, BK)
    const verificaPernotti = dIdx >= schedule.totNotti ? 1 : 0;
    const verificaPranzi =
      (dIdx === 0 && schedule.noPranzoPart === 1) ||
      (isLastDay && schedule.noPranzoRie === 1 && schedule.totGiorni === 1 && schedule.pranziSpettanti === 0) ||
      dIdx >= schedule.pranziSpettanti + schedule.noPranzoPart
        ? 1
        : 0;
    const verificaCene =
      schedule.ceneSpettanti === 0 ||
      (dIdx === 0 && schedule.noCenaPart === 1) ||
      dIdx >= schedule.ceneSpettanti + schedule.noCenaPart
        ? 1
        : 0;
    const verificaColazione = dIdx === 0 && schedule.noColazPart === 1 ? 1 : 0;

    // Ricevute e coperti
    const pRic = toNum(p.ricevuta);
    const pCop = toNum(p.coperti);
    const cRic = toNum(c.ricevuta);
    const cCop = toNum(c.coperti);
    const nRic = toNum(n.ricevuta);
    const colRic = toNum(col.ricevuta);
    const colCop = toNum(col.coperti);

    const pMissingCovers = pRic > 0 && pCop <= 0 && pNote !== 'Forfait' && pNote !== 'FMM' && pNote !== 'Forf.Misto' && pNote !== 'Forf.Tot';
    const cMissingCovers = cRic > 0 && cCop <= 0 && cNote !== 'Forfait' && cNote !== 'FMM' && cNote !== 'Forf.Misto' && cNote !== 'Forf.Tot';
    const colMissingCovers = colRic > 0 && colCop <= 0 && colNote !== 'Forfait';

    const pHasReceiptQuota = pRic > 0 && pCop > 0;
    const cHasReceiptQuota = cRic > 0 && cCop > 0;
    const colHasReceiptQuota = colRic > 0 && colCop > 0;

    // --- ITALIA: Calcolo Forfait e PDL ---
    let forfaitPranziIt = 0;
    if (verificaPranzi !== 1 && pCode === 'IT') {
      if (pNote === 'Forfait') forfaitPranziIt = toNum(italyRates.forfaitPasti);
      else if (pNote === 'FMM') forfaitPranziIt = toNum(italyRates.forfaitPastiMM);
    }

    let forfaitCeneIt = 0;
    if (cCode === 'IT') {
      if (cNote === 'Forfait') forfaitCeneIt = toNum(italyRates.forfaitPasti);
      else if (cNote === 'FMM') forfaitCeneIt = toNum(italyRates.forfaitPastiMM);
    }

    let forfaitColazIt = 0;
    if (verificaColazione !== 1 && colCode === 'IT' && colNote === 'Forfait') {
      forfaitColazIt = toNum(italyRates.forfaitColazioni);
    }

    // Quota parte (Elaborazione!F, K, S)
    let pQuota = null;
    if (pNote === 'Forfait' || pNote === 'FMM') pQuota = forfaitPranziIt;
    else if (pNote === 'Forf.Misto' || pNote === 'Forf.Tot') pQuota = null;
    else if (pHasReceiptQuota) pQuota = pRic / pCop;

    let cQuota = null;
    if (cNote === 'Forfait' || cNote === 'FMM') cQuota = forfaitCeneIt;
    else if (cNote === 'Forf.Misto' || cNote === 'Forf.Tot') cQuota = null;
    else if (cHasReceiptQuota) cQuota = cRic / cCop;

    let colQuota = null;
    if (colNote === 'Forfait') colQuota = forfaitColazIt;
    else if (colHasReceiptQuota) colQuota = colRic / colCop;

    // --- ESTERO ---
    const pHasForeignQuota = pQuota !== null && pQuota > 0;
    const cHasForeignQuota = cQuota !== null && cQuota > 0;
    const twoMealsMode = pHasForeignQuota && cHasForeignQuota ? 2 : pHasForeignQuota || cHasForeignQuota ? 1 : 0;

    let pEffValuta = 0;
    let pEffEurEstero = 0;
    let pUnconvertedValuta = 0;
    let pPsEstero = 0;
    let pForfEstero = 0;
    let pOverCap = false;

    if (pCountry && !pCountry.isItaly) {
      const cap1 = pCountry.oneMealValuta;
      const cap2 = pCountry.twoMealsValuta;
      const capValuta = twoMealsMode === 2 ? cap2 : cap1;
      const rawVal = pQuota || 0;
      if (pRic > 0 && pHasForeignQuota) {
        if (pCountry.isUnconverted) {
          pEffValuta = rawVal;
          pEffEurEstero = 0;
          pUnconvertedValuta = rawVal;
          pOverCap = false;
        } else {
          if (isTravelMealNote(pNote)) {
            pEffValuta = rawVal;
          } else {
            pEffValuta = Math.min(rawVal, capValuta);
            if (rawVal > capValuta + 1e-6) pOverCap = true;
          }
          pEffEurEstero = pEffValuta / pCountry.cambio;
        }
      }
      if (pNote === 'Forf.Tot') {
        pPsEstero = pCountry.rates.forfaitTotaleEur / 40;
        pForfEstero = pCountry.rates.forfaitTotaleEur / 5;
      } else {
        pPsEstero = pCountry.rates.piccoleSpeseEur * 0.25;
        pForfEstero = pNote === 'Forf.Misto' ? pCountry.rates.forfaitMistoEur / 2 : 0;
      }
    }

    let cEffValuta = 0;
    let cEffEurEstero = 0;
    let cUnconvertedValuta = 0;
    let cPsEstero = 0;
    let cForfEstero = 0;
    let cOverCap = false;

    if (cCountry && !cCountry.isItaly) {
      const cap1 = cCountry.oneMealValuta;
      const cap2 = cCountry.twoMealsValuta;
      const capValuta = twoMealsMode === 2 ? cap2 : cap1;
      const rawVal = cQuota || 0;
      if (cRic > 0 && cHasForeignQuota) {
        if (cCountry.isUnconverted) {
          cEffValuta = rawVal;
          cEffEurEstero = 0;
          cUnconvertedValuta = rawVal;
          cOverCap = false;
        } else {
          if (isTravelMealNote(cNote)) {
            cEffValuta = rawVal;
          } else {
            cEffValuta = Math.min(rawVal, capValuta);
            if (rawVal > capValuta + 1e-6) cOverCap = true;
          }
          cEffEurEstero = cEffValuta / cCountry.cambio;
        }
      }
      if (cNote === 'Forf.Tot') {
        cPsEstero = cCountry.rates.forfaitTotaleEur / 40;
        cForfEstero = cCountry.rates.forfaitTotaleEur / 5;
      } else {
        cPsEstero = cCountry.rates.piccoleSpeseEur * 0.25;
        cForfEstero = cNote === 'Forf.Misto' ? cCountry.rates.forfaitMistoEur / 2 : 0;
      }
    }

    let nEur = 0;
    let nUnconvertedValuta = 0;
    let nPsEstero = 0;
    let nForfEstero = 0;
    if (nCountry && !nCountry.isItaly) {
      if (nRic > 0) {
        if (nCountry.isUnconverted) nUnconvertedValuta = nRic;
        else nEur = nRic / nCountry.cambio;
      }
      nPsEstero = nNote === 'FT' ? 0 : nCountry.rates.piccoleSpeseEur * 0.5;
      nForfEstero = nNote === 'FT' ? nCountry.rates.forfaitTotaleEur / 1.819 : 0;
    }

    let colPdlEurEstero = 0;
    let colUnconvertedValuta = 0;
    if (colCountry && !colCountry.isItaly && colQuota !== null && colQuota > 0) {
      if (colCountry.isUnconverted) colUnconvertedValuta = colQuota;
      else colPdlEurEstero = colQuota / colCountry.cambio;
    }

    // --- ITALIA PDL, Massimali, Piccole Spese, Indennità ---
    let pPdlIt = 0;
    let pPdlMmIt = 0;
    if (verificaPranzi !== 1 && pCode === 'IT') {
      if (pNote === 'MM') pPdlMmIt = pQuota || 0;
      else if (pNote !== 'Forfait' && pNote !== 'FMM') pPdlIt = pQuota || 0;
    }

    let cPdlIt = 0;
    let cPdlMmIt = 0;
    if (cCode === 'IT') {
      if (cNote === 'MM') cPdlMmIt = cQuota || 0;
      else if (cNote !== 'Forfait' && cNote !== 'FMM') cPdlIt = cQuota || 0;
    }

    const pMassimaleIt =
      pCode === 'IT'
        ? pNote === 'MM' || pNote === 'FMM'
          ? toNum(italyRates.pastoMM)
          : toNum(italyRates.pasto1)
        : 0;

    const cMassimaleIt =
      cCode === 'IT'
        ? cNote === 'MM' || cNote === 'FMM'
          ? toNum(italyRates.pastoMM)
          : toNum(italyRates.pasto1)
        : 0;

    const pPsIt = pPdlIt + pPdlMmIt + forfaitPranziIt > 0 ? toNum(italyRates.piccoleSpesePasti) : 0;
    const cPsIt = cPdlIt + cPdlMmIt + forfaitCeneIt > 0 ? toNum(italyRates.piccoleSpesePasti) : 0;

    let nEurIt = 0;
    let nForfIt = 0;
    let nPsIt = 0;
    let indTrasfIt = 0;
    if (nCode === 'IT') {
      if (nRic > 0) nEurIt = nRic;
      if (verificaPernotti !== 1 && nNote === 'Forfait') {
        nForfIt = toNum(italyRates.forfaitNotti);
      }
      nPsIt = toNum(italyRates.piccoleSpeseNotti);
      indTrasfIt = toNum(italyRates.indennitaTrasferta);
    }

    // Colazione PDL Italia (Elaborazione!BI, BJ)
    let colMaxPdlIt = 0;
    if (colCode === 'IT' && colNote && colRic > 0) {
      if (isTravelMealNote(colNote)) colMaxPdlIt = colRic;
      else colMaxPdlIt = toNum(italyRates.forfaitColazioni);
    }
    const colPdlIt = verificaColazione === 1 ? 0 : Math.min(colRic, colMaxPdlIt);

    const pInViaggio = pNote === 'InViaggio' ? 1 : 0;
    const cInViaggio = cNote === 'InViaggio' ? 1 : 0;

    return {
      dayIndex: dIdx,
      iso: dayMeta.iso,
      weekdayInitial: dayMeta.weekdayInitial,
      dateParts: dayMeta.dateParts,
      moduleNumber: dayMeta.moduleNumber,
      rowInModule: dayMeta.rowInModule,
      rientro,
      warnings: {
        pMissingCovers,
        cMissingCovers,
        colMissingCovers,
        pOverCap,
        cOverCap,
        pDisallowed: verificaPranzi === 1 && pCode === 'IT' && (pRic > 0 || pNote === 'Forfait' || pNote === 'FMM'),
        cDisallowed: verificaCene === 1 && cCode === 'IT' && (cRic > 0 || cNote === 'Forfait' || cNote === 'FMM'),
        nDisallowed: verificaPernotti === 1 && nCode === 'IT' && nNote === 'Forfait',
        pForeignItForfait: Boolean(pCode && pCode !== 'IT' && (pNote === 'Forfait' || pNote === 'FMM')),
        cForeignItForfait: Boolean(cCode && cCode !== 'IT' && (cNote === 'Forfait' || cNote === 'FMM')),
      },
      pranzo: {
        ricevuta: p.ricevuta ?? '',
        coperti: p.coperti ?? '',
        quota: pQuota,
        note: pNote,
        code: pCode,
        countryName: pCountry ? pCountry.name : '',
        currencyLabel: pCountry ? (pCountry.isItaly ? 'Euro' : pCountry.localCurrency) : '',
        effEurEstero: pEffEurEstero,
        unconvertedValuta: pUnconvertedValuta,
        psEstero: pPsEstero,
        forfEstero: pForfEstero,
        pdlIt: pPdlIt,
        pdlMmIt: pPdlMmIt,
        forfIt: forfaitPranziIt,
        massimaleIt: pMassimaleIt,
        psIt: pPsIt,
        isFmmIt: pCode === 'IT' && pNote === 'FMM',
        isMmIt: pCode === 'IT' && pNote === 'MM',
        inViaggio: pInViaggio,
      },
      cena: {
        ricevuta: c.ricevuta ?? '',
        coperti: c.coperti ?? '',
        quota: cQuota,
        note: cNote,
        code: cCode,
        countryName: cCountry ? cCountry.name : '',
        currencyLabel: cCountry ? (cCountry.isItaly ? 'Euro' : cCountry.localCurrency) : '',
        effEurEstero: cEffEurEstero,
        unconvertedValuta: cUnconvertedValuta,
        psEstero: cPsEstero,
        forfEstero: cForfEstero,
        pdlIt: cPdlIt,
        pdlMmIt: cPdlMmIt,
        forfIt: forfaitCeneIt,
        massimaleIt: cMassimaleIt,
        psIt: cPsIt,
        isFmmIt: cCode === 'IT' && cNote === 'FMM',
        isMmIt: cCode === 'IT' && cNote === 'MM',
        inViaggio: cInViaggio,
      },
      pernotto: {
        ricevuta: n.ricevuta ?? '',
        note: nNote,
        code: nCode,
        countryName: nCountry ? nCountry.name : '',
        currencyLabel: nCountry ? (nCountry.isItaly ? 'Euro' : nCountry.localCurrency) : '',
        eur: nCountry ? (nCountry.isItaly ? nEurIt : nEur) : 0,
        unconvertedValuta: nUnconvertedValuta,
        psEstero: nPsEstero,
        forfEstero: nForfEstero,
        forfIt: nForfIt,
        psIt: nPsIt,
        indTrasfIt,
      },
      colazione: {
        ricevuta: col.ricevuta ?? '',
        coperti: col.coperti ?? '',
        quota: colQuota,
        note: colNote,
        code: colCode,
        countryName: colCountry ? colCountry.name : '',
        currencyLabel: colCountry ? (colCountry.isItaly ? 'Euro' : colCountry.localCurrency) : '',
        pdlEurEstero: colPdlEurEstero,
        unconvertedValuta: colUnconvertedValuta,
        forfIt: forfaitColazIt,
        pdlIt: colPdlIt,
      },
    };
  }

  function evaluateTickets(biglietti, visitedByCode) {
    const list = Array.isArray(biglietti) ? biglietti.slice(0, 16) : [];
    let totPagatiDipEur = 0;
    let totPagatiDipValuta = 0;
    let totPagatiDipValutaInEur = 0;
    let totPagatiRaiEur = 0;
    const unconvertedAcc = {};

    const rows = list.map((b) => {
      const code = String(b.code || '').trim();
      const country = visitedByCode[code] || null;
      const dipEur = toNum(b.pagatiDipEur);
      const dipValuta = toNum(b.pagatiDipValuta);
      const isUnconverted = Boolean(dipValuta > 0 && dipEur === 0 && country && country.isUnconverted);
      const dipValutaInEur =
        dipValuta > 0 && country && !country.isUnconverted && country.cambio > 0
          ? dipValuta / country.cambio
          : 0;
      const unconvertedAmount = isUnconverted ? dipValuta : 0;
      const unconvertedCurrency = isUnconverted ? country.localCurrency : '';
      if (isUnconverted) addCurrencyAmount(unconvertedAcc, unconvertedCurrency, unconvertedAmount);

      const raiEur = toNum(b.pagatiRaiEur);

      totPagatiDipEur += dipEur;
      totPagatiDipValuta += dipValuta;
      totPagatiDipValutaInEur += dipValutaInEur;
      totPagatiRaiEur += raiEur;

      const useValuta = dipValuta > 0 && dipEur === 0;
      const displayDipAmount = useValuta ? dipValuta : dipEur;
      const displayDipCurrency = useValuta
        ? (country ? country.localCurrency : '')
        : dipEur > 0
          ? '€'
          : '';

      return {
        ...b,
        code,
        dateParts: formatDateDDMM(b.dataArrivo),
        displayDipAmount,
        displayDipCurrency,
        totDipEur: dipEur + dipValutaInEur,
        isUnconverted,
        unconvertedAmount,
        unconvertedCurrency,
        raiEur,
      };
    });

    return {
      rows,
      totPagatiDipEur,
      totPagatiDipValuta,
      totPagatiDipValutaInEur,
      totPagatiDipComplEur: totPagatiDipEur + totPagatiDipValutaInEur,
      unconvertedByCurrency: finalizeCurrencyMap(unconvertedAcc),
      totPagatiRaiEur,
    };
  }

  function evaluateSpeseVarie(speseVarie, visitedByCode) {
    const list = Array.isArray(speseVarie) ? speseVarie.slice(0, 24) : [];
    let totEur = 0;
    const unconvertedAcc = {};

    const rows = list.map((s, idx) => {
      const code = String(s.code || '').trim();
      const country = visitedByCode[code] || null;
      const eur = toNum(s.pagateDipEur);
      const valuta = toNum(s.pagateDipValuta);
      const isUnconverted = Boolean(valuta > 0 && eur === 0 && country && country.isUnconverted);
      const valutaInEur =
        valuta > 0 && country && !country.isUnconverted && country.cambio > 0
          ? valuta / country.cambio
          : 0;
      const unconvertedAmount = isUnconverted ? valuta : 0;
      const unconvertedCurrency = isUnconverted ? country.localCurrency : '';
      if (isUnconverted) addCurrencyAmount(unconvertedAcc, unconvertedCurrency, unconvertedAmount);

      const convEur = eur + valutaInEur;
      totEur += convEur;

      const useValuta = valuta > 0 && eur === 0;
      const displayAmount = useValuta ? valuta : eur;
      const displayCurrency = useValuta
        ? (country ? country.localCurrency : '')
        : eur > 0
          ? '€'
          : '';

      return {
        ...s,
        moduleNumber: Math.floor(idx / 8) + 1,
        code,
        dateParts: formatDateDDMM(s.data),
        displayAmount,
        displayCurrency,
        convEur,
        isUnconverted,
        unconvertedAmount,
        unconvertedCurrency,
      };
    });

    return {
      rows,
      totEur,
      unconvertedByCurrency: finalizeCurrencyMap(unconvertedAcc),
    };
  }

  function buildModuloPages(trip, schedule, dailyRows, ticketsEval, speseEval, visitedEval) {
    const totalModules = Math.max(
      1,
      Math.min(
        3,
        Math.max(
          schedule.days.length > 0 ? Math.ceil(schedule.days.length / 33) : 1,
          speseEval.rows.length > 0 ? Math.ceil(speseEval.rows.length / 8) : 1
        )
      )
    );

    const cambiCountries = visitedEval.entries
      .filter((c) => !c.isItaly && c.showOnModulo)
      .slice(0, 6);

    const pages = [];
    for (let m = 1; m <= totalModules; m++) {
      const startDayIdx = (m - 1) * 33;
      const daySlice = [];
      for (let r = 0; r < 33; r++) {
        daySlice.push(dailyRows[startDayIdx + r] || null);
      }

      const startSpeseIdx = (m - 1) * 8;
      const speseSlice = [];
      for (let r = 0; r < 8; r++) {
        speseSlice.push(speseEval.rows[startSpeseIdx + r] || null);
      }

      const ticketSlice = [];
      for (let r = 0; r < 16; r++) {
        ticketSlice.push(m === 1 ? ticketsEval.rows[r] || null : null);
      }

      const cambiSlice = [];
      for (let r = 0; r < 6; r++) {
        cambiSlice.push(cambiCountries[r] || null);
      }

      pages.push({
        foglioN: m,
        autorizzazione: trip.numFoglioViaggio || '',
        nominativo: trip.nominativo || '',
        matricola: trip.matricola || '',
        annotazioni: trip.annotazioni || '',
        dataCompilazione: trip.dataCompilazione ? formatDateDDMM(trip.dataCompilazione).ddmmyyyy : '',
        trasferte: schedule.legs.map((l) => ({
          num: l.index,
          inizio: l.dal ? { ...formatDateDDMM(l.dal), ...splitTimeParts(l.oraDal) } : { day: '', month: '', h: '', m: '' },
          termine: l.al ? { ...formatDateDDMM(l.al), ...splitTimeParts(l.oraAl) } : { day: '', month: '', h: '', m: '' },
        })),
        biglietti: ticketSlice,
        speseVarie: speseSlice,
        cambi: cambiSlice,
        diarie: daySlice,
      });
    }

    return pages;
  }

  /**
   * Calcola l'intera trasferta: righe giornaliere, Nota Spese e Moduli 1..3.
   */
  function calculateTrip(trip, settings) {
    const safeTrip = trip || {};
    const safeSettings = settings || {};
    const countriesMap = buildCountriesMap(safeSettings.countries);
    const italyRates = safeSettings.italyRates || Defaults.DEFAULT_ITALY_RATES;
    const exchangeRates = safeSettings.exchangeRates || Defaults.DEFAULT_EXCHANGE_RATES;
    const mealCutoffs = safeSettings.mealCutoffs || Defaults.DEFAULT_MEAL_CUTOFFS;

    const visitedEval = computeVisitedCountries(safeTrip, countriesMap, italyRates, exchangeRates);
    const schedule = generateTripDateRange(safeTrip.trasferte, mealCutoffs);

    const giorniMap = safeTrip.giorni || {};
    const dailyRows = schedule.days.map((dayMeta) =>
      evaluateDailyRow(dayMeta, giorniMap[dayMeta.iso], schedule, visitedEval.byCode, italyRates)
    );

    const cnt = (pred) => dailyRows.reduce((acc, row) => acc + (pred(row) ? 1 : 0), 0);
    const sum = (fn) => dailyRows.reduce((acc, row) => acc + fn(row), 0);

    // Somme e conteggi identici a Elaborazione!R106 e R213:R227
    const colazPdlCount =
      cnt((r) => r.colazione.pdlEurEstero > 0 || r.colazione.unconvertedValuta > 0) +
      cnt((r) => r.colazione.pdlIt > 0);
    const colazPdlEur = sum((r) => r.colazione.pdlEurEstero + r.colazione.pdlIt);
    const colazForfCount = cnt((r) => r.colazione.forfIt > 0);
    const colazForfEur = sum((r) => r.colazione.forfIt);

    const pEstPdlCount = cnt((r) => r.pranzo.effEurEstero > 0 || r.pranzo.unconvertedValuta > 0);
    const cEstPdlCount = cnt((r) => r.cena.effEurEstero > 0 || r.cena.unconvertedValuta > 0);
    const pEstPdlEur = sum((r) => r.pranzo.effEurEstero);
    const cEstPdlEur = sum((r) => r.cena.effEurEstero);

    const pItPdlCount = cnt((r) => r.pranzo.pdlIt > 0);
    const pItMmCount = cnt((r) => r.pranzo.pdlMmIt > 0);
    const cItPdlCount = cnt((r) => r.cena.pdlIt > 0);
    const cItMmCount = cnt((r) => r.cena.pdlMmIt > 0);
    const inViaggioCount = sum((r) => r.pranzo.inViaggio + r.cena.inViaggio);

    const pItPdlEur = sum((r) => r.pranzo.pdlIt);
    const pItMmEur = sum((r) => r.pranzo.pdlMmIt);
    const cItPdlEur = sum((r) => r.cena.pdlIt);
    const cItMmEur = sum((r) => r.cena.pdlMmIt);

    const pItForfCount = cnt((r) => r.pranzo.forfIt > 0);
    const cItForfCount = cnt((r) => r.cena.forfIt > 0);
    const pEstForfCount = cnt((r) => r.pranzo.forfEstero > 0);
    const cEstForfCount = cnt((r) => r.cena.forfEstero > 0);

    const pItForfEur = sum((r) => r.pranzo.forfIt);
    const cItForfEur = sum((r) => r.cena.forfIt);
    const pEstForfEur = sum((r) => r.pranzo.forfEstero);
    const cEstForfEur = sum((r) => r.cena.forfEstero);

    // Cumulo massimali Italia (Elaborazione!AR220:BB227)
    const countFmmIt =
      cnt((r) => r.pranzo.isFmmIt) + cnt((r) => r.cena.isFmmIt);
    const deltaMm = toNum(italyRates.pastoMM) - toNum(italyRates.pasto1);
    const fmmAdjustment = deltaMm * countFmmIt;

    const totaleSpettanteIt = sum((r) => r.pranzo.massimaleIt + r.cena.massimaleIt);
    const totForfIt = pItForfEur + cItForfEur;
    const spesoConForfaitIt = pItPdlEur + pItMmEur + cItPdlEur + cItMmEur + totForfIt;
    const effettivoPastiPdlIt =
      Math.min(totaleSpettanteIt, spesoConForfaitIt) - totForfIt;

    const pastiPdlCount =
      pEstPdlCount +
      cEstPdlCount +
      pItPdlCount +
      pItMmCount +
      cItPdlCount +
      cItMmCount +
      inViaggioCount;
    const pastiPdlEur = pEstPdlEur + cEstPdlEur + effettivoPastiPdlIt;
    const pastiForfCount =
      pItForfCount + cItForfCount + pEstForfCount + cEstForfCount;
    const pastiForfEur = pEstForfEur + cEstForfEur + totForfIt - fmmAdjustment;

    const pernottiPdlCount = cnt((r) => r.pernotto.eur > 0 || r.pernotto.unconvertedValuta > 0);
    const pernottiPdlEur = sum((r) => r.pernotto.eur);
    const pernottiForfCount =
      cnt((r) => r.pernotto.forfEstero > 0) + cnt((r) => r.pernotto.forfIt > 0);
    const pernottiForfEur = sum((r) => r.pernotto.forfEstero + r.pernotto.forfIt);

    const colazUnconvertedAcc = {};
    const pastiUnconvertedAcc = {};
    const pernottiUnconvertedAcc = {};
    dailyRows.forEach((r) => {
      addCurrencyAmount(colazUnconvertedAcc, r.colazione.currencyLabel, r.colazione.unconvertedValuta);
      addCurrencyAmount(pastiUnconvertedAcc, r.pranzo.currencyLabel, r.pranzo.unconvertedValuta);
      addCurrencyAmount(pastiUnconvertedAcc, r.cena.currencyLabel, r.cena.unconvertedValuta);
      addCurrencyAmount(pernottiUnconvertedAcc, r.pernotto.currencyLabel, r.pernotto.unconvertedValuta);
    });
    const colazUnconverted = finalizeCurrencyMap(colazUnconvertedAcc);
    const pastiUnconverted = finalizeCurrencyMap(pastiUnconvertedAcc);
    const pernottiUnconverted = finalizeCurrencyMap(pernottiUnconvertedAcc);
    const diarieUnconverted = mergeCurrencyMaps(colazUnconverted, pastiUnconverted, pernottiUnconverted);

    const psCount =
      cnt((r) => r.pranzo.psIt > 0) +
      cnt((r) => r.cena.psIt > 0) +
      cnt((r) => r.pernotto.psIt > 0) +
      cnt((r) => r.pranzo.psEstero > 0) +
      cnt((r) => r.cena.psEstero > 0) +
      cnt((r) => r.pernotto.psEstero > 0);
    const psEur = sum(
      (r) =>
        r.pranzo.psIt +
        r.cena.psIt +
        r.pernotto.psIt +
        r.pranzo.psEstero +
        r.cena.psEstero +
        r.pernotto.psEstero
    );

    const indTrasfCount = cnt((r) => r.pernotto.indTrasfIt > 0);
    const indTrasfEur = sum((r) => r.pernotto.indTrasfIt);

    const totaliDiariePdl = colazPdlEur + pastiPdlEur + pernottiPdlEur;
    const totaliDiarieForf = colazForfEur + pastiForfEur + pernottiForfEur + psEur + indTrasfEur;
    const totaliDiarie = totaliDiariePdl + totaliDiarieForf;

    const ticketsEval = evaluateTickets(safeTrip.biglietti, visitedEval.byCode);
    const speseEval = evaluateSpeseVarie(safeTrip.speseVarie, visitedEval.byCode);

    const bigliettiUnconverted = ticketsEval.unconvertedByCurrency;
    const speseVarieUnconverted = speseEval.unconvertedByCurrency;
    const speseViaggioUnconverted = mergeCurrencyMaps(bigliettiUnconverted, speseVarieUnconverted);
    const altreSpeseUnconverted = visitedEval.totCommissioniUnconverted;
    const totaleUnconverted = mergeCurrencyMaps(diarieUnconverted, speseViaggioUnconverted, altreSpeseUnconverted);

    const speseViaggioDoc = ticketsEval.totPagatiDipComplEur + speseEval.totEur;
    const altreSpese = visitedEval.totCommissioniEur;
    const totaleTrasferta = totaliDiarie + speseViaggioDoc + altreSpese;
    const anticipi = toNum(safeTrip.anticipi);
    const residuoNetto = totaleTrasferta - anticipi;

    // Controllo pasti Italia (Nota Spese!L14:N20)
    const countItMm = pItMmCount + cItMmCount + countFmmIt;
    const countItNoMm = pItPdlCount + cItPdlCount + pItForfCount + cItForfCount - countFmmIt;
    const spesaEffettivaPasti =
      pEstPdlEur +
      cEstPdlEur +
      pItPdlEur +
      cItPdlEur +
      pItMmEur +
      cItMmEur +
      totForfIt;

    const warningsList = [];
    const infoNotes = [];
    dailyRows.forEach((r) => {
      if (r.warnings.pMissingCovers) warningsList.push(`${r.dateParts.ddmm}: coperti mancanti a Pranzo`);
      if (r.warnings.cMissingCovers) warningsList.push(`${r.dateParts.ddmm}: coperti mancanti a Cena`);
      if (r.warnings.colMissingCovers) warningsList.push(`${r.dateParts.ddmm}: coperti mancanti a Colazione`);
      if (r.warnings.pOverCap) warningsList.push(`${r.dateParts.ddmm}: Pranzo estero oltre massimale`);
      if (r.warnings.cOverCap) warningsList.push(`${r.dateParts.ddmm}: Cena estera oltre massimale`);
      if (r.warnings.pForeignItForfait || r.warnings.cForeignItForfait) {
        warningsList.push(`${r.dateParts.ddmm}: "Forfait" vale solo per IT (usa Forf.Misto per l'estero)`);
      }
    });
    if (Object.keys(totaleUnconverted).length > 0) {
      infoNotes.push(`In valuta (cambio a cura Uff. Trasferte): ${formatCurrencyExtras(totaleUnconverted)}`);
    }

    const notaSpese = {
      colazioni: {
        countTot: schedule.colazioniSpettanti,
        countPdl: colazPdlCount,
        impPdl: round2(colazPdlEur),
        countForf: colazForfCount,
        impForf: round2(colazForfEur),
        impTot: round2(colazPdlEur + colazForfEur),
        unconverted: colazUnconverted,
      },
      pasti: {
        countTot: pastiPdlCount + pastiForfCount,
        countPdl: pastiPdlCount,
        impPdl: round2(pastiPdlEur),
        countForf: pastiForfCount,
        impForf: round2(pastiForfEur),
        impTot: round2(pastiPdlEur + pastiForfEur),
        unconverted: pastiUnconverted,
      },
      pernottamenti: {
        countTot: schedule.totNotti,
        countPdl: pernottiPdlCount,
        impPdl: round2(pernottiPdlEur),
        countForf: pernottiForfCount,
        impForf: round2(pernottiForfEur),
        impTot: round2(pernottiPdlEur + pernottiForfEur),
        unconverted: pernottiUnconverted,
      },
      piccoleSpese: {
        countTot: psCount,
        countForf: psCount,
        impForf: round2(psEur),
        impTot: round2(psEur),
      },
      indennitaTrasferta: {
        countTot: indTrasfCount,
        countForf: indTrasfCount,
        impForf: round2(indTrasfEur),
        impTot: round2(indTrasfEur),
      },
      totaliDiarie: {
        impPdl: round2(totaliDiariePdl),
        impForf: round2(totaliDiarieForf),
        impTot: round2(totaliDiarie),
        unconverted: diarieUnconverted,
      },
      speseViaggioDoc: round2(speseViaggioDoc),
      speseViaggioUnconverted,
      bigliettiDipEur: round2(ticketsEval.totPagatiDipComplEur),
      bigliettiUnconverted,
      speseVarieEur: round2(speseEval.totEur),
      speseVarieUnconverted,
      altreSpese: round2(altreSpese),
      altreSpeseUnconverted,
      totaleTrasferta: round2(totaleTrasferta),
      totaleUnconverted,
      spesePerContoRai: round2(ticketsEval.totPagatiRaiEur),
      anticipi: round2(anticipi),
      residuoNetto: round2(residuoNetto),
      controlloPastiItalia: {
        pastiSpettanti: schedule.pranziSpettanti + schedule.ceneSpettanti,
        countNoMM: Math.max(0, countItNoMm),
        countMM: countItMm,
        spettanteIt: round2(totaleSpettanteIt),
        spesoIt: round2(spesoConForfaitIt),
        differenzaIt: round2(totaleSpettanteIt - spesoConForfaitIt),
        spesaEffettivaTot: round2(spesaEffettivaPasti),
      },
    };

    const moduloPages = buildModuloPages(
      safeTrip,
      schedule,
      dailyRows,
      ticketsEval,
      speseEval,
      visitedEval
    );

    return {
      visitedCountries: visitedEval,
      schedule,
      dailyRows,
      tickets: ticketsEval,
      speseVarie: speseEval,
      notaSpese,
      moduloPages,
      warnings: warningsList,
      infoNotes,
    };
  }

  const api = {
    toNum,
    round2,
    normalizeNote,
    parseIsoDate,
    formatDateDDMM,
    formatItNumber,
    formatItCurrency,
    formatCurrencyExtras,
    formatEurWithExtras,
    buildCountriesMap,
    computeCountryRates,
    computeVisitedCountries,
    generateTripDateRange,
    calculateTrip,
  };

  root.TrasferteCalc = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
