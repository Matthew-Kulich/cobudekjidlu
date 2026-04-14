# CoJist

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

## Poznamka k demo datum

- ceny v seedech jsou snapshot z internetu k `12. 4. 2026`
- nejsou to live ceny v realnem case
- pro produkcni reseni bude lepsi pridat samostatny import nebo scraper s historií cen

## Doporuce dalsi kroky

1. Pridat detail receptu s postupem pripravy krok po kroku.
2. Pridat uzivatele a osobni historii konzumace.
3. Presunout seed a schema migrace do Flyway.
4. Pridat periodicky import cen z vybranych obchodnich webu.
