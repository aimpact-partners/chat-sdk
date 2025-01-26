import React from 'react';
import { useMarked } from '@aimpact/chat-sdk/widgets/markdown';
import { CollapsibleHeader } from 'pragmate-ui/collapsible';
/**
 * Possible actions:
 *  - 'transcription',
 *  - 'fetching-tool-data',
 *  - 'kb-processed-response',
 *  - 'function', 'kb-response'
 * @param param0
 * @returns
 */

interface IProps {
	last?: boolean;
	texts: Record<string, any>;
	data: {
		type: string;
		data: any;
	};
	className?: string;
}
export function Action({ last = false, texts, data: { type, data } }: IProps) {
	const mark = useMarked;

	const { systemActions: actionsTexts } = texts;
	const Container = ({ title, children }: { title: string; children?: React.ReactNode }) => {
		const attrs = { className: `message-action ${type}${last ? ' last-action' : ''}` };
		const Container = last ? CollapsibleHeader : React.Fragment;
		return (
			<div {...attrs}>
				<Container>
					<header>
						<h4>{title}</h4>
					</header>
					<section className="detail__content">{children}</section>
				</Container>
			</div>
		);
	};

	if (type === 'fetching-tool-data') {
		return <Container title={actionsTexts[type]} />;
	}
	if (type === 'kb-response') {
		const output = data.matches.map(item => <li key={item.id}>{item.paragraph}</li>);
		return (
			<Container title={actionsTexts[type]}>
				<ul>{output}</ul>
			</Container>
		);
	}
	if (type === 'kb-processed-response') {
		return (
			<Container title={actionsTexts[type]}>
				<div dangerouslySetInnerHTML={{ __html: mark(data.response) }} />
			</Container>
		);
	}

	if (type === 'transcription') {
		return (
			<Container title={actionsTexts.transcription}>
				<p>{data.transcription}</p>
			</Container>
		);
	}
	if (type === 'function' && data.name === 'kb') {
		try {
			const { text } = JSON.parse(data.params);
			return (
				<Container title={actionsTexts.functions[data.name]}>
					<p>{text}</p>
				</Container>
			);
		} catch (e) {
			console.error(e);
		}
	}

	return <div className={`message-action ${type}`}>{type}</div>;
}
