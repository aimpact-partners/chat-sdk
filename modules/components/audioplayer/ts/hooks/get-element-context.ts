export const getAudioContext = (element: Blob): Promise<void> => {
	return new Promise((resolve, reject) => {
		const audioContext = new AudioContext();
		const reader = new FileReader();

		reader.onload = () => {
			const buffer = reader.result as ArrayBuffer;
			audioContext
				.decodeAudioData(buffer)
				.then(() => {
					resolve(); // Resolve when decoding is successful
				})
				.catch(error => {
					reject(error); // Reject on decoding error
				});
		};

		reader.onerror = error => {
			reject(error); // Reject on file reading error
		};

		reader.readAsArrayBuffer(element); // Start reading the Blob
	});
};
