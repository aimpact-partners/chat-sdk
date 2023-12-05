export interface IPlayableItemProps {
	block: any;
	text: string;
	id: string;
	index: number;
	playable: boolean;
	player: any;
	onClickWord?: () => void;
}

export interface IPlayableProps {
	content: string;
	autoplay: boolean;
	player: any;
	id: string;
	playable?: boolean;
	onClickWord?: () => void;
	types: string[];
	toolTexts: Record<string, string>;
}
