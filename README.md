# fleet-ssh

A Node.js API for @coreoslinux's fleetctl tool, implemented by simply remotely executing fleetctl over SSH. This means it will work within a Docker container on CoreOS, providing you have a host and key for your host machine, or any other node in the CoreOS cluster.

Inspired by the CoreOS scheduler in the @opendeis platform.

All commands in fleetctrl 0.5.0 are implemented with the exception of 'ssh', 'version' and 'help', and each command name maps directly to a method name in the API. Commands that have a hyphen are camel-cased (e.g. `debug-info` -> `debugInfo`).

All commands return a Node.js ChildProcess object, so you can easily pipe the results somewhere.

## Usage

To run against a CoreOS Vagrant cluster on your local machine:

```
var FleetAPI = require('fleet-ssh');
var fleet = new FleetAPI('127.0.0.1', {
  key: '/Users/lbond/.vagrant.d/insecure_private_key',
  port: 2222
};
fleet.cat('my-service').stdout.pipe(process.stdout);
```

## Licence
MIT
