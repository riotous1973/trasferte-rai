# Gestione Trasferte RAI — Web App (MOD. 31426)

Applicazione web offline che sostituisce il foglio Excel `00001_Trasferte_Nuovo.xlsm` con salvataggio automatico in tempo reale, compilazione guidata delle spese, calcolo immediato della **Nota Spese**, stampa fedele del **Modulo 1 (`MOD.31426-`)** su formato A4 e gestione completa di **Massimali & Codici Paesi**.

## Come si usa

1. **Avvio immediato**: fai doppio clic su [`index.html`](index.html) per aprirla nel browser (Chrome, Edge o Firefox). Non richiede server, installazioni né connessione a Internet.
2. **Salvataggio automatico in tempo reale e "Salva con nome"**: ogni modifica viene salvata istantaneamente nella memoria locale del browser (`localStorage`). Puoi dare un **Nome / Riferimento** alla trasferta direttamente nella scheda Compilazione oppure cliccare **Salva con nome** nella barra in alto (per rinominarla, salvarne una copia separata, impostare lo stato *In corso / Completata* o scaricare subito il file JSON), poi cliccare **+ Nuova** per iniziare la trasferta successiva senza perdere nulla.
3. **Compilazione (`1. Compilazione`)**:
   - Inserisci un **Nome / Riferimento Trasferta** (solo per il tuo archivio, non stampato sul Modulo 1), Matricola, Nominativo, Autorizzazione di Viaggio e le date/ore di **Trasferta 1** (e opzionali 2 e 3).
   - Se vai all'estero, aggiungi i paesi visitati in **Paesi Visitati & Cambi Valuta** inserendo gli importi cambiati e le eventuali commissioni.
   - Compila le righe giornaliere generate automaticamente (Pranzo, Cena, Pernottamento, Colazione), i **Biglietti di Viaggio** e le **Spese Varie Documentate**.
   - Per provare subito la compilazione e la stampa, usa il pulsante **Carica Esempio**.
4. **Riepilogo (`2. Nota Spese`)**: verifica il dettaglio Piè di Lista / Forfait, i totali diarie, le spese documentate, gli anticipi, il **Residuo Netto a Pagare** e il controllo cumulativo del massimale pasti Italia.
5. **Stampa Ufficiale (`3. Modulo 1 / Stampa`)**:
   - Mostra la distinta **MOD.31426-** esattamente nella griglia ufficiale (con supporto automatico per Modulo 1, 2 e 3 oltre i 33 giorni o le 8 spese varie).
   - Clicca **Stampa / Salva PDF** (oppure **Stampa Modulo 1** nella barra superiore) e imposta la stampante su **A4 Verticale**, **margini predefiniti o minimi**.
6. **Aggiornamento Massimali (`4. Massimali & Codici Paesi`)**:
   - Aggiorna i cambi ufficiali **Banca d'Italia** (`USD` e `GBP`), i massimali e forfait **Italia (`IT`)**, e tutti i **187 paesi esteri** (puoi modificare valori, aggiungere nuovi codici, esportare/importare JSON o CSV).
7. **Gestione Multi-Trasferta (`5. Archivio`)**:
   - Elenca tutte le trasferte salvate con nome, stato (*In corso* / *Completata*), periodo, paesi e totali. Puoi cercare, riaprire, stampare, rinominare, duplicare, esportare tutto l'archivio o singole trasferte.

## Backup dei dati

I dati salvati nel browser restano sul PC e sul browser in uso. Usa **Esporta JSON** nella barra superiore (o nella scheda Massimali) per salvare una copia di sicurezza su disco o trasferire i dati su un altro computer con **Importa JSON**.
