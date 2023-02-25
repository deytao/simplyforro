# SimplyForró

## Project

Manage the SimplyForró community and provide informations for the members

## Requirements

* Postgresql 14
* Node 18
* NPM 9
* Env vars

```bash
BASE_URL=http://localhost:3000

NOTION_ACCESS_TOKEN=<token>
DISABLE_TELEMETRY=true

EMAIL_SERVER_HOST=<stmp_server>
EMAIL_SERVER_PORT=<smtp_port>
EMAIL_SERVER_USER=<user>
EMAIL_SERVER_PASSWORD=<password>
EMAIL_FROM=<no-reply@domain.tld>

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<nextauth_secret>

DATABASE_URL=postgresql://simplyforro:@localhost:5432/simplyforro_dev

NEXTAUTH_SECRET=<cron_secret>
```

## Installation TODO
```bash
# Clone this project
git clone git@github.com:deytao/simplyforro.git

# Install required node modules from package.json
npm i
```

## Project typescript compilation? TODO
```bash
tsc -p tsconfig.json
```

## Project content? TODO
JavaScript libraries.
Components.


## Local development

* `npm run dev`
