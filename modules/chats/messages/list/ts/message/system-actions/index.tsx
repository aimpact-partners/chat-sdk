import React from 'react';
import { Action } from './action';
import { CollapsibleContainer, CollapsibleContent } from 'pragmate-ui/collapsible';
import { useChatMessagesContext } from '../../context';

export function SystemActions({ actions }) {
	if (!actions?.length) return null;

	const { texts } = useChatMessagesContext();
	const last = actions[actions.length - 1];

	return (
		<section className="message-actions__container">
			<CollapsibleContainer>
				<Action data={last} last texts={texts} />
				<CollapsibleContent>
					<section className="actions__log">
						{actions.map((action, i) => (
							<Action texts={texts} key={`action-${i}`} data={action} />
						))}
					</section>
				</CollapsibleContent>
			</CollapsibleContainer>
		</section>
	);
}
