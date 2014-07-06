var fs = require('fs'),
    path = require('path'),
    execFile = require('child_process').execFile;

var FleetAPI = function (host, config) {
  if (!host) {
    throw new Error('Expected arguments: (host[, config]).');
  }
  this.host = host;
  this.config = config || {};
  this.binPath = path.join(__dirname, 'bin', 'fleetctl.sh')
};

function getUnitFilename(unit) {
  return unit.indexOf('.service') >= 0 ? unit : unit + '.service';
}

FleetAPI.prototype._ssh_fleetctl = function (command, args, options, cb) {
  if (args && !options && !cb && typeof args === 'function') {
    cb = args;
    args = null;
  }
  else if (args && options && !cb && typeof options === 'function') {
    // callback passed instead of options
    cb = options;
    options = null;
  }
  if (typeof args == 'string') {
    args = [args];
  }
  args = args || [];
  args.unshift(command);
  var env = JSON.parse(JSON.stringify(process.env));
  env.PATH = '/usr/local/bin:/usr/bin:/bin:' + path.resolve(path.join('.', 'bin'));
  env.FLEETW_HOST = this.host;
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
  if (this.config.debug) {
    env.DEBUG = true;
  }
  return execFile(this.binPath, args, {env: env}, cb);
};

FleetAPI.prototype.cat = function (unit, cb) {
  return this._ssh_fleetctl('cat', unit, cb);
};

FleetAPI.prototype.debugInfo = function (cb) {
  return this._ssh_fleetctl('debug-info', cb);
};

FleetAPI.prototype.destroy = function () {
  var cb = undefined;
  if (typeof arguments[arguments.length - 1] === 'function') {
    cb = Array.prototype.pop.call(arguments);
  }
  var units = Array.prototype.slice.call(arguments)
  if (units.length == 0) {
    throw new Error('Expected one or more unit names');
  }
  return this._ssh_fleetctl('destroy', units, cb);
};

FleetAPI.prototype.journal = function (unit, options, cb) {
  if (!unit) {
    throw new Error('Expected unit name and optional options');
  }
  var terms = [];
  if (options) {
    if (options.follow) {
      terms.push('--follow=' + options.follow);
    }
    if (options.lines) {
      terms.push('--lines=' + options.lines);
    }
  }
  terms.push(unit);
  return this._ssh_fleetctl('journal', terms, cb);
};

FleetAPI.prototype.listMachines = function (cb) {
  return this._ssh_fleetctl('list-machines', ['--full', '--no-legend'], cb);
};

FleetAPI.prototype.listUnits = function (cb) {
  return this._ssh_fleetctl('list-units', ['--full', '--no-legend'], cb);
};

FleetAPI.prototype.load = function (unit, options, cb) {
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
  return this._ssh_fleetctl('load', args, ufOptions, cb);
};

FleetAPI.prototype.start = function (unit, options, cb) {
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
  return this._ssh_fleetctl('start', args, ufOptions, cb);
};

FleetAPI.prototype.status = function (unit, cb) {
  return this._ssh_fleetctl('status', unit, cb);
};

FleetAPI.prototype.stop = function (units, options, cb) {
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
  return this._ssh_fleetctl('stop', args, cb);
};

FleetAPI.prototype.submit = function (unit, options, cb) {
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
  return this._ssh_fleetctl('submit', args, ufOptions, cb);
};

FleetAPI.prototype.unload = function (units, options, cb) {
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
  return this._ssh_fleetctl('unload', args, cb);
};

module.exports = FleetAPI;
