# DataStorage Server
Server pro agregaci `eventov` zozberanych ruznymi typmi aplikacii.

### Setup a Spusteni

Predpokladame, ze uzivatel jiz v ruce drzi url od `MongoDb` databaze. Tu je nutne vlozit do `.env` souboru (ktery se nachazi [zde](./.env)) jaho hodnotu pro klic `MONGO_DB_URI`.

V `.env` souboru je jeste podstatni klic `DATA_STORAGE_SERVER_PORT=3005`. V pripade, ze tento projekt nejde spustit pod portem `3005`, je nutno ho zamenit. 

V pripade, ze je nutno ho zamenit, tak je potrebna dodatocna zmena - a to zmenit tuhle hodnotu v `.env` komponenty `authService`, ktera s touto komponentou primo komunikuje.

V komponente `authService` je konkretne klic `DATA_STORAGE_URL`, ktery je nutno zmenit.

##### Instalace
Pro nainstalovani vsech dependencies je nutno spustit:

```bash
npm install
```

##### Delete

Pro vyresetovani celej databazi je mozne pouzit skript, ktery se spusti nasledovne:

```bash
npm run delete_database
```

Je **dulezite** poznamenat, ze pro spravne fungovani systemu je ted nutno provest inicializaci `authStorage` pomoci skriptu v danem `authStorage` projektu (vice informaci o tom, co je potrebne udelat [zde](../authService/README.md#inicializace)).

##### Spusteni

Pak jiz muzeme nastartovat `dataStorage`:

```bash
npm run start
```

<!-- In this version though, it only starts another `DataViewStore` server for holding all transformation functions. Read the main project README for further information. -->