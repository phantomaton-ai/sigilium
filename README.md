# Sigilium 🔮

Sigilium is a library for defining complex dependency hierarchies through smart identifiers. It provides factory functions for creating extension points with different composition patterns.

## Purpose 🧠

When building modular systems, we often need ways to:
- Define clear extension points for functionality
- Support multiple implementations of the same interface
- Compose implementations through decoration and aggregation
- Maintain clean separation between components

Sigilium helps solve these problems by providing smart identifiers that know how to compose their implementations.

## Usage 🪄

First, import the sigilium factory functions:

```javascript
import sigilium from 'sigilium';
```

### Basic Extension Points 📍

Create a basic extension point when you need a simple implementation:

```javascript
const log = sigilium.sigil('log');

// Register an implementation
container.install(log.provider([], () => console.log));
```

### Singleton Extension Points ☝️

Create a singleton extension point when you need exactly one implementation:

```javascript
const database = sigilium.singleton('database');

// Will throw if multiple implementations try to register
container.install(database.provider([], () => new SQLDatabase()));
```

### Composite Extension Points 🎭

Create a composite extension point when you need decoration or aggregation:

```javascript
const search = sigilium.composite('search');

// Register multiple implementations
container.install(search.provider([], () => 
  query => ['result1', 'result2']
));

// Decorate with logging
container.install(search.decorator([log.resolve], ([logger]) => (fn) => 
  query => {
    logger(`Searching for: ${query}`);
    return fn(query);
  }
));

// Aggregate results
container.install(search.aggregator([], () => (providers) =>
  query => providers.flatMap(p => p()(query))
));
```

## Contributing 🦄

We welcome contributions to the Sigilium project! If you have any ideas, bug reports, or pull requests, please feel free to submit them on the [Sigilium GitHub repository](https://github.com/phantomaton-ai/sigilium).

## License 🔒

Sigilium is licensed under the [MIT License](LICENSE).