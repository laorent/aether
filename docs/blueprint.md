# **App Name**: GeminiFlow

## Core Features:

- Secure API Key Handling: Reads the Gemini API key from a `.env.local` file, ensuring keys are not hardcoded. Instructions in README detail how to configure the Vercel environment variables.
- Conversational History: Persists and retrieves conversation history on the client side. Sends the history to the backend to provide context for Gemini's responses. Provides UI features to clear or download the entire chat history as well.
- Streaming Responses: Implements server-sent events (SSE) for incremental output from Gemini. The frontend progressively renders tokens as they arrive, providing a real-time “generating” feel. The backend transmits the repsonse via SSE. Avoids performance issues due to large amounts of text.
- Image Upload & Analysis: Enables users to upload images, proxied through the backend and sent to the model using inline base64 for analysis. Displays image thumbnails along with the model's analysis and follow-up questions.
- AI-Powered Tool Integration: Uses generative AI as a tool. The frontend intelligently decides to incorporate Gemini's tool usage and built-in web search by identifying the source and links related to a fragment of generated information. These can then be shown as a link. 
- Robust Error Handling: Includes friendly error messages, exponential backoff retry strategies, and rate limit notifications. README documents rate limitations and instructions on how to switch models if a user's account is being throttled by the server.
- Gemini Interaction: Backend interaction to invoke Gemini models for text-based conversation.

## Style Guidelines:

- Primary color: Deep purple (#6750A4) to evoke intelligence and sophistication.
- Background color: Light gray (#F2F2F2) provides a clean and unobtrusive backdrop.
- Accent color: Teal (#008080) to highlight interactive elements.
- Body and headline font: 'Inter' (sans-serif) provides a neutral and objective feel suitable for long lines of text.
- Code Font: 'Source Code Pro' for display of computer code, such as in generated examples from the model
- Use a consistent set of icons to represent different functionalities within the chatbot, such as sending messages, uploading images, and clearing history.
- Implement subtle animations for loading states and transitions to enhance the user experience and provide visual feedback.