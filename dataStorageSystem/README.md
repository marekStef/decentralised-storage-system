# Data Storage System

System pozostava z backendu a frontendu.

Rozbehnuti backendu se nachazi [zde](./backend/README.md) a rozbehnuti frontendu [zde](./frontend/README.md).

Vsechny requesty, ktere momentalne umi backend jsou v tomhle adresari. Je to export API requestov z postmanu na dany system. Jednotlive requesty maji sva jmena zakoncene cislami. Tyhle cisla indikuji poradi, ve kterych by se meli vykonavat. Tento json export je exportnuty z program `PostMan`, ktery by bylo vhodne mit nainstalovany. Pak je mozne jednoduse importovat tento export do postmanu a pripadne v sekci `Environment` zmenit `URL` `authService` serveru, pokud se `authService` spusti na jinem portu nez 3000. [Export je zde.](./dataStorageSystemApi.postman_collection.json)

### Spusteni jednotlivych casti backendu

Instrukce pro spusteni jednotlivych casti systemu jsou [zde.](./backend/README.md)

### Spusteni frontendu

Po spusteni backendu je mozne prejit na spusteni frontend casti [zde.](./frontend/README.md)