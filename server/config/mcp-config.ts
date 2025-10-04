import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

export const MCP_CONFIG = {
  mcpServers: {
    notionApi: {
      command: "docker",
      args: [
        "run",
        "--rm",
        "-i",
        "-e", "NOTION_TOKEN",
        "mcp/notion"
      ],
      env: {
        NOTION_TOKEN: process.env.NOTION_TOKEN || ""
      }
    },

    "chrome-devtools": {
      command: "npx",
      args: ["chrome-devtools-mcp@latest"]
    },

    "gemini-cli": {
      type: "stdio" as const,
      command: "npx",
      args: ["-y", "gemini-mcp-tool"],
      env: {}
    },

    "shopify-dev-mcp": {
      command: "npx",
      args: ["-y", "@shopify/dev-mcp@latest"]
    },

    "mcp-graphql": {
      command: "npx",
      args: ["-y", "mcp-graphql"],
      env: {
        ENDPOINT: process.env.SHOPIFY_ENDPOINT || "",
        HEADERS: JSON.stringify({
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
          "Content-Type": "application/json"
        }),
        ALLOW_MUTATIONS: "true"
      }
    },

    mem0: {
      command: "npx",
      args: ["-y", "@pinkpixel/mem0-mcp"],
      env: {
        MEM0_API_KEY: process.env.MEM0_API_KEY || "",
        MEM0_ORG_ID: process.env.MEM0_ORG_ID || "",
        MEM0_PROJECT_ID: process.env.MEM0_PROJECT_ID || ""
      }
    }
  }
};
