export const timestampToDate = (timestamp: any) => {
	let nano = timestamp.nanoseconds * 10 ** -9;
	let milliSeconds = (timestamp.seconds + nano) * 1000;
	return new Date(milliSeconds);
};
