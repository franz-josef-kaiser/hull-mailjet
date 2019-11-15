# Hull Mailjet Connector

[![CircleCI](https://circleci.com/gh/SMK1085/hull-mailjet.svg?style=svg)](https://circleci.com/gh/SMK1085/hull-mailjet)
[![codecov](https://codecov.io/gh/SMK1085/hull-mailjet/branch/master/graph/badge.svg)](https://codecov.io/gh/SMK1085/hull-mailjet)
[![Maintainability](https://api.codeclimate.com/v1/badges/1c3033cf637b13ccff95/maintainability)](https://codeclimate.com/github/SMK1085/hull-mailjet/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/1c3033cf637b13ccff95/test_coverage)](https://codeclimate.com/github/SMK1085/hull-mailjet/test_coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/SMK1085/hull-mailjet/badge.svg)](https://snyk.io/test/github/SMK1085/hull-mailjet)
[![Dependency Status](https://david-dm.org/SMK1085/hull-mailjet.svg)](https://david-dm.org/SMK1085/hull-mailjet)
[![devDependencies Status](https://david-dm.org/SMK1085/hull-mailjet/dev-status.svg)](https://david-dm.org/SMK1085/hull-mailjet?type=dev)

## Overview

A connector fo Hull which allows you to synchronize Hull users to Mailchimp, keep their subscriptions synchronized with the segments of Hull users and capture actions such as Email opened, Unsubscribed from Mailjet.

For more documentation, see the [Connector Docs](./assets/readme.md).

## Usage

After installing dependencies via

```console
npm i
```

the `postinstall` script from `package.json` will be executed to build the JS files.
To start the development server which listens to changes in the `build` folder use

```console
npm run serve-debug
```

**Note** The development server uses nodemon and restarts automatically after changes to the JS files have been detected. To prevent continuous restarts, there is no automated conversion from TypeScript to JS, to refelect changes please run

```console
npm run build:js
# or
npm run build
```

For convenience the script section contains a script to run `ngrok` and provide a tunnel to your local environment. Make sure to have [ngrok](https://ngrok.com/) installed and then run

```console
npm run ngrok
```

To run a clustered version of the connector for production, use

```console
npm run start
```

This will use [PM2](https://pm2.keymetrics.io/) with the parameters specified in [ecosystem.config.js](./ecosystem.config.js). For more information about the Ecosystem File, see the [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/application-declaration/#ecosystem-file).

## Contributing

This project welcomes contributions and suggestions.

Please read to [Contribution Guidelines](./CONTRIBUTING.md).

## License

MIT License. See [LICENSE document](./LICENSE) for details.
