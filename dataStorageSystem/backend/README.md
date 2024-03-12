# Backend

Backend je momentalne rozdelen na 3 casti:
- `dataStorage`
- `authService`
- `viewManager` (pracuje se na nom)
- `javascriptExecutionService` (plne funkcni)
- `pythonExecutionService` (pracuje se na nom)

Important! Toto readme je momentalne outdated a nepocita s tym, ze authStorage jiz teda pro spravne fungovani potrebuje aby taky bezela `ViewManager` komponenta

## Spusteni jednotlivych casti backendu s Dockerem

Pred pokracovanim je potrebne si precist o dockeru [zde pri dataStorage](./dataStorage/README.md) a takisto [zde pri authService](./authService/README.md)

Pak staci spustit v tehle directory `docker compose up --build`.

## Spusteni jednotlivych casti backendu bez Dockeru

#### DataStorage

`DataStorage` vyzaduje pro fungovani `MongoDb` databazi. Pred pokracovanim je tedy nutno ji mat pripravenou lokalne na PC. Neni mozne ji jenom nainstalovat [odsud](https://www.mongodb.com/docs/manual/installation/). Duvodem je to, ze potrebujeme mit mongo db databazi nastavenou jako `MongoDB replica` - to nam dovoli pouzivat nektere dodatecne `MongoDB` features - jako jsou transakce ( ty budou pouzite pri ukladani viacerych eventov).

Po uspesnem nastartovani databazi pres docker je potrebne od ni obdrzet pristupovou `url`.

Ted je mozne pristoupit k samotnimu setupu DataStorage [zde](./dataStorage/README.md)

#### AuthService

Setup `AuthService` nevyzaduji pristup k `MongoDb` databazi a je pomerne primocarej [zde](./authService/README.md)