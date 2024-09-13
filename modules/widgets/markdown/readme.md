### README

#### Overview

The `useMarked` hook is designed to process and render markdown content with support for:

-   **Math rendering** using KaTeX for inline and block-level mathematical expressions.
-   **Syntax highlighting** for code blocks using `highlight.js`.
-   Support for **GitHub-flavored markdown** (GFM) features such as headings with custom IDs.

This hook combines several powerful libraries to handle complex markdown rendering tasks, making it suitable for use in
React projects where markdown content needs to be displayed dynamically.

#### What the Hook Does

The `useMarked` hook takes a string of markdown content as input, processes it with various extensions for enhanced
rendering (such as math and syntax highlighting), and returns the rendered HTML. The hook ensures that markdown content
is updated and re-rendered whenever the input content changes. It leverages the following features:

-   **Line breaks** for better control over markdown layout.
-   **KaTeX** for mathematical formulae, allowing both block and inline math expressions.
-   **Code syntax highlighting** using `highlight.js` for various programming languages.
-   **GitHub-flavored markdown (GFM)** support for consistent rendering with custom heading IDs.

The rendered output is returned as a string of HTML, ready to be inserted into a React component for display.

### Dependencies Used

1. **`marked`**:

    - **Why it's needed**: This is the core library used to parse markdown content into HTML.
    - **Why it was selected**: `marked` is a fast and widely-used markdown parser with a flexible plugin system that
      allows for easy integration of additional features like math and syntax highlighting.

2. **`marked-highlight`**:

    - **Why it's needed**: This package integrates syntax highlighting into `marked` using `highlight.js`, replacing the
      deprecated `highlight` option.
    - **Why it was selected**: It’s the official replacement for deprecated syntax highlighting options in `marked`, and
      it provides an easy way to integrate `highlight.js` for code highlighting.

3. **`highlight.js`**:

    - **Why it's needed**: This library provides syntax highlighting for code blocks within markdown.
    - **Why it was selected**: `highlight.js` supports a wide range of programming languages and is well-integrated with
      `marked`, making it ideal for adding color and style to code blocks within markdown content.

4. **`katex`**:

    - **Why it's needed**: This library is used to render mathematical expressions (both inline and block) within the
      markdown.
    - **Why it was selected**: `KaTeX` is one of the fastest and most reliable tools for rendering LaTeX-style math in
      web applications. It’s widely used and provides high-quality output for math-heavy content.

5. **`marked-mangle`**:

    - **Why it's needed**: This extension obfuscates email addresses in markdown content to prevent them from being
      scraped.
    - **Why it was selected**: It's a simple but effective way to provide security by preventing email harvesting, which
      can be useful in markdown documents that may include email links.

6. **`marked-gfm-heading-id`**:
    - **Why it's needed**: This package ensures that headings in markdown have custom, unique IDs, enabling better
      navigation within the document (e.g., for links or table of contents generation).
    - **Why it was selected**: This extension implements GitHub-flavored markdown (GFM) heading IDs, which is a widely
      used markdown standard. It helps ensure consistency when rendering headings with custom identifiers.

### How the Hook Works

1. **Input**: You provide a markdown string (`content`) as the input to the hook.
2. **Processing**:

    - The markdown is processed with `marked`, using the following extensions:
        - `KaTeX` for rendering inline and block math expressions.
        - `highlight.js` (via `marked-highlight`) for syntax highlighting of code blocks.
        - `marked-mangle` to obfuscate email addresses.
        - `marked-gfm-heading-id` to add unique IDs to headings in markdown.

3. **Output**: The hook processes the markdown content and returns it as a string of rendered HTML. This HTML string can
   then be used directly within a React component for rendering.

### Installation and Setup

To use this hook in your project, ensure you have all the necessary dependencies installed:

```bash
npm install marked marked-highlight highlight.js katex marked-mangle marked-gfm-heading-id
```

Then, import and use the `useMarked` hook as needed:

```tsx
import { useMarked } from './path-to-your-hook';

const MarkdownRenderer = ({ content }) => {
	const { ready, output } = useMarked(content);

	return <div>{ready ? <div dangerouslySetInnerHTML={{ __html: output }} /> : 'Loading...'}</div>;
};
```

### Summary

This hook provides a flexible and powerful way to render enhanced markdown in a React environment. By combining `marked`
with extensions like `katex` and `highlight.js`, it ensures that markdown content, including math and code blocks, is
rendered with high fidelity and interactivity.
