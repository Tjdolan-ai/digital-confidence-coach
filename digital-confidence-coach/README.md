# Digital Confidence Coach

A step-by-step guidance system for non-technical users to safely complete intimidating tech tasks.

## Overview

The Digital Confidence Coach is a "hand-holding" assistant that breaks down complex technical tasks (like installing software or checking files) into simple, numbered steps with automatic safety checks. It is designed to reduce anxiety and prevent common security mistakes.

## Features

- **Guided Task Flows**: Step-by-step instructions for common tasks.
- **Safety Checks**: Client-side validation for URLs and file extensions.
- **Confidence Meter**: Visual feedback on the risk level of user actions.
- **Swiss Design System**: A clean, high-contrast interface focused on clarity and precision.
- **Privacy First**: All checks run locally in the browser; no data is sent to external servers.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Routing**: Wouter
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

2.  **Run Development Server**:
    ```bash
    pnpm dev
    ```

3.  **Build for Production**:
    ```bash
    pnpm build
    ```

## Deployment

This project is a static web application. After running `pnpm build`, the `dist` folder can be deployed to any static hosting provider such as:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 / CloudFront

## Adding New Tasks

To add a new task flow, edit `client/src/lib/data.ts` and add a new entry to the `tasks` array. Each task consists of a unique ID, title, description, icon, and a list of steps.

## License

MIT License
