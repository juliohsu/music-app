# Music App

This is an example application showing how to use the [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime) with [WebRTC](https://platform.openai.com/docs/guides/realtime-webrtc). The application implements a music app interface with voice interaction capabilities.

## Features

- Real-time voice interaction with GPT-4
- Music app functionality with play, pause, and other seek bars operations
- WebRTC-based communication with OpenAI's Realtime API
- Clean and minimal React components architecture

## Project Structure

The application is organized as follows:

```
/client
  /components
    - App.jsx        # Main application component
    - Button.jsx     # Reusable button component
    - MusicPlayer.jsx       # Music Interface component
    - SessionControls.jsx # Session management controls
```


## Installation and usage

Before you begin, you'll need an OpenAI API key - [create one in the dashboard here](https://platform.openai.com/settings/api-keys). Create a `.env` file from the example file and set your API key in there:

```bash
cp .env.example .env
```

Running this application locally requires [Node.js](https://nodejs.org/) to be installed. Install dependencies for the application with:

```bash
npm install
```

Start the application server with:

```bash
npm run dev
```

This should start the console application on [http://localhost:3000](http://localhost:3000).

## Technical Details

This application is built with:
- React for the frontend UI
- Express.js server for API key management
- Vite as the build tool and development server
- WebRTC for real-time communication with OpenAI's API
- Tailwind CSS for styling

The application demonstrates how to:
1. Establish WebRTC connections with OpenAI's Realtime API
2. Handle real-time voice input and audio output
3. Implement function calling for cart operations
4. Manage state for shopping cart items and session control

For a more comprehensive example, see the [OpenAI Realtime Agents](https://github.com/openai/openai-realtime-agents) demo built with Next.js, using an agentic architecture inspired by [OpenAI Swarm](https://github.com/openai/swarm).

## Previous WebSockets version

The previous version of this application that used WebSockets on the client (not recommended in browsers) [can be found here](https://github.com/openai/openai-realtime-console/tree/websockets).

## License

MIT
