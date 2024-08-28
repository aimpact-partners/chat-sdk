import React from 'react';
import MarkdownIt from 'markdown-it';
import markdownItMath from 'markdown-it-math';
import { MathJaxContext, MathJax } from 'better-react-mathjax';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export function MathRenderer({ children }: { children: string }) {
	const md = new MarkdownIt().use(markdownItMath);

	// Procesar el contenido Markdown sin el código dentro del string
	const renderedHTML = md.render(children);

	return (
		<MathJaxContext>
			<MathJax>
				<div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
			</MathJax>
		</MathJaxContext>
	);
}

export function MessageContent({ children }: { children: React.ReactNode }) {
	const str = `
	La fórmula para el coseno de un ángulo \\( \\theta \\) en un triángulo rectángulo es:
  
	\\[ \\cos(\\theta) = \\frac{\\text{adyacente}}{\\text{hipotenusa}} \\]
  
	Aquí tienes un ejemplo de código en JavaScript:
  
	\`\`\`javascript
	function cosTheta(adyacente, hipotenusa) {
	  return adyacente / hipotenusa;
	}
	\`\`\`
  
	También puedes escribir texto en *Markdown* y **resaltarlo**.
	`;

	// Separar el contenido en partes de código y texto
	const parts = str.split(/(```[\s\S]*?```)/g);

	return (
		<div>
			{parts.map((part, index) => {
				if (part.startsWith('```')) {
					// Extraer el lenguaje y el código
					const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
					const lang = match ? match[1] : '';
					const code = match ? match[2] : part;
					return (
						<SyntaxHighlighter key={index} language={lang}>
							{code}
						</SyntaxHighlighter>
					);
				} else {
					// Renderizar el contenido de texto (Markdown con fórmulas)
					return <MathRenderer key={index}>{part}</MathRenderer>;
				}
			})}
		</div>
	);
}
