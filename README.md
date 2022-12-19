## Description

[Nest](https://github.com/nestjs/nest) framework, TypeScript, Prisma and Planetscale.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# Start pscale proxy
$ pscale connect mpyahjalpen dev --port 3309

# push db
$ npx prisma db push

# run db gui
$ npx prisma studio

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## About

- Uses Prisma and PlanetScale to keep the data from musikhjälpen bössan saved to a mysql db within planetscales serverless dbs.
- Runs a Cron-job via the task service to keep everything up to date (depending on your interval)
- Exposes an api to fetch all the donations
