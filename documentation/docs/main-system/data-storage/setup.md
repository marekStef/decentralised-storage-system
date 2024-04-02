---
sidebar_position: 4
---

# Setup

:::caution

Setup is in czech/slovak but will be rewritten to english once its content is approved.

:::


### Setup a Spusteni s Dockerem

Pri dockeri je potrebne se ujistit, ze v `.env` mame odkomentovane spravne veci:

```env
# MONGO_DB_URI=mongodb://localhost:27017/dataStorage # for manual starting
MONGO_DB_URI=mongodb://mongo1:27017/dataStorage # for docker
```

<!-- Pro spusteni je vsechno dulezite napsane [zde](). -->

V pripade, ze chceme manualne dropnout databazi vytvorenou `dataStorage` komponentou, je potrebne nejprve najit dany kontejner:

```docker
docker ps
```

Bude se to pravdepodobne volat takhle: `backend-data_storage-1`.

Pak jiz muzeme spustit dany script:

```docker
docker exec backend-data_storage-1 npm run delete_database
```

Vysledkem by melo byt tohle:

```docker
C:\Users\stefanec>docker exec backend-data_storage-1 npm run delete_database

> datastorage@1.0.0 delete_database
> node scripts/deletion/deleteDatabase.js

MongoDB connected. Now, dropping the database.
Database dropped: true
```

### Setup a Spusteni Bez Dockeru

<!-- Predpokladame, ze uzivatel jiz v ruce drzi url od `MongoDb` databaze. Tu je nutne vlozit do `.env` souboru (ktery se nachazi [zde]()) jaho hodnotu pro klic `MONGO_DB_URI`. -->

Potrebujeme odkomentovat a zakomentovat nasledovne v `.env` souboru:

```env
MONGO_DB_URI=mongodb://localhost:27017/dataStorage # for manual starting
# MONGO_DB_URI=mongodb://mongo1:27017/dataStorage # for docker
```

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

<!-- Je **dulezite** poznamenat, ze pro spravne fungovani systemu je ted nutno provest inicializaci `authStorage` pomoci skriptu v danem `authStorage` projektu (vice informaci o tom, co je potrebne udelat [zde]()). -->

##### Spusteni

Pak jiz muzeme nastartovat `dataStorage`:

```bash
npm run start
```