# Scaler Agent CLI + Scaler Website Clone

This project is an AI-powered terminal coding agent that can run a structured reasoning loop and use tools to complete user tasks.  
It also includes a generated Scaler Academy-style website clone in `scaler.html`.

## Repository

GitHub Repo: [https://github.com/Ctrl-apk/Clone](https://github.com/Ctrl-apk/Clone)

## Demo Video

YouTube Demo: `ADD_YOUR_YOUTUBE_LINK_HERE`

## Project Features

- Structured agent reasoning loop: `START -> THINK -> TOOL -> OBSERVE -> OUTPUT`
- Tool-based execution model (directory, file, command, and website generation tools)
- Interactive CLI interface for user instructions
- Full Scaler-inspired responsive website clone in `scaler.html`

## Tech Stack

- Node.js (ES Modules)
- OpenAI SDK (`openai`)
- `dotenv` for environment variables
- `axios` (dependency installed in project)

## Folder Structure

- `index.js` - Main agent implementation and reasoning loop
- `scaler.html` - Generated Scaler website clone
- `.env.example` - Environment variable template
- `package.json` - Project metadata and dependencies

## Setup and Run

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Put your OpenAI API key in `.env`:

```env
OPENAI_API_KEY=your_key_here
```

4. Run the CLI agent:

```bash
node index.js
```

## Agent Loop and Reasoning

The core of this assignment is implemented in `index.js`:

- A strict system prompt enforces loop-based reasoning.
- The model emits one JSON step at a time.
- TOOL steps call local tool functions.
- TOOL output is fed back as OBSERVE steps.
- The loop ends on OUTPUT or max step limit.

This ensures transparent decision-making and traceable reasoning.

## Website Clone Quality Notes

The clone in `scaler.html` includes:

- Styled navbar, hero, and multiple content sections
- CTA buttons and visual cards
- Responsive layout behavior
- Modern gradients, typography, and spacing patterns similar to the original style

## Rubric Mapping

- **GitHub Repository (2):** Code hosted and versioned on GitHub
- **YouTube Demo Video (2):** Add your video link in this README
- **Agent Loop & Reasoning (2):** Implemented in `index.js`
- **Quality of Cloned Website (2):** Delivered in `scaler.html`
- **Code Quality & Documentation (2):** Documented setup, architecture, and deliverables in this README

## Notes

- This project is for academic assignment/demo purposes.
- The clone is inspired by Scaler design patterns and is not an official Scaler product.
