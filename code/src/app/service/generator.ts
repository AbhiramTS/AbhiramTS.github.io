export function* sequenceGeneratorFunction() {
	const previous: number[] = [];
	let count = 0;
	while (true) {
		const back: number = previous.length > 0 ? previous[previous.length - 1] - count : 0;
		const forward = previous.length > 0 ? previous[previous.length - 1] + count : 0;
		count++;
		const value: number = back > 0 ? (previous.includes(back) ? forward : back) : forward;
		previous.push(value);
		yield value;
  }
  return 0;
}
