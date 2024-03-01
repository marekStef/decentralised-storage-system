# Data Storage System

Instrukce pro setup:
1. Rozbehnuti [hlavniho dataStorage systemu](./dataStorageSystem/README.md)
2. Rozbehnuti [jednotlivych source appiek](./source_apps/README.md)

<!-- Irrelevant info to the readme (will be deleted in the future)

##### Update 16.8.2023
Zacal jsem s implementaci toho vedlejsiho serveru pro ukladani tych transformacnich funkcii, jak jsme se bavili na stretnuti v pondeli, 14.8.2023. `DataViewStore` je prave ten server na to ukladani nejen jednotlivych funkci ale celych modulov - jak jste chteli. Ten `DataViewStore` je ta cast, kterou ste nakreslil napravo dole od storage ve ctverci(obrazok niz) - je tam pravdepodobne napsano `Plugin store`.

[Meeting notes](./README_RESOURCES//meeting_notes_14_8_2023.pdf)

Funguje to tak, ze kdyz se zapne hlavni `DataStorage` server, tak tento server si automaticky zapne i `DataViewStore` server. Kdyz z nejakeho duvodu `DataViewStore` spadne, `DataStorage` server ho nastartuje znovu - je to v classe `DataViewStoreHandler`.

`DataStorage` server pak obsahuje endpoint `create_new_data_view`. Tento prijima jak samotne javascript files, tak i nazev hlavniho javascript souboru (v tomto subore musi byt jeden hlavni export jedne funkce - pridal sem i example - je to v directory `transformerExampleModules` ). Dalsi to pak vyzaduje `appId` pro prirazeni toho noveho pohledu k dane appce.  

Pak se poslou vsechny tyhle data na `DataViewStore` server, konkretne na endpoint `createNewDataView`. Tento si ulozi vsechny javascript files do directory `dataViewTransformerFunctions` a to nasledovne:

- `dataViewTransformerFunctions` obsahuje dalsi directories, kde nazev kazde directory zodpovida `appId`. Ak takova jeste neexistuje, vytvori se.
- v te directory jsou pak dalsi directories kde ich nazvy jsou zas podle `viewId`. V tyhle directories jsou jiz samotne nahrane javascript files s jednou dulezitou informacii - nazvy vsech javascriptovych files jsou ponechany tak jak byly obdrzeny - na jednu vynimku. Ten jeden 'entry' js file, teda ten kde musi byt jenom jeden hlavni export funkce (to je ta hlavni funkce ktera bude volana) je prejmenovany na `[viewId].js`.
  
Kdyz jsou vsechny modules loadnute do pameti, vrati se url adresa, na ktere bude pristupna ta hlavni funkce.

Na to pak ve `DataViewStore` serveri slouzi endpoint `/runFunction/:appId/:viewId`. Ten pak do te hlavni volane funkce `[viewId].js` posune vsechny parametry jake obdrzi v tele requeste konrektne ve `functionParameters` a spread syntaxi to posune:

```js
    // other code ...

    const dynamicModule = require(moduleEntryPath);
    if (!dynamicModule) {
        return res.status(400).send('Function not available');
    }

    const result = functionParameters && Array.isArray(functionParameters) ? dynamicModule(...functionParameters) : dynamicModule();
    res.send({ result });
```

Nejsem si jisty, jestli se ma kontrolovat, a nekde uchovavat (`DataViewStore` / `DataStorage` ?) i informace o tom, jake parametry dana funkce bere. V momentalnim stavu se to nekontroluje.

`/create_new_data_view` endpoint na `DataStorage` serveri sice v momentalnim stavu bere z tela requestu `mainEntryFunctionParameters` ale nic se ted s tym nedela.

Ak by jste si to chteli otestovat, pridavam i export pro postmana - jsou tam dva simple requesty.

[Postman requests export](./Bakalarka.postman_collection.json)

Predstavovali jste si tuhle cast nejak takhle?

###### UseCases & funkcni pozadavky

Usecases a funkční požadavky jsou v overleafu - sekce `kap02_navrh.text` Bol by som velmi vdecny, ak by jste si nasli cas a pripadne mi dali feedback, ci je to dobre, nebo jestli jsem to napsal zcela spatne. -->

---

### Overleaf link: 
`https://www.overleaf.com/read/crsdprbtyxxr`

### Design in Figma: 
`https://www.figma.com/file/6sM6QS9BgGvkaSwjPg2iqR/Managify?type=design&node-id=0%3A1&t=xgImJRXXdyZQrjTp-1`