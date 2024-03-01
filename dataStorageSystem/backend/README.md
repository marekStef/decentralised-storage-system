# Backend

Backend je momentalne rozdelen na 3 casti:
- `dataStorage`
- `authService`
- `dataViewStore` (tento je potrebne nyni ignorovat - neni nijak zapojen do momentalniho stavu backendu a slozil jen jako testovani jedne funkcionality v minulosti. V budoucnu zapojen bude)

## Spusteni jednotlivych casti backendu

#### DataStorage

`DataStorage` vyzaduje pro fungovani `MongoDb` databazi. Pred pokracovanim je tedy nutno ji mat pripravenou lokalne na PC. Instrukce pro instalaci `MongoDb` databaze jsou [zde](https://www.mongodb.com/docs/manual/installation/).

Po uspesnem nainstalovani je potrebne tuhle databazi nastartovat a obdrzet od ni pristupovou `url`.

Ted je mozne pristoupit k samotnimu setupu DataStorage [zde](./dataStorage/README.md)

#### AuthService

Setup `AuthService` nevyzaduji pristup k `MongoDb` databazi a je pomerne primocarej [zde](./authService/README.md)