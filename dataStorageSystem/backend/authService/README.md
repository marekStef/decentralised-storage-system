# Auth Service
## Service for authentication and authorisation

This is the component responsible for making incoming data trusted before they continue on their way to `DataStorage` component.

### Setup a Spusteni

#### .env uprava

V `.env` souboru je podstatni klic `DATA_STORAGE_URL`. V pripade, ze se menil port v projektu `dataStorage`, je nutno tuhle zmenu reflektovat i zde v `.env` (vice informaci v README komponenty `dataStorage` [zde](../dataStorage/README.md)).

V `.env` souboru je pro spusteni tehle komponenty jeste potrebny klic `AUTH_SERVICE_PORT=3000`. V pripade, ze `authService` komponenta nemuze byt spustena pod tymto portom, je nutno ho zmenit.

V pripade, ze je nutno menit port tehle komponenty a uzivatel chce pouzit export requestov pro `PostMan` program, tuhle zmenu je nutno aplikovat i tam v sekcii `Environment`. 

#### Spusteni

##### Instalace

Pro nainstalovani vsech dependencies je nutno spustit:

```bash
npm install
```

##### Inicializace

Ted je absolutne **podstatni**, aby se pred `npm run start` nejprve spustil `npm run initialise_service`. Tenhle skript je totiz zodpovedny za ulozeni `root` profilu eventov. Pokud appka chce zaregistrovat novy profil pro jeji eventy, tenhle novy profil musi mit v sobe nastaveny 'root' profil prave ten, ktery je nasetupovany tymhle skriptem. 

Spusteni tohohle skriptu vyuziva `dataStorage`, teda pred spustenim tohto skriptu je **nutno** mit uz plne bezici `dataStorage` komponentu.

Spusteni tohohle skriptu nelze provezt vice nez 1 krat (profily musi byt unique). Pro opatovne spusteni je nutno deletovat celej `dataStorage` (vice informaci [zde](../dataStorage/README.md#delete)).

##### Spusteni

Pak jiz muzeme nastartovat `authService`:

```bash
npm run start
```

##### Pouziti

`AuthService` je v tomto pripade ta vychozi komponenta, s kterou je momentalne mozne komunikovat. Tato komponenta overuje jednotlive eventy a aplikace a pak tyhle zmeni ukladat pomoci vlastnych http requestov do `dataStorage`. Teda `dataStorage` jiz nic neoveruje a plne duveruje komponente, ktera s nim spolupracuje (v tomhle pripade je to prave `AuthService`).

Teda vonkajsi komunikace nikdy (alespon momentalne) neprobiha s `dataStorage`. Tohle je zmena, ktera byla provedena 28.2 [(konkretni zmeny vidno v tomhle commitu)](https://gitlab.mff.cuni.cz/stefanm4/managementsystem/-/commit/ad193493ce512c57ee2b143911f7d10cc827d872).