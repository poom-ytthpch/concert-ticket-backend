<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest
<h3 align="center">Concert Ticket Backend</h3>
  <p align="center">A backend for concert ticeket project</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>

</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Tech Stack

* [NestJS](https://nestjs.com/)
* [Postgresql](https://www.postgresql.org/)
* [Prisma ORM](https://www.prisma.io/)
* [Docker](https://www.docker.com/)

## Project setup

```bash
cd docker/database

cp example.env .env

docker compose up -d

cd ../../

cp example.env .env

npm install

npm run migrate:dev # only first time

npm run prisma:gen # optional

npm run seed
```

## Compile and run the project

```bash
# watch mode
$ npm run start:dev
```

## Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov

#sonar scan
cd docker/sonarqube

docker compose up -d

#set up following url https://codinggun.com/sonarqube/sonar-scanner

sonar-scanner
```

## Acknowledgements

This project is inspired and supported by various great tools and communities. Special thanks to:

- NestJS Framework – For providing a clean, structured, and production-ready architecture

- Prisma ORM – For simplifying database access with strong type-safety

- SonarQube – For enabling high-quality code through powerful static analysis tools

- All open-source contributors and communities for their continuous effort and innovation
