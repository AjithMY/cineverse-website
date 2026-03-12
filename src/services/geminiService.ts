import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "" 
});

const movieTools: FunctionDeclaration[] = [
  {
    name: "getTrendingMovies",
    description: "Get a list of currently trending movies.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        timeWindow: {
          type: Type.STRING,
          description: "The time window for trending movies (day or week).",
          enum: ["day", "week"]
        }
      }
    }
  },
  {
    name: "getPopularMovies",
    description: "Get a list of popular movies.",
  },
  {
    name: "getTopRatedMovies",
    description: "Get a list of top rated movies.",
  },
  {
    name: "getUpcomingMovies",
    description: "Get a list of upcoming movies.",
  },
  {
    name: "getHollywoodMovies",
    description: "Get a list of popular Hollywood (English) movies.",
  },
  {
    name: "getIndianMovies",
    description: "Get a list of popular Indian movies.",
  },
  {
    name: "searchMovies",
    description: "Search for movies by title or keyword.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "The search query."
        }
      },
      required: ["query"]
    }
  },
  {
    name: "getMovieDetails",
    description: "Get detailed information about a specific movie by its ID.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: "The movie ID."
        }
      },
      required: ["id"]
    }
  },
  {
    name: "getWatchProviders",
    description: "Get streaming availability (OTT platforms) for a specific movie by its ID.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: "The movie ID."
        }
      },
      required: ["id"]
    }
  }
];

export const geminiService = {
  createChatSession() {
    return ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are CineVerse AI, a world-class movie expert, product designer, and creative writer. 
        Your goal is to help users explore the world of cinema in an engaging, cinematic, and helpful way.

        FEATURES YOU SUPPORT:
        1. MOVIE INFORMATION: Provide detailed story summaries, cast/crew, genres, ratings, and interesting facts.
        2. SMART RECOMMENDATIONS: Suggest movies based on genre, mood (happy, emotional, thriller, etc.), language, actors, or time periods.
        3. OTT FINDER: Use the 'getWatchProviders' tool to tell users where they can stream a movie (Netflix, Prime, Disney+, etc.).
        4. MOVIE STORY GENERATOR: If asked to create a story, generate a custom movie plot, story outline, character descriptions, and dialogue.
        5. SCRIPT GENERATOR: Generate short movie scripts with scene titles, character dialogue, and action descriptions.
        6. CONVERSATIONAL EXPERT: Explain movie endings, compare films, and suggest curated watchlists.

        TOOLS AT YOUR DISPOSAL:
        - 'getTrendingMovies': See what's hot globally.
        - 'searchMovies': Find specific titles or browse by keywords/genres.
        - 'getIndianMovies' / 'getHollywoodMovies': Regional browsing.
        - 'getMovieDetails': Deep dive into a film's metadata.
        - 'getWatchProviders': Find streaming availability.

        TONE & STYLE:
        - Be enthusiastic, cinematic, and professional.
        - Use structured formatting (bullet points, bold text) for readability.
        - When recommending movies, always try to provide a brief "Why you'll love it" for each.
        - If you generate a story or script, make it feel like a real Hollywood pitch.

        IMPORTANT: If you use a tool to find movies, mention them in your response and explain what you found.`,
        tools: [{ functionDeclarations: movieTools }]
      }
    });
  }
};
