export interface IStyleOption {
	label: string;
	style: string;
	className: string;
	shortcut: string;
	command: (editor: any) => void; // Editor command function
}

export interface IStyleOptionProps {
	option: IStyleOption;
	editor: any; // TipTap Editor
	onClose: () => void; // Just notify parent to close dropdown
}
