// @ts-nocheck
import { render, screen } from "@testing-library/react";
import React from "react";

const providerCalls: Array<Record<string, unknown>> = [];

jest.mock("next-themes", () => ({
    __esModule: true,
    ThemeProvider: ({ children, ...props }: { children?: React.ReactNode }) => {
        providerCalls.push(props);
        return <div data-testid="mock-theme-provider">{children}</div>;
    },
}));

import ThemeProvider from "./theme-provider";

describe("ThemeProvider", () => {
    beforeEach(() => {
        providerCalls.length = 0;
    });

    it("wraps children and passes default themes", () => {
        render(
            <ThemeProvider attribute="class">
                <span>child node</span>
            </ThemeProvider>,
        );

        expect(screen.getByText("child node")).toBeInTheDocument();
        expect(providerCalls).toHaveLength(1);
        expect(providerCalls[0]?.themes).toEqual([
            "light",
            "dark",
            "mint",
            "blush",
            "lavender",
            "sky",
            "peach",
            "sand",
        ]);
    });
});
