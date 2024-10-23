import { expect, stub } from 'lovecraft';
import sigilium from './sigilium.js';
import hierophant from 'hierophant';

describe('Sigilium', () => {
  let container;

  beforeEach(() => {
    container = hierophant();
    stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  describe('sigil', () => {
    it('should create a basic extension point', () => {
      const log = sigilium.sigil('log');
      
      container.install(log.resolver());
      container.install(log.provider([], () => (...args) => console.log(...args)));

      const [logger] = container.resolve(log.resolve);
      logger(['Hello', 'World']);

      expect(console.log.callCount).to.eq(1);
      expect(console.log.lastCall.args).to.deep.eq([['Hello', 'World']]);
    });
  });

  describe('singleton', () => {
    it('should enforce single-provider constraint', () => {
      const unique = sigilium.singleton('unique');
      
      container.install(unique.resolver());
      container.install(unique.provider([], () => () => 'first'));
      container.install(unique.provider([], () => () => 'second'));

      expect(() => container.resolve(unique.resolve))
        .to.throw('Expected exactly one implementation for unique');
    });
  });

  describe('composite', () => {
    it('should support providers, decorators, and aggregators', () => {
      const converse = sigilium.composite('converse');
      const log = sigilium.sigil('log');

      // Install resolvers
      container.install(log.resolver());
      container.install(converse.resolver());

      // Install components
      container.install(log.provider([], () => (...args) => console.log(...args)));
      
      // Two providers
      container.install(converse.provider([log.resolve], ([logger]) => (messages) => {
        logger(messages);
        return `First: ${messages.length} messages`;
      }));
      container.install(converse.provider([], () => (messages) =>
        `Second: ${messages[messages.length - 1]}`
      ));

      // A decorator
      container.install(converse.decorator([log.resolve], ([logger]) => (fn) => (...args) => {
        logger('Decorated call');
        return fn(...args);
      }));

      // An aggregator
      container.install(converse.aggregator([], () => (impls) => (messages) =>
        impls.map(impl => impl(messages)).join(' | ')
      ));

      const [converseFn] = container.resolve(converse.resolve);
      const result = converseFn(['Hello', 'World']);

      expect(console.log.callCount).to.eq(2);
      expect(console.log.firstCall.args).to.deep.eq(['Decorated call']);
      expect(console.log.secondCall.args).to.deep.eq([['Hello', 'World']]);
      expect(result).to.equal('First: 2 messages | Second: World');
    });
  });
});