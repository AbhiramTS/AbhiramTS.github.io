import Two from 'twojs-ts';

function* sequence() {
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
}

const start = () => {
	const gen = sequence();
	setInterval(() => {
		const v = gen.next();
		console.log(v);
	}, 300);
};

export const init = () => {
	start();
	const two = new Two({
		type: Two.Types.svg,
		fullscreen: true,
		autostart: true,
	}).appendTo(document.body);

	(two as any).renderer.domElement.style.background = 'rgb(0, 191, 168)';

};
