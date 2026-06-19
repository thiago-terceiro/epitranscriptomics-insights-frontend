import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";
import React from "react";
import "whatwg-fetch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const jest: any;

if (!(globalThis as any).TextEncoder) {
    (globalThis as any).TextEncoder = TextEncoder;
}

if (!(globalThis as any).TextDecoder) {
    (globalThis as any).TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}

type MatchMediaQueryList = {
    matches: boolean;
    media: string;
    onchange: ((event: MediaQueryListEvent) => void) | null;
    addListener: (listener: (event: MediaQueryListEvent) => void) => void;
    removeListener: (listener: (event: MediaQueryListEvent) => void) => void;
    addEventListener: (type: string, listener: (event: MediaQueryListEvent) => void) => void;
    removeEventListener: (type: string, listener: (event: MediaQueryListEvent) => void) => void;
    dispatchEvent: (event: MediaQueryListEvent) => boolean;
};

if (!globalThis.matchMedia) {
    globalThis.matchMedia = jest.fn().mockImplementation((query: string): MatchMediaQueryList => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(() => true),
    }));
}

class MockResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
}

if (!globalThis.ResizeObserver) {
    (globalThis as any).ResizeObserver = MockResizeObserver;
}

class MockIntersectionObserver {
    constructor(private readonly callback: IntersectionObserverCallback) {
        this.callback = callback;
    }

    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();

    trigger(entries: IntersectionObserverEntry[]) {
        this.callback(entries, this as unknown as IntersectionObserver);
    }
}

if (!globalThis.IntersectionObserver) {
    (globalThis as any).IntersectionObserver = MockIntersectionObserver;
}

class MockEventSource {
    static instances: MockEventSource[] = [];
    onmessage: ((event: MessageEvent<string>) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    onopen: ((event: Event) => void) | null = null;
    readyState = 0;
    url: string;

    constructor(url: string) {
        this.url = url;
        MockEventSource.instances.push(this);
    }

    emit(data: Record<string, unknown>) {
        this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent<string>);
    }

    close = jest.fn();
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    dispatchEvent = jest.fn(() => true);
}

(globalThis as any).EventSource = MockEventSource as unknown as typeof EventSource;
(globalThis as any).MockEventSource = MockEventSource;

type MotionMockProps = {
    children?: React.ReactNode;
    animate?: Record<string, unknown>;
    style?: React.CSSProperties;
    [key: string]: unknown;
};

const motionProxy = new Proxy(
    {},
    {
        get(_target, key: string) {
            return React.forwardRef<HTMLElement, MotionMockProps>(
                ({ children, animate, style, whileHover, whileTap, whileFocus, transition, variants, initial, exit, ...rest }, ref) => {
                    const resolvedStyle = {
                        ...(style ?? {}),
                        ...(typeof animate === "object" && animate ? animate : {}),
                    } as React.CSSProperties;

                    return React.createElement(
                        key,
                        {
                            ref,
                            style: resolvedStyle,
                            "data-motion": key,
                            // Drop motion-only props to avoid React DOM warnings
                            ...rest,
                        },
                        children as React.ReactNode,
                    );
                },
            );
        },
    },
);

jest.mock("framer-motion", () => ({
    __esModule: true,
    motion: motionProxy,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
        React.createElement(React.Fragment, null, children),
}));

const toastMock = {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
};

const sonnerComponent = jest.fn(({ children, ...props }: { children?: React.ReactNode }) =>
    React.createElement(
        "div",
        {
            "data-testid": "sonner-mock",
            ...props,
        },
        children,
    ),
);

jest.mock("sonner", () => ({
    __esModule: true,
    toast: toastMock,
    Toaster: sonnerComponent,
}));

const useDropzoneMock = jest.fn(({ onDrop }: { onDrop?: (files: File[]) => void }) => ({
    getRootProps: () => ({ onClick: jest.fn() }),
    getInputProps: () => ({
        type: "file",
        onChange: (event: { target: { files?: FileList | File[] | null } }) => {
            const filesValue = event.target.files ?? [];
            const files = Array.isArray(filesValue) ? filesValue : Array.from(filesValue ?? []);
            onDrop?.(files as File[]);
        },
    }),
    isDragActive: false,
}));

jest.mock("react-dropzone", () => ({
    __esModule: true,
    useDropzone: useDropzoneMock,
}));

if (!(globalThis as any).URL) {
    (globalThis as any).URL = { createObjectURL: jest.fn(), revokeObjectURL: jest.fn() } as unknown as URL;
}

if (!(globalThis.URL as any).createObjectURL) {
    (globalThis.URL as any).createObjectURL = jest.fn();
}

if (!(globalThis.URL as any).revokeObjectURL) {
    (globalThis.URL as any).revokeObjectURL = jest.fn();
}

if (!(globalThis as any).scrollTo) {
    (globalThis as any).scrollTo = () => { };
}

if (!(Response as any).json) {
    (Response as any).json = (body: unknown, init: ResponseInit = {}) => {
        const headers = new Headers(init.headers);
        if (!headers.has("content-type")) {
            headers.set("content-type", "application/json");
        }
        return new Response(JSON.stringify(body), { ...init, headers });
    };
}

const fetchMock = jest.fn(async () => ({
    ok: true,
    json: async () => ({}),
}) as Response);

(globalThis as any).fetch = fetchMock;

const resetMocks = () => {
    fetchMock.mockClear();
    sonnerComponent.mockClear();
    Object.values(toastMock).forEach((fn) => fn.mockClear());
    MockEventSource.instances = [];
};

if (typeof (globalThis as any).beforeEach === "function") {
    (globalThis as any).beforeEach(resetMocks);
}
