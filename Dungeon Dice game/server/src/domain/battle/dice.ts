export type RandomNumberGenerator = () => number;

export function rollDie(
    sides = 6,
    random: RandomNumberGenerator = Math.random,
): number {
    return Math.floor(random() * sides) + 1;
}