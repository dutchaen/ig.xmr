export function humanizeNumber(n) {
	var d = ',';
	var s = '.';
	n = n.toString().split('.');
	n[0] = n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + d);
	return n.join(s);
}

export function kmbFormatter(n) {
	if (n < 1e3) return n;
	if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'K';
	if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'M';
	if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + 'B';
	if (n >= 1e12) return +(n / 1e12).toFixed(1) + 'T';
	// let formatter = Intl.NumberFormat('en', { notation: 'compact' });
	// return formatter.format(num);
}
