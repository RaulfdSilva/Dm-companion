export type RandomNumberGenerator = () => number;

export interface DiceExpression {
  count: number;
  sides: number;
  modifier: number;
}

export interface DiceRoll extends DiceExpression {
  rolls: number[];
  total: number;
}

const MAX_DICE_COUNT = 1_000;
const DICE_EXPRESSION = /^(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?$/i;

export function parseDiceExpression(expression: string): DiceExpression {
  if (typeof expression !== 'string') {
    throw new TypeError('Dice expression must be a string.');
  }

  const match = DICE_EXPRESSION.exec(expression.trim());

  if (!match) {
    throw new SyntaxError('Expected NdS with an optional +M or -M modifier.');
  }

  const count = Number(match[1]);
  const sides = Number(match[2]);
  const amount = Number(match[4] ?? 0);
  const modifier = match[3] === '-' && amount !== 0 ? -amount : amount;

  validateConfiguration({ count, sides, modifier });

  return { count, sides, modifier };
}

function validateConfiguration({ count, sides, modifier }: DiceExpression): void {
  if (!Number.isSafeInteger(count) || count < 1 || count > MAX_DICE_COUNT) {
    throw new RangeError(`Dice count must be an integer from 1 to ${MAX_DICE_COUNT}.`);
  }

  if (!Number.isSafeInteger(sides) || sides < 1) {
    throw new RangeError('Dice sides must be a positive safe integer.');
  }

  if (!Number.isSafeInteger(modifier)) {
    throw new RangeError('Modifier must be a safe integer.');
  }

  const maximumSum = count * sides;

  if (
    !Number.isSafeInteger(maximumSum) ||
    !Number.isSafeInteger(maximumSum + modifier) ||
    !Number.isSafeInteger(count + modifier)
  ) {
    throw new RangeError('Possible dice sums and totals must be safe integers.');
  }
}

function rollDie(sides: number, random: RandomNumberGenerator): number {
  const value = random();

  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('Random number generator must return a number in [0, 1).');
  }

  // Cap the result at the final face to guard against floating-point rounding.
  return Math.min(sides, Math.floor(value * sides) + 1);
}

export function rollDice(
  expression: string,
  random: RandomNumberGenerator = Math.random,
): DiceRoll {
  const configuration = parseDiceExpression(expression);
  const rolls = Array.from({ length: configuration.count }, () =>
    rollDie(configuration.sides, random),
  );
  const total = rolls.reduce((sum, value) => sum + value, configuration.modifier);

  return { ...configuration, rolls, total };
}
