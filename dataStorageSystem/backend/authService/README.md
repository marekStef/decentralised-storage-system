# Auth Service
## Service for authentication and authorisation

This is the component responsible for making incoming data trusted before they continue on their way to `DataStorage` component.

### Setup a Spusteni s Dockerem

Pri dockeri je potrebne se ujistit, ze v `.env` mame odkomentovane spravne veci:

```env
# MONGO_DB_URI=mongodb://localhost:27017/accessDb # for manual starting
MONGO_DB_URI=mongodb://mongo1:27017/accessDb # for docker

# DATA_STORAGE_URL=http://localhost:3001 # for manual starting
DATA_STORAGE_URL=http://data_storage:3001 # for dockerr
```

Pro spusteni je vsechno dulezite napsane [zde](../README.md).

Po spusteni `docker compose up --build` je jeste potrebne inicializovat tuhle `authService`. Tahle `authService` je sice spustena automaticky pomoci hlavniho `docker-compose.yml` ale manualne je potrebne aby pri prvnim spusteni se nasetupovala ( pridanim root profilov do databaze).

```docker
docker ps
```

Bude se to pravdepodobne volat takhle: `backend-auth_service-1`.

Pak jiz muzeme spustit dany script:

```docker
docker exec backend-data_storage-1 npm run delete_database
```

Vysledkem by melo byt tohle:

```docker
C:\Users\stefanec>docker exec backend-auth_service-1 npm run initialise_service

> datastorage@1.0.0 initialise_service
> node scripts/initialisation/initialise.js

Event uploaded successfully: Events were created successfully
Event uploaded successfully: Events were created successfully
```

### Setup a Spusteni bez Dockeru

#### .env uprava

Potrebujeme odkomentovat a zakomentovat nasledovne v `.env` souboru:

```env
MONGO_DB_URI=mongodb://localhost:27017/accessDb # for manual starting
# MONGO_DB_URI=mongodb://mongo1:27017/accessDb # for docker

DATA_STORAGE_URL=http://localhost:3001 # for manual starting
# DATA_STORAGE_URL=http://data_storage:3001 # for docker
```

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