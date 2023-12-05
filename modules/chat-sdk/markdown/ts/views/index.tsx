import * as React from 'react';
import { Markdown } from '@aimpact/chat-sdk/widgets/markdown';

const t1 = `
# Hola como estas
## Hola como estas
### Hola como estas
#### Hola como estas

- bien
- mal
- regular

 1. bien
 2. mal
 3. regular
`;

export /*bundle*/
function View() {
	return (
		<>
			<h2>Hello i'm markdown page</h2>
			<Markdown content={t1} />
		</>
	);
}
