var fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn;

var FleetAPI = function (host, config) {
  if (!host) {
    throw new Error('Expected arguments: (host[, config]).');
  }
  this.host = host;
  this.config = config || {};
};

function getUnitFilename(unit) {
  return unit.indexOf('.service') >= 0 ? unit : unit + '.service';
}

FleetAPI.prototype._ssh_fleetctl = function (command, args, options) {
  if (typeof args == 'string') {
    args = [args];
  }
  args = args || [];
  args.unshift(command);
  var env = {
    PATH: '/usr/local/bin:/usr/bin:/bin' + path.resolve(path.join('.', 'bin')),
    FLEETW_HOST: this.host
  };
  if (this.config.key) {
    env.FLEETW_KEY = this.config.key;
  }
  if (this.config.port) {
    env.FLEETW_PORT = this.config.port;
  }
  if (options && typeof options == 'object') {
    if (options.unit) {
      env.FLEETW_UNIT = options.unit;
      if (options.unitFileData) {
        env.FLEETW_UNIT_DATA = options.unitFileData;
      }
      else {
        env.FLEETW_UNIT_FILE = options.unitFile || getUnitFilename(options.unit);
      }
    }
  }
  return spawn('bin/fleetctl.sh', args, {env: env});
}

FleetAPI.prototype.cat = function (unit) {
  return this._ssh_fleetctl('cat', unit);
};

FleetAPI.prototype.debugInfo = function () {
  return this._ssh_fleetctl('debug-info');
};

FleetAPI.prototype.destroy = function () {
  var units = Array.prototype.slice.call(arguments)
  if (units.length == 0) {
    throw new Error('Expected one or more unit names');
  }
  return this._ssh_fleetctl('destroy', units);
};

FleetAPI.prototype.journal = function (unit, options) {
  if (!unit) {
    throw new Error('Expected unit name and optional options');
  }
  var terms = [];
  if (options) {
    if (options.follow) {
      terms.push('' + options.follow);
    }
    if (options.lines) {
      terms.push('' + options.lines);
    }
  }
  terms.push(unit);
  return this._ssh_fleetctl('journal', terms);
};

FleetAPI.prototype.listMachines = function () {
  return this._ssh_fleetctl('list-machines', ['--full', '--no-legend']);
};

FleetAPI.prototype.listUnits = function () {
  return this._ssh_fleetctl('list-units', ['--full', '--no-legend']);
};

FleetAPI.prototype.load = function (unit, options) {
  var args = [];
  var ufOptions = {
    unit: path.basename(unit)
  };
  if (options) {
    if (options.blockAttempts) {
      args.push('--block-attempts=' + options.blockAttempts);
    }
    if (options.noBlock) {
      args.push('--no-block=' + !!options.noBlock);
    }
    if (options.sign) {
      args.push('--sign=' + !!options.sign);
    }
    if (options.unitFile) {
      ufOptions.unitFile = options.unitFile;
    }
    if (options.unitFileData) {
      ufOptions.unitFileData = options.unitFileData;
    }
  }
  args.push(unit);
  return this._ssh_fleetctl('load', args, ufOptions);
};

FleetAPI.prototype.start = function (unit, options) {
  var args = [];
  var ufOptions = {
    unit: path.basename(unit)
  };
  if (options) {
    if (options.blockAttempts) {
      args.push('--block-attempts=' + options.blockAttempts);
    }
    if (options.noBlock) {
      args.push('--no-block=' + !!options.noBlock);
    }
    if (options.sign) {
      args.push('--sign=' + !!options.sign);
    }
    if (options.unitFile) {
      ufOptions.unitFile = options.unitFile;
    }
    if (options.unitFileData) {
      ufOptions.unitFileData = options.unitFileData;
    }
  }
  args.push(unit);
  return this._ssh_fleetctl('start', args, ufOptions);
};

FleetAPI.prototype.status = function (unit) {
  return this._ssh_fleetctl('status', unit);
};

FleetAPI.prototype.stop = function (units, options) {
  if (typeof units == 'string') {
    units = [units];
  }
  var args = [];
  if (options) {
    if (options.blockAttempts) {
      args.push('--block-attempts=' + options.blockAttempts);
    }
    if (options.noBlock) {
      args.push('--no-block=' + !!options.noBlock);
    }
  }
  units.forEach(function (u) {
    args.push(u);
  });
  return this._ssh_fleetctl('stop', args);
};

FleetAPI.prototype.submit = function (unit, options) {
  if (typeof units == 'string') {
    units = [units];
  }
  var args = [];
  var ufOptions = {
    unit: path.basename(unit)
  };
  if (options) {
    if (options.sign) {
      args.push('--sign=' + !!options.sign);
    }
    if (options.unitFile) {
      ufOptions.unitFile = options.unitFile;
    }
    if (options.unitFileData) {
      ufOptions.unitFileData = options.unitFileData;
    }
  }
  args.push(unit);
  return this._ssh_fleetctl('submit', args, ufOptions);
};

FleetAPI.prototype.unload = function (units, options) {
  if (typeof units == 'string') {
    units = [units];
  }
  var args = [];
  if (options) {
    if (options.blockAttempts) {
      args.push('--block-attempts=' + options.blockAttempts);
    }
    if (options.noBlock) {
      args.push('--no-block=' + !!options.noBlock);
    }
  }
  units.forEach(function (u) {
    args.push(u);
  });
  return this._ssh_fleetctl('unload', args);
};

module.exports = FleetAPI;
