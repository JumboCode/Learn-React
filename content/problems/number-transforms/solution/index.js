export const doubleAll = (numbers) => numbers.map((n) => n * 2);

export const onlyPositive = (numbers) => numbers.filter((n) => n > 0);

export const shortWords = (words, maxLength) => words.filter((word) => word.length <= maxLength);

export const firstOver = (numbers, limit) => numbers.find((n) => n > limit);

export const squaredEvens = (numbers) => numbers.filter((n) => n % 2 === 0).map((n) => n * n);

console.log(doubleAll([1, 2, 3]));
