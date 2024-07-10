export const getAudioContext = callback => {
	return element => {
		return new Promise((resolve, reject) => {
			const audioContext = new AudioContext();
			const reader = new FileReader();
			reader.onload = () => {
				const buffer = reader.result as ArrayBuffer;
				audioContext
					.decodeAudioData(buffer)
					.then(callback)
					.catch(error => {
						reject(error);
					});
			};
			reader.readAsArrayBuffer(element);
		});
	};
};
