class Sigil {
  constructor(name) {
    this.name = name;
    this.impl = Symbol(`${name}:impl`);
    this.resolve = Symbol(`${name}:resolve`);
  }

  provider(dependencies, factory) {
    return {
      symbol: this.impl,
      dependencies,
      factory
    };
  }

  resolver() {
    return {
      symbol: this.resolve,
      dependencies: [this.impl],
      factory: impls => impls[0]
    };
  }
}

class Optional extends Sigil {
  resolver() {
    return {
      symbol: this.resolve,
      dependencies: [this.impl],
      factory: impls => {
        if (impls.length > 1) {
          throw new Error(`Expected at most one implementation for ${this.name}`);
        }
        return impls[0];
      }
    };
  }
}

class Singleton extends Sigil {
  resolver() {
    return {
      symbol: this.resolve,
      dependencies: [this.impl],
      factory: impls => {
        if (impls.length !== 1) {
          throw new Error(`Expected exactly one implementation for ${this.name}`);
        }
        return impls[0];
      }
    };
  }
}

class Composite extends Sigil {
  constructor(name) {
    super(name);
    this.decorate = Symbol(`${name}:decorate`);
    this.aggregate = Symbol(`${name}:aggregate`);
  }

  decorator(dependencies, factory) {
    return {
      symbol: this.decorate,
      dependencies,
      factory
    };
  }

  aggregator(dependencies, factory) {
    return {
      symbol: this.aggregate,
      dependencies,
      factory
    };
  }

  resolver() {
    return {
      symbol: this.resolve,
      dependencies: [this.impl, this.decorate, this.aggregate],
      factory: (impls, decorators = [], [aggregator]) => {
        const base = aggregator ? aggregator(impls) : impls[0];
        return decorators.reduce((fn, decorate) => decorate(fn), base);
      }
    };
  }
}

export default {
  sigil: name => new Sigil(name),
  optional: name => new Optional(name),
  singleton: name => new Singleton(name),
  composite: name => new Composite(name)
};