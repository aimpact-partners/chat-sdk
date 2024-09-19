export interface IPlayableItemProps {
	id: string;
	block: any;
	text: string;
	index: number;
	playable: boolean;
	player: any;
	onClickWord?: (e?) => void;
}

export interface IPlayableProps {
	id: string;
	content: string;
	autoplay?: boolean;
	player: any;
	playable?: boolean;
	onClickWord?: (e?) => void;
	types?: string[];
	toolTexts?: Record<string, string>;
	className?: string;
}
