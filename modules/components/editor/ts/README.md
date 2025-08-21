# Wiki Editor Components

This directory contains the rich text editor components based on TipTap.

## Available Components

### 1. `WikiEditor` - Complete Editor with Toolbar

Main reusable component that includes integrated toolbar and only receives an `onChange` callback.

```tsx
import { WikiEditor } from './wiki-editor';

<WikiEditor
	onChange={content => console.log('Content:', content)}
	initialContent='<p>Initial content</p>'
	placeholder='Write something...'
	className='my-custom-class'
	showToolbar={true} // Optional, default is true
/>;
```

**Props:**

-   `onChange?: (content: string) => void` - Callback when content changes
-   `initialContent?: string` - Initial HTML content
-   `placeholder?: string` - Placeholder text
-   `className?: string` - Additional CSS classes
-   `showToolbar?: boolean` - Show/hide toolbar (default: true)

**Included toolbar:**

-   **Style selector** - Headings, paragraphs, quotes
-   **Text formatting** - Bold, italic, underline, strikethrough
-   **Lists** - Bullet, ordered, task lists
-   **Blocks** - Quotes, code, horizontal rules

### 2. `WikiEditorUI` - Editor with Complete Interface

Editor that includes floating and bubble menus for text formatting (without toolbar).

```tsx
import { WikiEditorUI } from './wiki-editor-ui';

<WikiEditorUI
	onChange={content => console.log('Content:', content)}
	initialContent='<p>Initial content</p>'
	placeholder='Write something...'
	className='my-custom-class'
/>;
```

### 3. `WikiEditorControls` - Format Controls

Object containing all individual control components for custom implementations.

```tsx
import { Button, Section, TextStyleSelector } from './toolbar';

// Bubble menu for selected text
<BubbleMenuContent editor={editor} />

// Text style selector
<TextStyleSelector editor={editor} />

// Floating menu for inserting blocks
<FloatingMenuContent editor={editor} />

// Individual toolbar button
<Button button={buttonConfig} editor={editor} />

// Toolbar section
<Section editor={editor} group='text' />
```

## Toolbar Customization

### Smart Automatic System

The new configuration is **much simpler** and **automatic**:

```tsx
// BEFORE (redundant):
{
	id: 'bold',
	label: 'B',
	icon: 'B', // ❌ Same value as label
	title: 'Bold',
	action: editor => editor.chain().focus().toggleBold().run(), // ❌ Repetitive
	isActive: editor => editor.isActive('bold'), // ❌ Repetitive
	group: 'text',
}

// NOW (automatic):
{
	id: 'bold',
	label: 'B',
	title: 'Bold',
	group: 'text',
	// Everything else is generated automatically:
	// - icon: 'B' (from label)
	// - action: toggleBold() (from id)
	// - isActive: editor.isActive('bold') (from id)
}
```

### Basic Configuration

Toolbar configuration is in `toolbar/config.ts`:

```tsx
import { BUTTONS, GROUPS } from './toolbar';

// View all available buttons
console.log(BUTTONS);

// View available groups
console.log(GROUPS);
```

### Add/Remove Buttons

```tsx
import { BUTTONS } from './toolbar';

// Toolbar without list buttons
const buttonsWithoutLists = BUTTONS.filter(button => !['bulletList', 'orderedList', 'taskList'].includes(button.id));

// Only text formatting buttons
const textOnlyButtons = BUTTONS.filter(button => ['bold', 'italic', 'underline'].includes(button.id));
```

### Create Custom Configuration

```tsx
import { BUTTONS } from './toolbar';

// Custom toolbar with only some buttons
const customToolbar = BUTTONS.filter(button => ['bold', 'italic', 'bulletList', 'blockquote'].includes(button.id));
```

## Use Cases

### For Simple Implementations (Recommended)

```tsx
// Complete editor with integrated toolbar
<WikiEditor onChange={handleContentChange} />
```

### For Implementations without Toolbar

```tsx
// Editor without toolbar
<WikiEditor onChange={handleContentChange} showToolbar={false} />
```

### For Complete UI Implementations

```tsx
// With floating and bubble menus
<WikiEditorUI onChange={handleContentChange} />
```

### For Custom Implementations

```tsx
// Use individual controls where needed
<div className='my-editor'>
	<WikiEditor onChange={handleContentChange} showToolbar={false} />
	<div className='my-custom-toolbar'>
		<ToolbarSection editor={editor} group='text' />
		<ToolbarSection editor={editor} group='lists' />
	</div>
</div>
```

## Features

-   ✅ **Complete** - Includes integrated toolbar
-   ✅ **Reusable** - Can be used in any screen
-   ✅ **Configurable** - Optional props for customization
-   ✅ **Typed** - Complete TypeScript support
-   ✅ **Modular** - Components separated by functionality
-   ✅ **Semantic** - Clear and descriptive names
-   ✅ **Autonomous** - No additional external components required
-   ✅ **Customizable** - Completely configurable toolbar
-   ✅ **Optimized** - Uses clsx for better performance and readability
-   ✅ **Scalable** - Easy to add/remove buttons dynamically
-   ✅ **Smart** - Automatically generates actions, states and icons
-   ✅ **DRY** - No more repetitive code
-   ✅ **Maintainable** - Changes in one place
