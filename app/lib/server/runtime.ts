const DEV_BACKEND_URL = "http://localhost:8080";

const readEnv = (name: string) => {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
};

const isProduction = process.env.NODE_ENV === "production";

const requireRuntimeUrl = (name: string, developmentDefault?: string) => {
    const configuredValue = readEnv(name);
    if (configuredValue) {
        return configuredValue;
    }

    if (!isProduction && developmentDefault) {
        return developmentDefault;
    }

    throw new Error(`${name} must be configured${developmentDefault ? " in production" : ""}.`);
};

const resolveWebSocketBase = (httpUrl: string) => {
    if (httpUrl.startsWith("https://")) {
        return `wss://${httpUrl.slice("https://".length)}`;
    }

    if (httpUrl.startsWith("http://")) {
        return `ws://${httpUrl.slice("http://".length)}`;
    }

    return httpUrl;
};

const isExplicitlyEnabled = (name: string) => readEnv(name) === "true";

export const getBackendUrl = () => requireRuntimeUrl("BACKEND_URL", DEV_BACKEND_URL);

export const getCollabWebSocketBaseUrl = () => {
    const wsBaseUrl = readEnv("COLLAB_BACKEND_WS_URL");
    return wsBaseUrl ?? resolveWebSocketBase(getBackendUrl());
};

export const isDevMockRoutesEnabled = () => !isProduction && isExplicitlyEnabled("ENABLE_DEV_MOCK_ROUTES");

export const isAlphaFoldDemoEnabled = () => !isProduction && isExplicitlyEnabled("ENABLE_ALPHAFOLD3_DEMO");

export const shouldProxyAlphaFold3 = () => isExplicitlyEnabled("ALPHAFOLD3_PROXY");