# fleet-ssh

A Node.js API for [CoreOS](http://coreos.com)'s fleetctl tool, implemented by simply remotely executing fleetctl over SSH. This means it will work within a Docker container on CoreOS, providing you have a host and key for your host machine, or any other node in the CoreOS cluster.

Inspired by the CoreOS scheduler in the [Deis](http://deis.io/) platform.

All commands in fleetctrl 0.5.0 are implemented with the exception of 'ssh', 'version' and 'help', and each command name maps directly to a method name in the API. Commands that have a hyphen are camel-cased (e.g. `debug-info` -> `debugInfo`).

All commands return a Node.js [ChildProcess](http://nodejs.org/api/child_process.html) object, so you can easily pipe the results somewhere.

If you pass a callback it will buffer the stdout and return it in the first non-error argument. If you don't pass a callback to each API call, it will return the child process object so you can stream the I/O yourself.

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

`fleetctl-ssh` now supports the `debug` module. To get some debug output set
the envvar `DEBUG` to `fleetctl` when you run your program that uses this module.

## API

**.cat(unitName)**  
Output the contents of a submitted unit.

**.debugInfo()**  
Print out debug information.

**.destroy(unitName)**  
Destroy one or more units in the cluster.

**.journal(unitName, options)**  
Print the journal of a unit in the cluster to stdout.  
Options:
* `follow` Continuously print new entries as they are appended to the journal.
* `lines` Number of recent log lines to return

**.listMachines()**  
Enumerate the current hosts in the cluster.

**.listUnits()**  
Enumerate units loaded in the cluster.

**.load(unitName, options)**  
Schedule one or more units in the cluster, first submitting them if necessary. You must supply either one of the `unitFile` or `unitFileData` options, below.  
Options:
* `unitFile` The path to the unit file to load.
* `unitFileData` The contents of the unit file itself, base64-encoded.
* `blockAttempts` Wait until the jobs are loaded, performing up to N attempts before giving up. A value of 0 indicates no limit.
* `noBlock` Do not wait until the jobs have been loaded before exiting.
* `sign` Sign unit file signatures and verify submitted units using local SSH identities.

**.start(unitName, options)**  
Instruct systemd to start one or more units in the cluster, first submitting and loading if necessary. You must supply either one of the `unitFile` or `unitFileData` options, below.  
Options:
* `unitFile` The path to the unit file to start.
* `unitFileData` The contents of the unit file itself, base64-encoded.
* `blockAttempts` Wait until the jobs are launched, performing up to N attempts before giving up. A value of 0 indicates no limit.
* `noBlock` Do not wait until the jobs have been launched before exiting.
* `sign` Sign unit file signatures using local SSH identities.

**.status(unitFile)**  
Output the status of one or more units in the cluster

**.stop(unitFile)**  
Instruct systemd to stop one or more units in the cluster.  
Options:
* `blockAttempts` Wait until the jobs are stopped, performing up to N attempts before giving up. A value of 0 indicates no limit.
* `noBlock` Do not wait until the jobs have stopped before exiting.

**.submit(unitFile, options)**  
Upload one or more units to the cluster without starting them. You must supply either one of the `unitFile` or `unitFileData` options, below.  
Options:
* `unitFile` The path to the unit file to submit.
* `unitFileData` The contents of the unit file itself, base64-encoded.
* `sign` Sign unit files units using local SSH identities

**.unload(unitFile, options)**  
Unschedule one or more units in the cluster.  
Options:
* `blockAttempts` Wait until the jobs are inactive, performing up to N attempts before giving up. A value of 0 indicates no limit.
* `noBlock` Do not wait until the jobs have become inactive before exiting.

**.verify(unitFile)**  
Verify unit file signatures using local SSH identities.

## Licence
MIT
