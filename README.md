# CoBudekJidlu

Pocatecni fullstack template pro webovou aplikaci na ukladani receptu, jejich historii a chytre doporucovani podle nalady, kuchyne a narocnosti.

## Co uz demo umi

- seznam receptu s casem, kdy jsi je mel nebo varil naposledy
- filtrovani podle typu jidla, kuchyne, narocnosti a nalady
- doporuceni na jidla, ktera jsi dlouho nemel
- vyzivove hodnoty na porci
- odhad ceny na porci a volitelne ceny jednotlivych surovin
- formular pro pridani vlastniho receptu vcetne surovin
- lokalne stazene fotografie receptu v projektu

## Architektura

- `backend/` pouziva Spring Boot a PostgreSQL
- `frontend/` je React pres Vite
- `docker-compose.yml` spousti PostgreSQL pro lokalni vyvoj

PostgreSQL je dobry zaklad i pro budouci mobilni aplikaci, protoze stejne API muze obsluhovat web i mobilni klient.

## Struktura

```text
backend/   Spring Boot REST API
frontend/  React aplikace
```

## Lokalni spusteni

### 1. Databaze

```bash
docker compose up -d
```

### 2. Backend

Pozadavky:

- Java 21+
- Maven 3.9+

```bash
cd backend
mvn spring-boot:run
```

API pobezi na `http://localhost:8080`.

### 3. Frontend

Pozadavky:

- Node.js 22+

```bash
cd frontend
npm install
npm run dev
```

Frontend pobezi na `http://localhost:5173`.

## GitHub Pages

Frontend je pripraveny na automaticky deploy na GitHub Pages pres GitHub Actions workflow v [.github/workflows/deploy-pages.yml](/C:/Users/matej/projects/cobudekjidlu/.github/workflows/deploy-pages.yml).

Pred prvnim nasazenim na GitHubu udelej:

1. V repozitari otevri `Settings > Pages`.
2. V `Source` vyber `GitHub Actions`.
3. V `Settings > Secrets and variables > Actions > Variables` pridej repozitarovou promennou `VITE_API_URL`.

`VITE_API_URL` ma ukazovat na bezici backend API, napriklad `https://tvoje-api-domena.cz/api`.

Po pushi do `main` se nasadi obsah `frontend/dist` na adresu `https://matthew-kulich.github.io/cobudekjidlu/`.

## Nasazeni backendu

GitHub Pages umi hostovat jen staticky frontend. Backend je pripraveny na nasazeni jako samostatna Java aplikace, nejjednoduseji pres Render blueprint v [render.yaml](/C:/Users/matej/projects/cobudekjidlu/render.yaml).

Postup:

1. Pushni zmeny do GitHubu.
2. Na Renderu zaloz `New + > Blueprint`.
3. Vyber repozitar `Matthew-Kulich/cobudekjidlu`.
4. Render nacte `render.yaml` a vytvori:
   - PostgreSQL databazi `cobudekjidlu-db`
   - web service `cobudekjidlu-backend`
5. Po deployi zkopiruj URL backendu, napriklad `https://cobudekjidlu-backend.onrender.com`.
6. Na GitHubu nastav `Settings > Secrets and variables > Actions > Variables`:
   - `VITE_API_URL = https://cobudekjidlu-backend.onrender.com/api`
7. Udelej novy push do `main`, aby se frontend na GitHub Pages znovu nasadil s novou API adresou.

Pro CORS musi v Render service zustat promenna `FRONTEND_URL`. Pokud budes pouzivat defaultni GitHub Pages domenu, nech ji na `https://matthew-kulich.github.io`.

## Poznamka k demo datum

- ceny v seedech jsou snapshot z internetu k `12. 4. 2026`
- nejsou to live ceny v realnem case
- pro produkcni reseni bude lepsi pridat samostatny import nebo scraper s historií cen

## Doporuce dalsi kroky

1. Pridat detail receptu s postupem pripravy krok po kroku.
2. Pridat uzivatele a osobni historii konzumace.
3. Presunout seed a schema migrace do Flyway.
4. Pridat periodicky import cen z vybranych obchodnich webu.

