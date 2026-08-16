# Tailwind Glassmorphism UI Design Skill

This skill provides a standardized workflow for creating modern, aesthetically pleasing user interfaces using Tailwind CSS with a focus on Glassmorphism and high-contrast accessibility.

## Goal
Produce clean, professional, and modern web interfaces that utilize transparency, blur, and gradients to create a "glass-like" effect, while maintaining readability and usability.

## UI Design Principles

### 1. Glassmorphism Core
- **Background**: Use vibrant gradients (e.g., `bg-gradient-to-b from-blue-500 to-purple-500`) to make the glass effect visible.
- **Transparency**: Use semi-transparent background colors (e.g., `bg-white/30` or custom `.glass-card` classes).
- **Blur**: Apply `backdrop-blur-md` or `backdrop-blur-lg` to create the frosted glass look.
- **Border**: Use thin, light-colored borders to define the edges (e.g., `border border-white/20`).
- **Shadow**: Apply soft shadows to create depth (e.g., `shadow-lg` or `shadow-md`).

### 2. Layout & Structure
- **Containers**: Center content with `container mx-auto p-6`.
- **Cards**: Group related information into `.glass-card` containers.
- **Grids**: Use responsive grids (`grid grid-cols-1 md:grid-cols-4 gap-4`) for data panels.
- **Tables**: Use `.glass-table` for data entry, with clear headers and hover effects (`hover:bg-gray-50`).

### 3. Typography & Color
- **Hierarchy**:
  - Titles: `text-3xl font-bold text-gray-800`
  - Section Headers: `text-xl font-semibold text-gray-700`
  - Labels: `text-sm font-medium text-gray-500`
  - Data: `text-lg font-bold text-gray-900`
- **Accents**: Use color coding for semantic meaning (e.g., Red for Right Eye/OD, Blue for Left Eye/OS).

### 4. Interactive Elements
- **Inputs**: Use focused ring colors that match the section accent (e.g., `focus:ring-red-400`).
- **Buttons**: Use high-contrast colors with hover states (e.g., `bg-green-500 hover:bg-green-600 text-white font-bold`).

## Implementation Workflow

1. **Define Background**: Establish the primary gradient background for the page or section.
2. **Scaffold Layout**: Create the main container and define the grid/flex structure.
3. **Apply Glass Components**: Wrap sections in `.glass-card` and use `backdrop-blur`.
4. **Detail Typography**: Apply the text hierarchy for labels and values.
5. **Add Interactive Polish**: Implement `hover`, `focus`, and `transition` effects.
6. **Validate Accessibility**: Ensure contrast ratios are sufficient between text and the semi-transparent backgrounds.

## Example Prompts
- "Create a patient registration form using Tailwind CSS with a glassmorphism design. Use a blue-to-indigo gradient background and glass-cards for the form sections."
- "Convert this standard HTML table into a modern glass-table with a frosted glass effect and red/blue accent colors for the rows."
- "Design a dashboard header panel using glassmorphism that displays four key metrics in a responsive grid."
