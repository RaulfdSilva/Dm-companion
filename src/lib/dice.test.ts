import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseDiceExpression, rollDice } from './dice';

const validRolls = [
  { expression: '1d6', count: 1, sides: 6, modifier: 0, rolls: [4], total: 4 },
  { expression: '2d8', count: 2, sides: 8, modifier: 0, rolls: [5, 5], total: 10 },
  { expression: '1d100', count: 1, sides: 100, modifier: 0, rolls: [51], total: 51 },
  { expression: '2d6+3', count: 2, sides: 6, modifier: 3, rolls: [4, 4], total: 11 },
  { expression: '3d10-2', count: 3, sides: 10, modifier: -2, rolls: [6, 6, 6], total: 16 },
];

for (const { expression, ...expected } of validRolls) {
  test(`rolls ${expression} deterministically`, () => {
    assert.deepEqual(rollDice(expression, () => 0.5), expected);
  });
}

test('parses uppercase D and whitespace around the expression and modifier', () => {
  assert.deepEqual(parseDiceExpression(' 2D6 + 3 '), { count: 2, sides: 6, modifier: 3 });
  assert.deepEqual(parseDiceExpression('3d10 - 2'), { count: 3, sides: 10, modifier: -2 });
});

test('uses one independent RNG sample for each die', () => {
  const samples = [0, 0.5, 1 - Number.EPSILON];
  let calls = 0;
  const result = rollDice('3d6+2', () => samples[calls++]);

  assert.deepEqual(result.rolls, [1, 4, 6]);
  assert.equal(result.total, 13);
  assert.equal(calls, 3);
});

test('defaults to Math.random', (context) => {
  context.mock.method(Math, 'random', () => 0.5);
  assert.equal(rollDice('1d6').total, 4);
});

for (const expression of ['1d6', '1d8', '1d10', '1d100']) {
  test(`includes both die boundaries for ${expression}`, () => {
    const { sides } = parseDiceExpression(expression);
    assert.deepEqual(rollDice(expression, () => 0).rolls, [1]);
    assert.deepEqual(rollDice(expression, () => 1 - Number.EPSILON).rolls, [sides]);
  });
}

test('supports one-sided dice', () => {
  assert.deepEqual(rollDice('2d1', () => 0.75).rolls, [1, 1]);
});

test('accepts the maximum dice count', () => {
  const result = rollDice('1000d6', () => 0);
  assert.equal(result.rolls.length, 1_000);
  assert.ok(result.rolls.every((value) => value === 1));
  assert.equal(result.total, 1_000);
});

test('accepts safe integer boundaries for sides and totals', () => {
  const maximum = Number.MAX_SAFE_INTEGER;
  assert.equal(rollDice(`1d${maximum}`, () => 1 - Number.EPSILON / 2).total, maximum);
  assert.equal(rollDice(`1d1+${maximum - 1}`, () => 0).total, maximum);
  assert.equal(rollDice(`1d1-${maximum}`, () => 0).total, 1 - maximum);
});

for (const sides of [
  2 ** 32 - 1,
  2 ** 32,
  2 ** 52 - 1,
  2 ** 52,
  2 ** 52 + 1,
  Number.MAX_SAFE_INTEGER - 1,
  Number.MAX_SAFE_INTEGER,
]) {
  test(`keeps d${sides} within its faces at floating-point boundaries`, () => {
    const closestToOne = 1 - Number.EPSILON / 2;

    for (const value of [
      0,
      Number.MIN_VALUE,
      1 - Number.EPSILON * 2,
      1 - Number.EPSILON,
      closestToOne,
    ]) {
      const result = rollDice(`1d${sides}`, () => value);
      const [roll] = result.rolls;

      assert.ok(Number.isSafeInteger(roll));
      assert.ok(roll >= 1 && roll <= sides, `RNG ${value} produced ${roll}`);
      assert.equal(result.total, roll);

      if (value === 0 || value === Number.MIN_VALUE) {
        assert.equal(roll, 1);
      }
      if (value === closestToOne) {
        assert.equal(roll, sides);
      }
    }
  });
}

for (const expression of ['2d6+0', '2d6-0', '2d6']) {
  test(`normalizes the zero modifier in ${expression}`, () => {
    assert.equal(rollDice(expression, () => 0).modifier, 0);
    assert.equal(rollDice(expression, () => 0).total, 2);
  });
}

test('applies modifiers once and allows zero or negative totals', () => {
  assert.equal(rollDice('2d6-2', () => 0).total, 0);
  assert.equal(rollDice('2d6-10', () => 0).total, -8);
});

const malformedExpressions = [
  '', ' ', 'd6', '1d', '6', '1d6junk', 'junk1d6', '1d6\njunk',
  '1.5d6', '1d6.5', '-1d6', '1d-6', '+1d6', '1e2d6',
  '1 d6', '1d 6', '1d6+', '1d6-', '1d6++2', '1d6+-2',
  '1d6--2', '1d6+2.5', '1d6+2-1', '1d6+1d4', '1d6*2',
];

for (const expression of malformedExpressions) {
  test(`rejects malformed expression ${JSON.stringify(expression)}`, () => {
    assert.throws(() => rollDice(expression), SyntaxError);
  });
}

const invalidConfigurations = [
  '0d6', '1d0', '1001d6',
  '9007199254740992d6', '1d9007199254740992',
  '1d6+9007199254740992', '1d6-9007199254740992',
  '2d9007199254740991', '1d6+9007199254740991',
  `1d${'9'.repeat(400)}`,
];

for (const expression of invalidConfigurations) {
  test(`rejects invalid configuration ${expression.slice(0, 40)}`, () => {
    assert.throws(() => rollDice(expression), RangeError);
  });
}

test('rejects non-string input at runtime', () => {
  for (const value of [null, undefined, 6, {}, []]) {
    assert.throws(() => rollDice(value as unknown as string), TypeError);
  }
});

test('validates the expression before consuming randomness', () => {
  let calls = 0;
  const random = () => {
    calls += 1;
    return 0;
  };

  assert.throws(() => rollDice('invalid', random), SyntaxError);
  assert.throws(() => rollDice('0d6', random), RangeError);
  assert.equal(calls, 0);
});

for (const value of [-Number.EPSILON, 1, 2, NaN, Infinity, -Infinity]) {
  test(`rejects invalid RNG output ${value}`, () => {
    assert.throws(() => rollDice('1d6', () => value), RangeError);
  });
}

test('validates every RNG sample', () => {
  let calls = 0;
  assert.throws(() => rollDice('2d6', () => (calls++ === 0 ? 0 : 1)), RangeError);
  assert.equal(calls, 2);
});
