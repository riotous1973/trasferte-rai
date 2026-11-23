/**
 * Dati predefiniti estratti fedelmente da 00001_Trasferte_Nuovo.xlsm
 * (Codici Paesi, Elaborazione, Logo ufficiale RAI MOD.31426).
 */
(function (root) {
  'use strict';

  const RAI_LOGO_DATA_URI = "data:image/jpeg;base64,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";

  const ITALY_COUNTRY = {
    code: 'IT',
    name: 'Italia',
    baseCurrency: 'EUR',
    localCurrency: 'EUR',
    currencyName: 'Euro',
    isItaly: true,
  };

  const DEFAULT_ITALY_RATES = {
  "pasto1": 27.53,
  "pastoMM": 30.11,
  "pastoMMDelta": 2.58,
  "piccoleSpeseNotti": 4.13,
  "piccoleSpesePasti": 2.07,
  "indennitaTrasferta": 20.0,
  "forfaitColazioni": 1.81,
  "forfaitPasti": 5.68,
  "forfaitPastiMM": 8.27,
  "forfaitNotti": 6.2
};

  const DEFAULT_EXCHANGE_RATES = {
  "usd": 1.1025,
  "gbp": 0.84775,
  "updatedAt": "2016-11-01",
  "sourceUrl": "https://tassidicambio.bancaditalia.it/dailyRates"
};

  const DEFAULT_MEAL_CUTOFFS = {
  "pranzo": "13:30",
  "cena": "20:00",
  "colazione": "08:00",
  "pranzoPartSede": "12:00",
  "pranzoRientroSede": "14:30",
  "cenaPartSede": "19:00",
  "cenaRientroSede": "20:30"
};

  const ITALY_MM_CITIES = ["BARI", "BOLOGNA", "CAGLIARI", "CORTINA", "COURMAYEUR", "FIRENZE", "GENOVA", "MILANO", "MONTECATINI", "NAPOLI", "PALERMO", "ROMA", "SANREMO", "TAORMINA", "TORINO", "TRIESTE", "VENEZIA"];

  const USA_BANDS = [
  {
    "band": "U.S.A. A",
    "cities": "Tutte le località non comprese né in fascia B né in fascia C"
  },
  {
    "band": "U.S.A. B",
    "cities": "Phoenix, Scottsdale (Arizona), San Diego, Orange Country, Los Angeles, Monterey, Napa, Oakland, Sonoma, Mendoncino, Santa Barbara, Santa Monica (California), Denver, Boulder, Aspen (Colorado), Bridgeport, New London, Hartford (Connecticut), Wilmington (Delaware), Washington (DC), Palm Beach, Cape Canaveral, Fort Lauderdale, Miami, Orlando, Tampa (Florida), Atlanta (Georgia), New Orleans (Lousiana), Portland, Portsmouth (Maine), Annapolis, Baltimora (Maryland), Cape Cod, Springfield (Massachussets), Detroit, Troy (Michigan), Minneapolis, St. Paul (Minnesota), Big Sky (Montana), Atlantic City, Dover, Newark (New Jersey), Santa Fe (New Mexico), Albany, NY - Staten Island - (New York), Philadelphia (Pennsylvania), Providence (Rhode Island), Charlestone (South Carolina), Dallas, Fort Worth, Houston, San Antonio (Texas), Ogden, Park C., Provo, Salt Lake City (Utah), Seattle (Wash.), Milwaukee (Wisconsin)"
  },
  {
    "band": "U.S.A. C",
    "cities": "Santa Clara, Palo Alto, San Francisco (California), Vail (Colorado), Key West (Florida), Chicago (Illinois), Boston, Nantucket (Massachussets), Trenton (New Jersey), New York - Brooklyn, Queens, Manhattan - (New York)"
  }
];

  const MEZZI_TRASPORTO = [
  {
    "code": "AE",
    "label": "AE - Aereo"
  },
  {
    "code": "TR",
    "label": "TR - Treno"
  },
  {
    "code": "AS",
    "label": "AS - Auto di Servizio"
  },
  {
    "code": "PU",
    "label": "PU - Mezzi Pubblici"
  },
  {
    "code": "AU",
    "label": "AU - Auto Propria"
  },
  {
    "code": "AL",
    "label": "AL - Altro"
  },
  {
    "code": "NA",
    "label": "NA - Nave"
  }
];

  const NOTE_PASTO = [
  {
    "value": "",
    "label": "— (Piè di Lista)",
    "scope": "TUTTI",
    "desc": "Rimborso a piè di lista entro il massimale"
  },
  {
    "value": "Forfait",
    "label": "Forfait (Italia)",
    "scope": "IT",
    "desc": "Italia: quota forfait pasto"
  },
  {
    "value": "FMM",
    "label": "FMM - Forfait Magg. (Italia)",
    "scope": "IT",
    "desc": "Italia: forfait pasto maggiorato"
  },
  {
    "value": "MM",
    "label": "MM - Massimale Magg. (Italia)",
    "scope": "IT",
    "desc": "Italia: piè di lista con massimale maggiorato"
  },
  {
    "value": "Forf.Misto",
    "label": "Forf.Misto (Estero)",
    "scope": "ESTERO",
    "desc": "Estero: forfait misto (50% per pasto)"
  },
  {
    "value": "Forf.Tot",
    "label": "Forf.Tot (Estero)",
    "scope": "ESTERO",
    "desc": "Estero: forfait totale"
  },
  {
    "value": "Aereop",
    "label": "Aereop - Pasto in aeroporto",
    "scope": "TUTTI",
    "desc": "Pasto in aeroporto (senza massimale estero)"
  },
  {
    "value": "Treno",
    "label": "Treno - Pasto in treno",
    "scope": "TUTTI",
    "desc": "Pasto in treno (senza massimale estero)"
  },
  {
    "value": "Nave",
    "label": "Nave - Pasto in nave",
    "scope": "TUTTI",
    "desc": "Pasto in nave (senza massimale estero)"
  },
  {
    "value": "InViaggio",
    "label": "InViaggio - Pasto in viaggio",
    "scope": "TUTTI",
    "desc": "Compreso nel viaggio (vale come pasto PDL in Nota Spese)"
  }
];

  const NOTE_PERNOTTO = [
  {
    "value": "",
    "label": "— (Piè di Lista)",
    "scope": "TUTTI",
    "desc": "Pernottamento a piè di lista"
  },
  {
    "value": "Forfait",
    "label": "Forfait (Italia)",
    "scope": "IT",
    "desc": "Italia: forfait pernottamento"
  },
  {
    "value": "FT",
    "label": "FT - Forfait Totale (Estero)",
    "scope": "ESTERO",
    "desc": "Estero: forfait totale pernottamento"
  },
  {
    "value": "OFF",
    "label": "OFF - Offerto",
    "scope": "TUTTI",
    "desc": "Pernottamento offerto (senza ricevuta)"
  },
  {
    "value": "InViaggio",
    "label": "InViaggio - Notte in viaggio",
    "scope": "TUTTI",
    "desc": "Pernottamento durante il viaggio"
  }
];

  const NOTE_COLAZIONE = [
  {
    "value": "",
    "label": "— (Piè di Lista / Nessuna)",
    "scope": "TUTTI",
    "desc": "Colazione a piè di lista (Estero) o nessuna"
  },
  {
    "value": "Forfait",
    "label": "Forfait (Italia)",
    "scope": "IT",
    "desc": "Italia: forfait colazione"
  },
  {
    "value": "Aereop",
    "label": "Aereop - Colazione in aeroporto",
    "scope": "TUTTI",
    "desc": "Colazione in aeroporto"
  },
  {
    "value": "TRENO",
    "label": "TRENO - Colazione in treno",
    "scope": "TUTTI",
    "desc": "Colazione in treno"
  },
  {
    "value": "NAVE",
    "label": "NAVE - Colazione in nave",
    "scope": "TUTTI",
    "desc": "Colazione in nave"
  }
];

  const RIENTRO_OPTIONS = ["", "RIEN.", "FS"];

  const DEFAULT_COUNTRIES = [
  {
    "code": "AFG",
    "name": "AFGHANISTAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 82.0,
    "forfaitTotaleValuta": 222.0,
    "indicativeRate": null,
    "localCurrency": "AFN",
    "currencyName": "Afghani"
  },
  {
    "code": "AL",
    "name": "ALBANIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 58.0,
    "forfaitTotaleValuta": 193.0,
    "indicativeRate": null,
    "localCurrency": "ALL",
    "currencyName": "Lek"
  },
  {
    "code": "DZ",
    "name": "ALGERIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 70.48,
    "forfaitTotaleValuta": 200.48,
    "indicativeRate": null,
    "localCurrency": "DZD",
    "currencyName": "Dinaro"
  },
  {
    "code": "PAN",
    "name": "ANGOLA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 192.0,
    "forfaitTotaleValuta": 392.0,
    "indicativeRate": null,
    "localCurrency": "AOA",
    "currencyName": "Kwanza"
  },
  {
    "code": "ANT",
    "name": "ANTARTIDE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 0.0,
    "forfaitTotaleValuta": 90.0,
    "indicativeRate": null,
    "localCurrency": "",
    "currencyName": ""
  },
  {
    "code": "AB",
    "name": "ANTIGUA E BARBUDA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 130.0,
    "forfaitTotaleValuta": 272.5,
    "indicativeRate": null,
    "localCurrency": "XCD",
    "currencyName": "Dollaro"
  },
  {
    "code": "NA",
    "name": "ANTILLE OLANDESI",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 78.0,
    "forfaitTotaleValuta": 208.0,
    "indicativeRate": null,
    "localCurrency": "ANG",
    "currencyName": "Fiorino"
  },
  {
    "code": "SA",
    "name": "ARABIA SAUDITA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 102.82,
    "forfaitTotaleValuta": 247.82,
    "indicativeRate": null,
    "localCurrency": "SAR",
    "currencyName": "Ryal"
  },
  {
    "code": "RA",
    "name": "ARGENTINA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 76.0,
    "forfaitTotaleValuta": 221.0,
    "indicativeRate": null,
    "localCurrency": "ARS",
    "currencyName": "Peso"
  },
  {
    "code": "ARM",
    "name": "ARMENIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 79.44,
    "forfaitTotaleValuta": 229.44,
    "indicativeRate": null,
    "localCurrency": "AMD",
    "currencyName": "Dram"
  },
  {
    "code": "AUS",
    "name": "AUSTRALIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 158.0,
    "forfaitTotaleValuta": 338.0,
    "indicativeRate": null,
    "localCurrency": "AUD",
    "currencyName": "Dollaro"
  },
  {
    "code": "A",
    "name": "AUSTRIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 84.2,
    "forfaitTotaleValuta": 219.2,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "AZ",
    "name": "AZERBAIGIAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 102.0,
    "forfaitTotaleValuta": 282.0,
    "indicativeRate": null,
    "localCurrency": "AZN",
    "currencyName": "Manat"
  },
  {
    "code": "BS",
    "name": "BAHAMAS",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 165.19,
    "forfaitTotaleValuta": 295.19,
    "indicativeRate": null,
    "localCurrency": "BSD",
    "currencyName": "Dollaro"
  },
  {
    "code": "BRN",
    "name": "BAHREIN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 118.83,
    "forfaitTotaleValuta": 223.83,
    "indicativeRate": 0.405,
    "localCurrency": "BHD",
    "currencyName": "Dinar"
  },
  {
    "code": "BD",
    "name": "BANGLADESH",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 74.86,
    "forfaitTotaleValuta": 229.86,
    "indicativeRate": null,
    "localCurrency": "BDT",
    "currencyName": "Taka"
  },
  {
    "code": "BDS",
    "name": "BARBADOS",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 133.6,
    "forfaitTotaleValuta": 298.6,
    "indicativeRate": null,
    "localCurrency": "BBD",
    "currencyName": "Dollaro"
  },
  {
    "code": "B",
    "name": "BELGIO",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 94.2,
    "forfaitTotaleValuta": 244.2,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "BH",
    "name": "BELIZE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 96.22,
    "forfaitTotaleValuta": 221.22,
    "indicativeRate": null,
    "localCurrency": "BZD",
    "currencyName": "Dollaro"
  },
  {
    "code": "DY",
    "name": "BENIN",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 80.0,
    "forfaitTotaleValuta": 215.0,
    "indicativeRate": null,
    "localCurrency": "XOF",
    "currencyName": "Franco"
  },
  {
    "code": "BMD",
    "name": "BERMUDA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 157.28,
    "forfaitTotaleValuta": 312.28,
    "indicativeRate": null,
    "localCurrency": "BMD",
    "currencyName": "Dollaro"
  },
  {
    "code": "DRK",
    "name": "BHUTAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 54.0,
    "forfaitTotaleValuta": 134.0,
    "indicativeRate": null,
    "localCurrency": "BTN",
    "currencyName": "Ngultrum"
  },
  {
    "code": "BY",
    "name": "BIELORUSSIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 71.19,
    "forfaitTotaleValuta": 201.19,
    "indicativeRate": null,
    "localCurrency": "BYR",
    "currencyName": "Rublo"
  },
  {
    "code": "BOL",
    "name": "BOLIVIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 56.0,
    "forfaitTotaleValuta": 186.0,
    "indicativeRate": null,
    "localCurrency": "BOB",
    "currencyName": "Boliviano"
  },
  {
    "code": "BIH",
    "name": "BOSNIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 60.0,
    "forfaitTotaleValuta": 180.0,
    "indicativeRate": null,
    "localCurrency": "BAM",
    "currencyName": "Marco"
  },
  {
    "code": "RB",
    "name": "BOTSWANA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 60.49,
    "forfaitTotaleValuta": 170.49,
    "indicativeRate": null,
    "localCurrency": "BWP",
    "currencyName": "Pula"
  },
  {
    "code": "BR",
    "name": "BRASILE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 106.0,
    "forfaitTotaleValuta": 226.0,
    "indicativeRate": null,
    "localCurrency": "BRL",
    "currencyName": "Real"
  },
  {
    "code": "BG",
    "name": "BULGARIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 78.21,
    "forfaitTotaleValuta": 197.71,
    "indicativeRate": null,
    "localCurrency": "BGN",
    "currencyName": "Lev"
  },
  {
    "code": "BRK",
    "name": "BURKINA FASO",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 79.47,
    "forfaitTotaleValuta": 214.47,
    "indicativeRate": null,
    "localCurrency": "XOF",
    "currencyName": "Franco"
  },
  {
    "code": "RU",
    "name": "BURUNDI",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 54.0,
    "forfaitTotaleValuta": 194.0,
    "indicativeRate": null,
    "localCurrency": "BIF",
    "currencyName": "Franco"
  },
  {
    "code": "BRU",
    "name": "BRUNEI",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 65.71,
    "forfaitTotaleValuta": 210.71,
    "indicativeRate": null,
    "localCurrency": "BND",
    "currencyName": "Dollaro"
  },
  {
    "code": "K",
    "name": "CAMBOGIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 66.0,
    "forfaitTotaleValuta": 216.0,
    "indicativeRate": null,
    "localCurrency": "KHR",
    "currencyName": "Riel"
  },
  {
    "code": "CMR",
    "name": "CAMERUN",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 74.28,
    "forfaitTotaleValuta": 181.28,
    "indicativeRate": null,
    "localCurrency": "XAF",
    "currencyName": "Franco"
  },
  {
    "code": "CDN",
    "name": "CANADA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 136.0,
    "forfaitTotaleValuta": 291.0,
    "indicativeRate": null,
    "localCurrency": "CAD",
    "currencyName": "Dollaro"
  },
  {
    "code": "TCH",
    "name": "CHAD",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 86.39,
    "forfaitTotaleValuta": 196.39,
    "indicativeRate": null,
    "localCurrency": "XAF",
    "currencyName": "Franco"
  },
  {
    "code": "RCH",
    "name": "CILE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 88.0,
    "forfaitTotaleValuta": 213.0,
    "indicativeRate": null,
    "localCurrency": "CLP",
    "currencyName": "Peso"
  },
  {
    "code": "TJ",
    "name": "CINA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 121.39,
    "forfaitTotaleValuta": 261.39,
    "indicativeRate": 6.65,
    "localCurrency": "RMB",
    "currencyName": "Remimbi/Yuan"
  },
  {
    "code": "CY",
    "name": "CIPRO",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 77.0,
    "forfaitTotaleValuta": 179.5,
    "indicativeRate": null,
    "localCurrency": "CYP",
    "currencyName": "Sterlina"
  },
  {
    "code": "CO",
    "name": "COLOMBIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 102.85,
    "forfaitTotaleValuta": 270.85,
    "indicativeRate": null,
    "localCurrency": "COP",
    "currencyName": "Peso"
  },
  {
    "code": "RCB",
    "name": "CONGO",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 94.0,
    "forfaitTotaleValuta": 249.0,
    "indicativeRate": null,
    "localCurrency": "CDF",
    "currencyName": "Franco"
  },
  {
    "code": "KOR",
    "name": "COREA DEL NORD",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 68.0,
    "forfaitTotaleValuta": 206.0,
    "indicativeRate": null,
    "localCurrency": "KPW",
    "currencyName": "Won"
  },
  {
    "code": "ROK",
    "name": "COREA DEL SUD",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 138.0,
    "forfaitTotaleValuta": 288.0,
    "indicativeRate": null,
    "localCurrency": "KRW",
    "currencyName": "Won"
  },
  {
    "code": "CI",
    "name": "COSTA D'AVORIO",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 77.12,
    "forfaitTotaleValuta": 197.12,
    "indicativeRate": null,
    "localCurrency": "XOF",
    "currencyName": "Franco"
  },
  {
    "code": "CR",
    "name": "COSTARICA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 73.36,
    "forfaitTotaleValuta": 198.36,
    "indicativeRate": null,
    "localCurrency": "CRC",
    "currencyName": "Colon"
  },
  {
    "code": "HR",
    "name": "CROAZIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 90.21,
    "forfaitTotaleValuta": 221.71,
    "indicativeRate": null,
    "localCurrency": "HRK",
    "currencyName": ""
  },
  {
    "code": "C",
    "name": "CUBA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 78.4,
    "forfaitTotaleValuta": 203.4,
    "indicativeRate": null,
    "localCurrency": "CUP",
    "currencyName": "Peso"
  },
  {
    "code": "DK",
    "name": "DANIMARCA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 124.26,
    "forfaitTotaleValuta": 269.26,
    "indicativeRate": null,
    "localCurrency": "DKK",
    "currencyName": "Korona"
  },
  {
    "code": "EC",
    "name": "ECUADOR",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 79.6,
    "forfaitTotaleValuta": 204.6,
    "indicativeRate": null,
    "localCurrency": "USD",
    "currencyName": "Dollaro"
  },
  {
    "code": "ET",
    "name": "EGITTO",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 84.0,
    "forfaitTotaleValuta": 184.0,
    "indicativeRate": null,
    "localCurrency": "EGP",
    "currencyName": "Lira/Pound"
  },
  {
    "code": "ES",
    "name": "EL SALVADOR",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 66.0,
    "forfaitTotaleValuta": 206.0,
    "indicativeRate": null,
    "localCurrency": "SVC",
    "currencyName": "Colon"
  },
  {
    "code": "EAR",
    "name": "EMIRATI ARABI UNITI",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 124.31,
    "forfaitTotaleValuta": 294.31,
    "indicativeRate": null,
    "localCurrency": "AED",
    "currencyName": "Dirham"
  },
  {
    "code": "ERT",
    "name": "ERITREA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 62.0,
    "forfaitTotaleValuta": 167.0,
    "indicativeRate": null,
    "localCurrency": "ERN",
    "currencyName": "Nakfa"
  },
  {
    "code": "ESN",
    "name": "ESTONIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 69.6,
    "forfaitTotaleValuta": 174.6,
    "indicativeRate": null,
    "localCurrency": "EEK",
    "currencyName": "Kroon"
  },
  {
    "code": "ETH",
    "name": "ETIOPIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 62.0,
    "forfaitTotaleValuta": 202.0,
    "indicativeRate": null,
    "localCurrency": "ETP",
    "currencyName": "Birr"
  },
  {
    "code": "YU",
    "name": "FEDERAZIONE YUGOSLAVA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 61.39,
    "forfaitTotaleValuta": 201.39,
    "indicativeRate": null,
    "localCurrency": "",
    "currencyName": ""
  },
  {
    "code": "RP",
    "name": "FILIPPINE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 100.23,
    "forfaitTotaleValuta": 245.23,
    "indicativeRate": null,
    "localCurrency": "PHP",
    "currencyName": "Peso"
  },
  {
    "code": "SF",
    "name": "FINLANDIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 122.0,
    "forfaitTotaleValuta": 250.5,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "F",
    "name": "FRANCIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 100.0,
    "forfaitTotaleValuta": 245.0,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "GAB",
    "name": "GABON",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 144.5,
    "forfaitTotaleValuta": 294.5,
    "indicativeRate": null,
    "localCurrency": "XAF",
    "currencyName": "Franco"
  },
  {
    "code": "WAG",
    "name": "GAMBIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 50.0,
    "forfaitTotaleValuta": 145.0,
    "indicativeRate": null,
    "localCurrency": "GMD",
    "currencyName": "Dalasi"
  },
  {
    "code": "GRG",
    "name": "GEORGIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 73.24,
    "forfaitTotaleValuta": 218.24,
    "indicativeRate": null,
    "localCurrency": "GEL",
    "currencyName": "Lari"
  },
  {
    "code": "D",
    "name": "GERMANIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 94.0,
    "forfaitTotaleValuta": 220.5,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "GH",
    "name": "GHANA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 68.0,
    "forfaitTotaleValuta": 238.0,
    "indicativeRate": null,
    "localCurrency": "GHC",
    "currencyName": "Cedi"
  },
  {
    "code": "JA",
    "name": "GIAMAICA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 88.0,
    "forfaitTotaleValuta": 239.5,
    "indicativeRate": null,
    "localCurrency": "JMD",
    "currencyName": "Dollaro"
  },
  {
    "code": "J",
    "name": "GIAPPONE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 168.33,
    "forfaitTotaleValuta": 333.33,
    "indicativeRate": null,
    "localCurrency": "JPY",
    "currencyName": "Yen"
  },
  {
    "code": "GBZ",
    "name": "GIBILTERRA",
    "baseCurrency": "GBP",
    "forfaitMistoValuta": 69.5,
    "forfaitTotaleValuta": 184.5,
    "indicativeRate": null,
    "localCurrency": "GIP",
    "currencyName": "Sterlina/Pound"
  },
  {
    "code": "DJ",
    "name": "GIBUTI",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 96.0,
    "forfaitTotaleValuta": 241.0,
    "indicativeRate": null,
    "localCurrency": "DJF",
    "currencyName": "Franco"
  },
  {
    "code": "HKJ",
    "name": "GIORDANIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 132.58,
    "forfaitTotaleValuta": 252.58,
    "indicativeRate": null,
    "localCurrency": "JOD",
    "currencyName": "Dinaro"
  },
  {
    "code": "GB",
    "name": "GRAN BRETAGNA",
    "baseCurrency": "GBP",
    "forfaitMistoValuta": 87.8,
    "forfaitTotaleValuta": 225.8,
    "indicativeRate": 0.726,
    "localCurrency": "GBP",
    "currencyName": ""
  },
  {
    "code": "GR",
    "name": "GRECIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 82.0,
    "forfaitTotaleValuta": 197.0,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "GDA",
    "name": "GUADALUPA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 89.4,
    "forfaitTotaleValuta": 192.9,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "GCA",
    "name": "GUATEMALA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 77.13,
    "forfaitTotaleValuta": 192.13,
    "indicativeRate": null,
    "localCurrency": "GTQ",
    "currencyName": "Quetzal"
  },
  {
    "code": "GN",
    "name": "GUINEA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 81.6,
    "forfaitTotaleValuta": 191.6,
    "indicativeRate": null,
    "localCurrency": "GNF",
    "currencyName": "Franco"
  },
  {
    "code": "GNB",
    "name": "GUINEA BISSAU",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 80.0,
    "forfaitTotaleValuta": 260.0,
    "indicativeRate": null,
    "localCurrency": "XOF",
    "currencyName": "Franco"
  },
  {
    "code": "GQ",
    "name": "GUINEA EQUATORIALE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 88.0,
    "forfaitTotaleValuta": 188.0,
    "indicativeRate": null,
    "localCurrency": "XAF",
    "currencyName": "Franco"
  },
  {
    "code": "GUY",
    "name": "GUYANA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 61.3,
    "forfaitTotaleValuta": 181.3,
    "indicativeRate": null,
    "localCurrency": "GYD",
    "currencyName": "Dollaro"
  },
  {
    "code": "GYF",
    "name": "GUYANA FRANCESE",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": null,
    "forfaitTotaleValuta": null,
    "indicativeRate": null,
    "localCurrency": "",
    "currencyName": ""
  },
  {
    "code": "RH",
    "name": "HAITI",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 111.52,
    "forfaitTotaleValuta": 239.02,
    "indicativeRate": null,
    "localCurrency": "HTG",
    "currencyName": "Gourde"
  },
  {
    "code": "HON",
    "name": "HONDURAS",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 64.0,
    "forfaitTotaleValuta": 184.0,
    "indicativeRate": null,
    "localCurrency": "HNL",
    "currencyName": "Lempira"
  },
  {
    "code": "HK",
    "name": "HONG KONG",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 118.0,
    "forfaitTotaleValuta": 283.0,
    "indicativeRate": 8.377,
    "localCurrency": "HKD",
    "currencyName": "Dollaro"
  },
  {
    "code": "IND",
    "name": "INDIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 83.0,
    "forfaitTotaleValuta": 214.5,
    "indicativeRate": null,
    "localCurrency": "INR",
    "currencyName": "Rupia"
  },
  {
    "code": "RI",
    "name": "INDONESIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 87.27,
    "forfaitTotaleValuta": 207.27,
    "indicativeRate": null,
    "localCurrency": "IDR",
    "currencyName": "Rupia"
  },
  {
    "code": "IR",
    "name": "IRAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 78.0,
    "forfaitTotaleValuta": 248.0,
    "indicativeRate": null,
    "localCurrency": "IRR",
    "currencyName": "Rial"
  },
  {
    "code": "IRQ",
    "name": "IRAQ",
    "baseCurrency": "USD",
    "forfaitMistoValuta": null,
    "forfaitTotaleValuta": null,
    "indicativeRate": null,
    "localCurrency": "IQD",
    "currencyName": "Dinaro"
  },
  {
    "code": "IRL",
    "name": "IRLANDA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 94.0,
    "forfaitTotaleValuta": 219.0,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "IS",
    "name": "ISLANDA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 98.44,
    "forfaitTotaleValuta": 208.94,
    "indicativeRate": null,
    "localCurrency": "ISK",
    "currencyName": "Korona"
  },
  {
    "code": "ICV",
    "name": "ISOLE CAPO VERDE",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 70.0,
    "forfaitTotaleValuta": 175.0,
    "indicativeRate": null,
    "localCurrency": "CVE",
    "currencyName": "Escudo"
  },
  {
    "code": "CAY",
    "name": "ISOLE CAYMAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 114.0,
    "forfaitTotaleValuta": 244.0,
    "indicativeRate": null,
    "localCurrency": "KYD",
    "currencyName": "Dollaro"
  },
  {
    "code": "ICM",
    "name": "ISOLE COMORE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 80.0,
    "forfaitTotaleValuta": 190.0,
    "indicativeRate": null,
    "localCurrency": "KMF",
    "currencyName": "Franco"
  },
  {
    "code": "FJI",
    "name": "ISOLE FIJI",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 86.0,
    "forfaitTotaleValuta": 191.0,
    "indicativeRate": null,
    "localCurrency": "FJD",
    "currencyName": "Dollaro"
  },
  {
    "code": "MDV",
    "name": "ISOLE MALDIVE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 74.0,
    "forfaitTotaleValuta": 224.0,
    "indicativeRate": null,
    "localCurrency": "MVR",
    "currencyName": "Rufiyaa"
  },
  {
    "code": "MS",
    "name": "ISOLE MAURITIUS",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 86.0,
    "forfaitTotaleValuta": 220.5,
    "indicativeRate": null,
    "localCurrency": "MUR",
    "currencyName": "Rupie"
  },
  {
    "code": "VRG",
    "name": "ISOLE VERGINI BRITANNICHE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 88.0,
    "forfaitTotaleValuta": 238.0,
    "indicativeRate": null,
    "localCurrency": "USD",
    "currencyName": "Dollaro"
  },
  {
    "code": "IL",
    "name": "ISRAELE",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 99.94,
    "forfaitTotaleValuta": 239.94,
    "indicativeRate": null,
    "localCurrency": "ILS",
    "currencyName": "Shekel"
  },
  {
    "code": "FL",
    "name": "LIECHTENSTEIN",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 102.48,
    "forfaitTotaleValuta": 254.98,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "KZK",
    "name": "KAZAKISTAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 90.44,
    "forfaitTotaleValuta": 255.94,
    "indicativeRate": null,
    "localCurrency": "KZT",
    "currencyName": "Tenge"
  },
  {
    "code": "EAK",
    "name": "KENIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 87.98,
    "forfaitTotaleValuta": 217.98,
    "indicativeRate": null,
    "localCurrency": "KES",
    "currencyName": "Scellino"
  },
  {
    "code": "KS",
    "name": "KIRGHIZISTAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 76.0,
    "forfaitTotaleValuta": 216.0,
    "indicativeRate": null,
    "localCurrency": "KGS",
    "currencyName": "Som"
  },
  {
    "code": "KWT",
    "name": "KUWAIT",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 106.0,
    "forfaitTotaleValuta": 266.0,
    "indicativeRate": null,
    "localCurrency": "KWD",
    "currencyName": "Dinaro"
  },
  {
    "code": "LAO",
    "name": "LAOS",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 78.0,
    "forfaitTotaleValuta": 228.0,
    "indicativeRate": null,
    "localCurrency": "LAK",
    "currencyName": "Kip"
  },
  {
    "code": "LTV",
    "name": "LETTONIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 83.27,
    "forfaitTotaleValuta": 193.27,
    "indicativeRate": null,
    "localCurrency": "LVL",
    "currencyName": "Lats"
  },
  {
    "code": "RL",
    "name": "LIBANO",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 97.08,
    "forfaitTotaleValuta": 220.58,
    "indicativeRate": null,
    "localCurrency": "LBP",
    "currencyName": "Lira/Pound"
  },
  {
    "code": "LB",
    "name": "LIBERIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 82.0,
    "forfaitTotaleValuta": 242.0,
    "indicativeRate": null,
    "localCurrency": "LRD",
    "currencyName": "Dollaro"
  },
  {
    "code": "LAR",
    "name": "LIBIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 79.24,
    "forfaitTotaleValuta": 215.74,
    "indicativeRate": null,
    "localCurrency": "LYD",
    "currencyName": "Dinaro"
  },
  {
    "code": "LT",
    "name": "LITUANIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 68.93,
    "forfaitTotaleValuta": 168.93,
    "indicativeRate": null,
    "localCurrency": "LTL",
    "currencyName": "Lita"
  },
  {
    "code": "L",
    "name": "LUSSEMBURGO",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 90.0,
    "forfaitTotaleValuta": 219.0,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "MK",
    "name": "MACEDONIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 60.61,
    "forfaitTotaleValuta": 191.61,
    "indicativeRate": null,
    "localCurrency": "MKD",
    "currencyName": "Dinaro"
  },
  {
    "code": "RM",
    "name": "MADAGASCAR",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 48.0,
    "forfaitTotaleValuta": 198.0,
    "indicativeRate": null,
    "localCurrency": "MGA",
    "currencyName": "Ariary"
  },
  {
    "code": "MW",
    "name": "MALAWI",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 42.0,
    "forfaitTotaleValuta": 192.0,
    "indicativeRate": null,
    "localCurrency": "MWK",
    "currencyName": "Kwacha"
  },
  {
    "code": "MAL",
    "name": "MALAYSIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 83.8,
    "forfaitTotaleValuta": 188.8,
    "indicativeRate": 3.987,
    "localCurrency": "MYR",
    "currencyName": "Ringgit"
  },
  {
    "code": "RMM",
    "name": "MALI",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 78.0,
    "forfaitTotaleValuta": 203.0,
    "indicativeRate": null,
    "localCurrency": "XOF",
    "currencyName": "Franco"
  },
  {
    "code": "M",
    "name": "MALTA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 76.0,
    "forfaitTotaleValuta": 176.0,
    "indicativeRate": null,
    "localCurrency": "MTL",
    "currencyName": "Lira"
  },
  {
    "code": "MA",
    "name": "MAROCCO",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 59.22,
    "forfaitTotaleValuta": 159.22,
    "indicativeRate": null,
    "localCurrency": "MAD",
    "currencyName": "Dirham"
  },
  {
    "code": "RIM",
    "name": "MAURITANIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 68.08,
    "forfaitTotaleValuta": 188.08,
    "indicativeRate": null,
    "localCurrency": "MRO",
    "currencyName": "Ouguiya"
  },
  {
    "code": "MEX",
    "name": "MESSICO",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 78.0,
    "forfaitTotaleValuta": 202.0,
    "indicativeRate": null,
    "localCurrency": "MXN",
    "currencyName": "Peso"
  },
  {
    "code": "MD",
    "name": "MOLDAVIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 72.0,
    "forfaitTotaleValuta": 192.0,
    "indicativeRate": null,
    "localCurrency": "MDL",
    "currencyName": "Leu"
  },
  {
    "code": "MGL",
    "name": "MONGOLIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 60.0,
    "forfaitTotaleValuta": 190.0,
    "indicativeRate": null,
    "localCurrency": "MNT",
    "currencyName": "Tugrik"
  },
  {
    "code": "MOC",
    "name": "MOZAMBICO",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 76.0,
    "forfaitTotaleValuta": 236.5,
    "indicativeRate": null,
    "localCurrency": "MZN",
    "currencyName": "Metical"
  },
  {
    "code": "BUR",
    "name": "MYANMAR - BIRMANIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 76.0,
    "forfaitTotaleValuta": 226.0,
    "indicativeRate": null,
    "localCurrency": "MMK",
    "currencyName": "Kyat"
  },
  {
    "code": "SWA",
    "name": "NAMIBIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 68.85,
    "forfaitTotaleValuta": 181.35,
    "indicativeRate": null,
    "localCurrency": "NAD",
    "currencyName": "Namibia"
  },
  {
    "code": "NEP",
    "name": "NEPAL",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 64.0,
    "forfaitTotaleValuta": 159.0,
    "indicativeRate": null,
    "localCurrency": "NPR",
    "currencyName": "Rupia"
  },
  {
    "code": "NIC",
    "name": "NICARAGUA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 62.0,
    "forfaitTotaleValuta": 192.0,
    "indicativeRate": null,
    "localCurrency": "NIO",
    "currencyName": "Cordoba"
  },
  {
    "code": "RN",
    "name": "NIGER",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 62.0,
    "forfaitTotaleValuta": 202.0,
    "indicativeRate": null,
    "localCurrency": "XOF",
    "currencyName": "Franco"
  },
  {
    "code": "WAN",
    "name": "NIGERIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 100.0,
    "forfaitTotaleValuta": 310.0,
    "indicativeRate": null,
    "localCurrency": "NGN",
    "currencyName": "Naira"
  },
  {
    "code": "N",
    "name": "NORVEGIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 171.69,
    "forfaitTotaleValuta": 311.69,
    "indicativeRate": null,
    "localCurrency": "NOK",
    "currencyName": "Korona"
  },
  {
    "code": "NZ",
    "name": "NUOVA ZELANDA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 121.41,
    "forfaitTotaleValuta": 251.41,
    "indicativeRate": null,
    "localCurrency": "NZD",
    "currencyName": "Dollaro"
  },
  {
    "code": "NL",
    "name": "OLANDA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 82.0,
    "forfaitTotaleValuta": 207.0,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "OM",
    "name": "OMAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 140.32,
    "forfaitTotaleValuta": 298.82,
    "indicativeRate": null,
    "localCurrency": "OMR",
    "currencyName": "Rial"
  },
  {
    "code": "PAK",
    "name": "PAKISTAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 46.0,
    "forfaitTotaleValuta": 176.0,
    "indicativeRate": null,
    "localCurrency": "PKR",
    "currencyName": "Rupia"
  },
  {
    "code": "PA",
    "name": "PANAMA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 76.0,
    "forfaitTotaleValuta": 176.0,
    "indicativeRate": null,
    "localCurrency": "PAB",
    "currencyName": "Balboa"
  },
  {
    "code": "PNG",
    "name": "PAPUA NUOVA GUINEA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 90.0,
    "forfaitTotaleValuta": 260.0,
    "indicativeRate": null,
    "localCurrency": "PGK",
    "currencyName": "Kina"
  },
  {
    "code": "PY",
    "name": "PARAGUAY",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 60.0,
    "forfaitTotaleValuta": 170.0,
    "indicativeRate": null,
    "localCurrency": "PYG",
    "currencyName": "Guarani"
  },
  {
    "code": "PE",
    "name": "PERU'",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 76.0,
    "forfaitTotaleValuta": 196.0,
    "indicativeRate": null,
    "localCurrency": "PEN",
    "currencyName": "Nuevo Sol"
  },
  {
    "code": "FP",
    "name": "POLINESIA FRANCESE",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 105.32,
    "forfaitTotaleValuta": 245.32,
    "indicativeRate": null,
    "localCurrency": "XPF",
    "currencyName": "Franco"
  },
  {
    "code": "PL",
    "name": "POLONIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 68.37,
    "forfaitTotaleValuta": 193.37,
    "indicativeRate": null,
    "localCurrency": "PLN",
    "currencyName": "Zloty"
  },
  {
    "code": "P",
    "name": "PORTOGALLO",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 72.0,
    "forfaitTotaleValuta": 192.0,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "MC",
    "name": "PRINCIPATO DI MONACO",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 112.0,
    "forfaitTotaleValuta": 259.5,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "QAT",
    "name": "QATAR",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 136.23,
    "forfaitTotaleValuta": 246.23,
    "indicativeRate": null,
    "localCurrency": "QAR",
    "currencyName": "Rial"
  },
  {
    "code": "ZRE",
    "name": "REP. DEM. DEL CONGO",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 104.0,
    "forfaitTotaleValuta": 294.0,
    "indicativeRate": null,
    "localCurrency": "CDF",
    "currencyName": "Franco"
  },
  {
    "code": "CS",
    "name": "REPUBBLICA CECA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 78.0,
    "forfaitTotaleValuta": 203.0,
    "indicativeRate": null,
    "localCurrency": "CZK",
    "currencyName": "Korona"
  },
  {
    "code": "RCA",
    "name": "REPUBBLICA CENTRAFRICANA  EUR",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 160.0,
    "forfaitTotaleValuta": null,
    "indicativeRate": null,
    "localCurrency": "XAF",
    "currencyName": "Franco"
  },
  {
    "code": "RSM",
    "name": "REPUBBLICA DI SAN MARINO",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": null,
    "forfaitTotaleValuta": null,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "DOM",
    "name": "REPUBBLICA DOMINICANA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 90.0,
    "forfaitTotaleValuta": 190.0,
    "indicativeRate": null,
    "localCurrency": "DOP",
    "currencyName": "Peso"
  },
  {
    "code": "RO",
    "name": "ROMANIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 66.0,
    "forfaitTotaleValuta": 203.5,
    "indicativeRate": null,
    "localCurrency": "ROL",
    "currencyName": "Leu"
  },
  {
    "code": "SU",
    "name": "RUSSIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 160.0,
    "forfaitTotaleValuta": 350.0,
    "indicativeRate": null,
    "localCurrency": "RUB",
    "currencyName": "Rublo"
  },
  {
    "code": "RWA",
    "name": "RWANDA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 70.23,
    "forfaitTotaleValuta": 210.23,
    "indicativeRate": null,
    "localCurrency": "RWF",
    "currencyName": "Franco"
  },
  {
    "code": "STL",
    "name": "SANTA LUCIA (PICCOLE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 106.66,
    "forfaitTotaleValuta": 226.66,
    "indicativeRate": null,
    "localCurrency": "XCD",
    "currencyName": "Dollaro"
  },
  {
    "code": "STP",
    "name": "SAO TOME' E PRINCIPE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 88.6,
    "forfaitTotaleValuta": 258.6,
    "indicativeRate": null,
    "localCurrency": "STD",
    "currencyName": "Dobra"
  },
  {
    "code": "SN",
    "name": "SENEGAL",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 64.0,
    "forfaitTotaleValuta": 169.0,
    "indicativeRate": null,
    "localCurrency": "XOF",
    "currencyName": "Franco"
  },
  {
    "code": "SB",
    "name": "SERBIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 61.39,
    "forfaitTotaleValuta": 201.39,
    "indicativeRate": null,
    "localCurrency": "RSD",
    "currencyName": "Dinaro"
  },
  {
    "code": "SY",
    "name": "SEYCHELLES",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 72.0,
    "forfaitTotaleValuta": 252.0,
    "indicativeRate": null,
    "localCurrency": "SCR",
    "currencyName": "Rupie"
  },
  {
    "code": "WAL",
    "name": "SIERRA LEONE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 88.18,
    "forfaitTotaleValuta": 237.68,
    "indicativeRate": null,
    "localCurrency": "SLL",
    "currencyName": "Leone"
  },
  {
    "code": "SGP",
    "name": "SINGAPORE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 145.87,
    "forfaitTotaleValuta": 290.37,
    "indicativeRate": null,
    "localCurrency": "SGD",
    "currencyName": "Dollaro"
  },
  {
    "code": "SYR",
    "name": "SIRIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 54.9,
    "forfaitTotaleValuta": 199.9,
    "indicativeRate": null,
    "localCurrency": "SYP",
    "currencyName": "Sterlina/Pound"
  },
  {
    "code": "SK",
    "name": "SLOVACCHIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 72.0,
    "forfaitTotaleValuta": 192.0,
    "indicativeRate": null,
    "localCurrency": "SKK",
    "currencyName": "Korona"
  },
  {
    "code": "SLO",
    "name": "SLOVENIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 70.0,
    "forfaitTotaleValuta": 190.0,
    "indicativeRate": null,
    "localCurrency": "SIT",
    "currencyName": "Tallero"
  },
  {
    "code": "SOM",
    "name": "SOMALIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": null,
    "forfaitTotaleValuta": null,
    "indicativeRate": null,
    "localCurrency": "SOS",
    "currencyName": "Scellino"
  },
  {
    "code": "E",
    "name": "SPAGNA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 86.0,
    "forfaitTotaleValuta": 221.0,
    "indicativeRate": null,
    "localCurrency": "EUR",
    "currencyName": ""
  },
  {
    "code": "CL",
    "name": "SRI LANKA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 64.0,
    "forfaitTotaleValuta": 174.0,
    "indicativeRate": null,
    "localCurrency": "LKR",
    "currencyName": "Rupia"
  },
  {
    "code": "USA",
    "name": "U.S.A. A",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 74.24,
    "forfaitTotaleValuta": 186.24,
    "indicativeRate": null,
    "localCurrency": "USD",
    "currencyName": "Dollaro"
  },
  {
    "code": "USB",
    "name": "U.S.A. B",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 92.8,
    "forfaitTotaleValuta": 232.8,
    "indicativeRate": null,
    "localCurrency": "USD",
    "currencyName": "Dollaro"
  },
  {
    "code": "USC",
    "name": "U.S.A. C",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 116.0,
    "forfaitTotaleValuta": 291.0,
    "indicativeRate": null,
    "localCurrency": "USD",
    "currencyName": "Dollaro"
  },
  {
    "code": "ZA",
    "name": "SUD AFRICA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 56.0,
    "forfaitTotaleValuta": 186.0,
    "indicativeRate": null,
    "localCurrency": "ZAR",
    "currencyName": "Rand"
  },
  {
    "code": "SUD",
    "name": "SUDAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 47.63,
    "forfaitTotaleValuta": 237.63,
    "indicativeRate": null,
    "localCurrency": "SDG",
    "currencyName": "Sterlina/Pound"
  },
  {
    "code": "SME",
    "name": "SURINAME",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 95.15,
    "forfaitTotaleValuta": 195.15,
    "indicativeRate": null,
    "localCurrency": "SRD",
    "currencyName": "Dollaro"
  },
  {
    "code": "S",
    "name": "SVEZIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 112.0,
    "forfaitTotaleValuta": 287.0,
    "indicativeRate": null,
    "localCurrency": "SEK",
    "currencyName": "Korona"
  },
  {
    "code": "CH",
    "name": "SVIZZERA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 120.75,
    "forfaitTotaleValuta": 290.75,
    "indicativeRate": null,
    "localCurrency": "CHF",
    "currencyName": "Franco"
  },
  {
    "code": "TJK",
    "name": "TAGIKISTHAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 104.0,
    "forfaitTotaleValuta": 237.0,
    "indicativeRate": null,
    "localCurrency": "TJS",
    "currencyName": "Somoni"
  },
  {
    "code": "RC",
    "name": "TAIWAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 86.17,
    "forfaitTotaleValuta": 216.17,
    "indicativeRate": null,
    "localCurrency": "TWD",
    "currencyName": "Dollaro"
  },
  {
    "code": "EAT",
    "name": "TANZANIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 70.0,
    "forfaitTotaleValuta": 218.5,
    "indicativeRate": null,
    "localCurrency": "TZS",
    "currencyName": "Scellino"
  },
  {
    "code": "T",
    "name": "THAILANDIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 113.8,
    "forfaitTotaleValuta": 199.3,
    "indicativeRate": null,
    "localCurrency": "THB",
    "currencyName": "Baht"
  },
  {
    "code": "TG",
    "name": "TOGO",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 65.67,
    "forfaitTotaleValuta": 170.67,
    "indicativeRate": null,
    "localCurrency": "XOF",
    "currencyName": "Franco"
  },
  {
    "code": "TT",
    "name": "TRINIDAD E TOBAGO",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 120.0,
    "forfaitTotaleValuta": 290.0,
    "indicativeRate": null,
    "localCurrency": "TTD",
    "currencyName": "Dollaro"
  },
  {
    "code": "TN",
    "name": "TUNISIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 58.58,
    "forfaitTotaleValuta": 158.58,
    "indicativeRate": null,
    "localCurrency": "TND",
    "currencyName": "Dinaro"
  },
  {
    "code": "TR",
    "name": "TURCHIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 94.0,
    "forfaitTotaleValuta": 224.0,
    "indicativeRate": null,
    "localCurrency": "TRY",
    "currencyName": "Lira"
  },
  {
    "code": "UA",
    "name": "UCRAINA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 112.74,
    "forfaitTotaleValuta": 257.74,
    "indicativeRate": null,
    "localCurrency": "UAH",
    "currencyName": "Grivnia"
  },
  {
    "code": "EAU",
    "name": "UGANDA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 60.53,
    "forfaitTotaleValuta": 205.53,
    "indicativeRate": null,
    "localCurrency": "UGX",
    "currencyName": "Scellino"
  },
  {
    "code": "H",
    "name": "UNGHERIA",
    "baseCurrency": "EUR",
    "forfaitMistoValuta": 62.81,
    "forfaitTotaleValuta": 197.81,
    "indicativeRate": null,
    "localCurrency": "HUF",
    "currencyName": ""
  },
  {
    "code": "ROU",
    "name": "URUGUAY",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 90.0,
    "forfaitTotaleValuta": 190.0,
    "indicativeRate": null,
    "localCurrency": "UYU",
    "currencyName": "Peso"
  },
  {
    "code": "UZB",
    "name": "UZBEKISTAN",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 65.98,
    "forfaitTotaleValuta": 190.98,
    "indicativeRate": null,
    "localCurrency": "UZM",
    "currencyName": "Som"
  },
  {
    "code": "VAN",
    "name": "VANUATU",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 118.0,
    "forfaitTotaleValuta": 268.0,
    "indicativeRate": null,
    "localCurrency": "VUV",
    "currencyName": "Vatu"
  },
  {
    "code": "YV",
    "name": "VENEZUELA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 222.6,
    "forfaitTotaleValuta": 362.6,
    "indicativeRate": null,
    "localCurrency": "VEB",
    "currencyName": "Bolivar"
  },
  {
    "code": "VN",
    "name": "VIETNAM",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 70.0,
    "forfaitTotaleValuta": 191.0,
    "indicativeRate": null,
    "localCurrency": "VND",
    "currencyName": "Dong"
  },
  {
    "code": "YMN",
    "name": "YEMEN DEL NORD (REPU",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 79.67,
    "forfaitTotaleValuta": 219.67,
    "indicativeRate": null,
    "localCurrency": "YER",
    "currencyName": "Rial"
  },
  {
    "code": "ADN",
    "name": "YEMEN,REPUBBLICA POP",
    "baseCurrency": "USD",
    "forfaitMistoValuta": 79.67,
    "forfaitTotaleValuta": 219.67,
    "indicativeRate": null,
    "localCurrency": "YER",
    "currencyName": "Rial"
  },
  {
    "code": "Z",
    "name": "ZAMBIA",
    "baseCurrency": "USD",
    "forfaitMistoValuta": null,
    "forfaitTotaleValuta": null,
    "indicativeRate": null,
    "localCurrency": "ZMK",
    "currencyName": "Kwacha"
  },
  {
    "code": "RSR",
    "name": "ZIMBABWE",
    "baseCurrency": "USD",
    "forfaitMistoValuta": null,
    "forfaitTotaleValuta": null,
    "indicativeRate": null,
    "localCurrency": "ZWL",
    "currencyName": "Dollaro"
  }
];

  const api = {
    RAI_LOGO_DATA_URI,
    ITALY_COUNTRY,
    DEFAULT_ITALY_RATES,
    DEFAULT_EXCHANGE_RATES,
    DEFAULT_MEAL_CUTOFFS,
    ITALY_MM_CITIES,
    USA_BANDS,
    MEZZI_TRASPORTO,
    NOTE_PASTO,
    NOTE_PERNOTTO,
    NOTE_COLAZIONE,
    RIENTRO_OPTIONS,
    DEFAULT_COUNTRIES,
  };

  root.TrasferteDefaults = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
