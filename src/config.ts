import fs from 'fs';
import path from 'path';
import toml from '@iarna/toml';

const configFileName = 'config.toml';

interface Config {
  GENERAL: {
    PORT: number;
    SIMILARITY_MEASURE: string;
    SUPER_SECRET_KEY: string;
  };
  API_KEYS: {
    OPENAI: string;
    GROQ: string;
  };
  API_ENDPOINTS: {
    SEARXNG: string;
    OLLAMA: string;
  };
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

const loadConfig = () =>
  toml.parse(
    fs.readFileSync(path.join(__dirname, `../${configFileName}`), 'utf-8'),
  ) as any as Config;

const loadEnv = () => {
  return {
    GENERAL: {
      PORT: Number(process.env.PORT),
      SIMILARITY_MEASURE: process.env.SIMILARITY_MEASURE,
      SUPER_SECRET_KEY: process.env.SUPER_SECRET_KEY,
    },
    API_KEYS: {
      OPENAI: process.env.OPENAI,
      GROQ: process.env.GROQ,
    },
    API_ENDPOINTS: {
      SEARXNG: process.env.SEARXNG_API_URL,
      OLLAMA: process.env.OLLAMA_API_URL,
    },
  } as Config;
};

export const getPort = () => loadConfig().GENERAL.PORT;

export const getAccessKey = () =>
  loadEnv().GENERAL.SUPER_SECRET_KEY || loadConfig().GENERAL.SUPER_SECRET_KEY;

export const getSimilarityMeasure = () =>
  loadConfig().GENERAL.SIMILARITY_MEASURE;

export const getOpenaiApiKey = () =>
  loadEnv().API_KEYS.OPENAI || loadConfig().API_KEYS.OPENAI;

export const getGroqApiKey = () =>
  loadEnv().API_KEYS.GROQ || loadConfig().API_KEYS.GROQ;

export const getSearxngApiEndpoint = () =>
  loadEnv().API_ENDPOINTS.SEARXNG || loadConfig().API_ENDPOINTS.SEARXNG;

export const getOllamaApiEndpoint = () =>
  loadEnv().API_ENDPOINTS.OLLAMA || loadConfig().API_ENDPOINTS.OLLAMA;

export const updateConfig = (config: RecursivePartial<Config>) => {
  const currentConfig = loadConfig();

  for (const key in currentConfig) {
    if (!config[key]) config[key] = {};

    if (typeof currentConfig[key] === 'object' && currentConfig[key] !== null) {
      for (const nestedKey in currentConfig[key]) {
        if (
          !config[key][nestedKey] &&
          currentConfig[key][nestedKey] &&
          config[key][nestedKey] !== ''
        ) {
          config[key][nestedKey] = currentConfig[key][nestedKey];
        }
      }
    } else if (currentConfig[key] && config[key] !== '') {
      config[key] = currentConfig[key];
    }
  }

  fs.writeFileSync(
    path.join(__dirname, `../${configFileName}`),
    toml.stringify(config),
  );
};
