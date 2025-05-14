# **App Name**: Nepal Traversal

## Core Features:

- Daily Puzzle Generation: Generates a daily puzzle with a random start and end district, ensuring the optimal path is within a specified length. This uses the date as a seed for consistency.
- Interactive Map Display: An interactive map of Nepal highlighting districts, paths, and user guesses.
- District Guess Input: An input field where users can enter their guesses for the sequence of districts.
- Guess List & Scoring: Display user's guesses and scores with color-coded feedback, showing how much each guess shortens the remaining shortest path.
- Intelligent Hint System: Provide three hints: reveal the next district outline, reveal all district outlines, and reveal district initials. This tool chooses the type of hint that the user needs the most.

## Style Guidelines:

- Use a max-w-screen-sm mx-auto flex flex-col gap-4 p-4 layout.
- Employ Travle's green/orange/grey color scheme using Tailwind CSS classes: bg-emerald-500, bg-amber-400, bg-neutral-600.
- Accent color: Indigo (#6610f2) to provide emphasis and highlight interactive elements.
- Simple, clear icons for hints and UI actions.
- Subtle transitions and animations for user interactions and feedback.