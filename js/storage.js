/**
 * Persistenza in tempo reale (localStorage) + gestione archivio trasferte ed export/import JSON/CSV.
 */
(function (root) {
  'use strict';

  const Defaults =
    root.TrasferteDefaults ||
    (typeof require !== 'undefined' ? require('./data-defaults.js') : null);

  const ARCHIVE_KEY = 'rai_trasferte_v1_archive';
  const SETTINGS_KEY = 'rai_trasferte_v1_settings';

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function generateId(prefix) {
    const rand = Math.random().toString(36).slice(2, 7);
    return `${prefix || 'tr'}_${Date.now().toString(36)}_${rand}`;
  }

  function getDefaultSettings() {
    return {
      version: 1,
      exchangeRates: clone(Defaults.DEFAULT_EXCHANGE_RATES),
      italyRates: clone(Defaults.DEFAULT_ITALY_RATES),
      mealCutoffs: clone(Defaults.DEFAULT_MEAL_CUTOFFS),
      italyMmCities: clone(Defaults.ITALY_MM_CITIES),
      countries: clone(Defaults.DEFAULT_COUNTRIES),
    };
  }

  function createEmptyTrip(profile) {
    const now = new Date().toISOString();
    const prof = profile || {};
    return {
      id: generateId('tr'),
      nome: '',
      stato: 'in_corso',
      createdAt: now,
      updatedAt: now,
      matricola: prof.matricola || '',
      nominativo: prof.nominativo || '',
      numFoglioViaggio: '',
      dataCompilazione: now.slice(0, 10),
      anticipi: '',
      annotazioni: 'VIAGGIATO CON MATERIALE AZIENDALE AL SEGUITO',
      trasferte: [
        { dal: '', oraDal: '', partDaSede: 'NO', al: '', oraAl: '', rientroInSede: 'NO' },
        { dal: '', oraDal: '', partDaSede: 'NO', al: '', oraAl: '', rientroInSede: 'NO' },
        { dal: '', oraDal: '', partDaSede: 'NO', al: '', oraAl: '', rientroInSede: 'NO' },
      ],
      paesiVisitati: [],
      biglietti: [],
      speseVarie: [],
      giorni: {},
    };
  }

  function createDemoTrip(profile) {
    const base = createEmptyTrip(profile);
    const prof = profile || {};
    base.nome = 'Londra Maggio 2026 (Esempio)';
    base.stato = 'in_corso';
    base.matricola = prof.matricola || '000000';
    base.nominativo = prof.nominativo || 'ROSSI MARIO';
    base.numFoglioViaggio = '2026/0418';
    base.dataCompilazione = '2026-05-15';
    base.anticipi = 200;
    base.trasferte = [
      { dal: '2026-05-11', oraDal: '07:45', partDaSede: 'SI', al: '2026-05-14', oraAl: '21:15', rientroInSede: 'SI' },
      { dal: '', oraDal: '', partDaSede: 'NO', al: '', oraAl: '', rientroInSede: 'NO' },
      { dal: '', oraDal: '', partDaSede: 'NO', al: '', oraAl: '', rientroInSede: 'NO' },
    ];
    base.paesiVisitati = [
      { code: 'GB', euro: 250, valuta: 212.5, commEur: 4.5, commValuta: 0, showOnModulo: true },
    ];
    base.biglietti = [
      { nTrasf: 1, localita: 'MILANO - LONDRA (A/R)', dataArrivo: '2026-05-11', mezzo: 'AE', pagatiDipEur: '', pagatiDipValuta: '', code: 'GB', pagatiRaiEur: 342.8 },
      { nTrasf: 1, localita: 'GATWICK EXPRESS', dataArrivo: '2026-05-11', mezzo: 'TR', pagatiDipEur: '', pagatiDipValuta: 21.5, code: 'GB', pagatiRaiEur: '' },
    ];
    base.speseVarie = [
      { data: '2026-05-11', descrizione: 'Taxi aeroporto / hotel', pagateDipEur: '', pagateDipValuta: 34.0, code: 'GB' },
      { data: '2026-05-12', descrizione: 'Abbonamento metro Londra', pagateDipEur: '', pagateDipValuta: 16.5, code: 'GB' },
      { data: '2026-05-13', descrizione: 'Parcheggio stazione Milano', pagateDipEur: 28.0, pagateDipValuta: '', code: 'IT' },
    ];
    base.giorni = {
      '2026-05-11': {
        pranzo: { ricevuta: 24.5, coperti: 1, note: 'MM', code: 'IT' },
        cena: { ricevuta: 38.0, coperti: 1, note: '', code: 'GB' },
        pernotto: { ricevuta: 145.0, note: '', code: 'GB' },
        colazione: { ricevuta: '', coperti: '', note: '', code: '' },
        rientro: '',
      },
      '2026-05-12': {
        pranzo: { ricevuta: 52.0, coperti: 2, note: '', code: 'GB' },
        cena: { ricevuta: 34.5, coperti: 1, note: '', code: 'GB' },
        pernotto: { ricevuta: 145.0, note: '', code: 'GB' },
        colazione: { ricevuta: 12.0, coperti: 1, note: '', code: 'GB' },
        rientro: '',
      },
      '2026-05-13': {
        pranzo: { ricevuta: '', coperti: '', note: 'Forf.Misto', code: 'GB' },
        cena: { ricevuta: 29.0, coperti: 1, note: 'MM', code: 'IT' },
        pernotto: { ricevuta: 118.0, note: '', code: 'IT' },
        colazione: { ricevuta: 11.5, coperti: 1, note: '', code: 'GB' },
        rientro: '',
      },
      '2026-05-14': {
        pranzo: { ricevuta: 22.0, coperti: 1, note: '', code: 'IT' },
        cena: { ricevuta: '', coperti: '', note: 'Forfait', code: 'IT' },
        pernotto: { ricevuta: '', note: '', code: '' },
        colazione: { ricevuta: '', coperti: '', note: 'Forfait', code: 'IT' },
        rientro: 'RIEN.',
      },
    };
    return base;
  }

  function normalizeTrip(trip) {
    const empty = createEmptyTrip();
    const t = Object.assign(empty, trip || {});
    t.nome = typeof t.nome === 'string' ? t.nome : String(t.nome || '');
    t.stato = t.stato === 'completata' ? 'completata' : 'in_corso';
    if (!Array.isArray(t.trasferte) || t.trasferte.length < 3) {
      const padded = [0, 1, 2].map((i) =>
        Object.assign(
          { dal: '', oraDal: '', partDaSede: 'NO', al: '', oraAl: '', rientroInSede: 'NO' },
          (t.trasferte && t.trasferte[i]) || {}
        )
      );
      t.trasferte = padded;
    }
    if (!Array.isArray(t.paesiVisitati)) t.paesiVisitati = [];
    if (!Array.isArray(t.biglietti)) t.biglietti = [];
    if (!Array.isArray(t.speseVarie)) t.speseVarie = [];
    if (!t.giorni || typeof t.giorni !== 'object') t.giorni = {};
    return t;
  }

  function safeReadStorage(key) {
    try {
      if (typeof localStorage === 'undefined') return { ok: false, data: null, error: 'localStorage non disponibile' };
      const raw = localStorage.getItem(key);
      return { ok: true, data: raw ? JSON.parse(raw) : null, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err && err.message ? err.message : 'Errore lettura' };
    }
  }

  function safeWriteStorage(key, value) {
    try {
      if (typeof localStorage === 'undefined') return { ok: false, error: 'localStorage non disponibile' };
      localStorage.setItem(key, JSON.stringify(value));
      return { ok: true, error: null };
    } catch (err) {
      return { ok: false, error: err && err.message ? err.message : 'Errore salvataggio' };
    }
  }

  function loadSettings() {
    const def = getDefaultSettings();
    const res = safeReadStorage(SETTINGS_KEY);
    if (!res.ok || !res.data) return { settings: def, storageWarning: res.error };
    const saved = res.data;
    return {
      settings: {
        version: 1,
        exchangeRates: Object.assign({}, def.exchangeRates, saved.exchangeRates || {}),
        italyRates: Object.assign({}, def.italyRates, saved.italyRates || {}),
        mealCutoffs: Object.assign({}, def.mealCutoffs, saved.mealCutoffs || {}),
        italyMmCities: Array.isArray(saved.italyMmCities) ? saved.italyMmCities : def.italyMmCities,
        countries: Array.isArray(saved.countries) && saved.countries.length > 0 ? saved.countries : def.countries,
      },
      storageWarning: null,
    };
  }

  function saveSettings(settings) {
    return safeWriteStorage(SETTINGS_KEY, settings);
  }

  function resetSettingsToDefaults() {
    const def = getDefaultSettings();
    saveSettings(def);
    return def;
  }

  function loadArchive() {
    const res = safeReadStorage(ARCHIVE_KEY);
    if (!res.ok || !res.data || !Array.isArray(res.data.trips) || res.data.trips.length === 0) {
      const firstTrip = createEmptyTrip();
      const archive = {
        version: 1,
        activeTripId: firstTrip.id,
        profile: { matricola: '', nominativo: '' },
        trips: [firstTrip],
      };
      const wr = safeWriteStorage(ARCHIVE_KEY, archive);
      return { archive, storageWarning: res.error || wr.error };
    }

    const trips = res.data.trips.map(normalizeTrip);
    const activeTripId = trips.some((t) => t.id === res.data.activeTripId)
      ? res.data.activeTripId
      : trips[0].id;
    return {
      archive: {
        version: 1,
        activeTripId,
        profile: Object.assign({ matricola: '', nominativo: '' }, res.data.profile || {}),
        trips,
      },
      storageWarning: null,
    };
  }

  function saveArchive(archive) {
    return safeWriteStorage(ARCHIVE_KEY, archive);
  }

  function formatIsoShort(iso) {
    if (!iso || typeof iso !== 'string') return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
    if (!m) return iso;
    return `${m[3]}/${m[2]}/${m[1]}`;
  }

  function getTripDisplayLabel(trip) {
    if (!trip) return 'Nuova Trasferta';
    const nome = String(trip.nome || '').trim();
    const dalRaw = trip.trasferte && trip.trasferte[0] && trip.trasferte[0].dal ? trip.trasferte[0].dal : '';
    const dal = formatIsoShort(dalRaw);

    if (nome) {
      return dal ? `${nome} · ${dal}` : nome;
    }

    const num = trip.numFoglioViaggio ? `Autor. ${trip.numFoglioViaggio}` : 'Bozza senza nome';
    const dest =
      trip.biglietti && trip.biglietti[0] && trip.biglietti[0].localita
        ? trip.biglietti[0].localita
        : trip.nominativo || '';
    const parts = [num];
    if (dal) parts.push(dal);
    if (dest) parts.push(dest);
    return parts.join(' · ');
  }

  function getTripSafeFilename(trip) {
    const raw = (trip && (trip.nome || trip.numFoglioViaggio)) || 'bozza';
    const slug = String(raw)
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return slug || 'bozza';
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType || 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportTripJson(trip) {
    const payload = {
      type: 'rai_trasferta_single',
      version: 1,
      exportedAt: new Date().toISOString(),
      trip,
    };
    downloadFile(`trasferta_${getTripSafeFilename(trip)}.json`, JSON.stringify(payload, null, 2));
  }

  function exportArchiveJson(archive) {
    const payload = {
      type: 'rai_trasferte_archive',
      version: 1,
      exportedAt: new Date().toISOString(),
      archive,
    };
    downloadFile(`archivio_trasferte_${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2));
  }

  function parseImportedTripOrArchive(text) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('File JSON non valido');
    }
    if (parsed.type === 'rai_trasferta_single' && parsed.trip) {
      const t = normalizeTrip(parsed.trip);
      t.id = generateId('tr');
      t.updatedAt = new Date().toISOString();
      return { kind: 'single', trip: t };
    }
    if (parsed.type === 'rai_trasferte_archive' && parsed.archive && Array.isArray(parsed.archive.trips)) {
      return {
        kind: 'archive',
        trips: parsed.archive.trips.map((t) => {
          const nt = normalizeTrip(t);
          if (!nt.id) nt.id = generateId('tr');
          return nt;
        }),
      };
    }
    if (Array.isArray(parsed.trasferte) || parsed.giorni) {
      const t = normalizeTrip(parsed);
      t.id = generateId('tr');
      return { kind: 'single', trip: t };
    }
    throw new Error('Struttura file JSON trasferta non riconosciuta');
  }

  function exportSettingsJson(settings) {
    const payload = {
      type: 'rai_trasferte_settings',
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
    };
    downloadFile(`massimali_codici_paesi_${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2));
  }

  function parseImportedSettings(text) {
    const parsed = JSON.parse(text);
    const data = parsed && parsed.type === 'rai_trasferte_settings' ? parsed.settings : parsed;
    if (!data || !Array.isArray(data.countries) || !data.italyRates || !data.exchangeRates) {
      throw new Error('File massimali non valido: mancano countries, italyRates o exchangeRates');
    }
    const def = getDefaultSettings();
    return {
      version: 1,
      exchangeRates: Object.assign({}, def.exchangeRates, data.exchangeRates),
      italyRates: Object.assign({}, def.italyRates, data.italyRates),
      mealCutoffs: Object.assign({}, def.mealCutoffs, data.mealCutoffs || {}),
      italyMmCities: Array.isArray(data.italyMmCities) ? data.italyMmCities : def.italyMmCities,
      countries: data.countries,
    };
  }

  function exportCountriesCsv(countries, exchangeRates, computeCountryRatesFn) {
    const header = [
      'CODICE',
      'PAESE',
      'VALUTA_BASE',
      'FORFAIT_MISTO_VALUTA',
      'FORFAIT_TOTALE_VALUTA',
      'FORFAIT_MISTO_EUR',
      'FORFAIT_TOTALE_EUR',
      'MASSIMALE_2_PASTI_EUR',
      'MASSIMALE_1_PASTO_EUR',
      'PICCOLE_SPESE_EUR',
      'MONETA_ISO',
      'NOME_MONETA',
      'CAMBIO_INDICATIVO',
    ].join(';');

    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const fmt = (n) => (n === null || n === undefined ? '' : Number(n).toFixed(2).replace('.', ','));

    const lines = [header];
    (countries || []).forEach((c) => {
      const r = computeCountryRatesFn(c, exchangeRates);
      lines.push(
        [
          esc(c.code),
          esc(c.name),
          esc(c.baseCurrency),
          fmt(c.forfaitMistoValuta),
          fmt(c.forfaitTotaleValuta),
          fmt(r.forfaitMistoEur),
          fmt(r.forfaitTotaleEur),
          fmt(r.twoMealsEur),
          fmt(r.oneMealEur),
          fmt(r.piccoleSpeseEur),
          esc(c.localCurrency),
          esc(c.currencyName),
          c.indicativeRate !== null && c.indicativeRate !== undefined ? String(c.indicativeRate).replace('.', ',') : '',
        ].join(';')
      );
    });

    downloadFile(
      `codici_paesi_massimali_${new Date().toISOString().slice(0, 10)}.csv`,
      '\uFEFF' + lines.join('\r\n'),
      'text/csv;charset=utf-8'
    );
  }

  const api = {
    ARCHIVE_KEY,
    SETTINGS_KEY,
    generateId,
    getDefaultSettings,
    createEmptyTrip,
    createDemoTrip,
    normalizeTrip,
    loadSettings,
    saveSettings,
    resetSettingsToDefaults,
    loadArchive,
    saveArchive,
    getTripDisplayLabel,
    getTripSafeFilename,
    exportTripJson,
    exportArchiveJson,
    parseImportedTripOrArchive,
    exportSettingsJson,
    parseImportedSettings,
    exportCountriesCsv,
  };

  root.TrasferteStorage = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
