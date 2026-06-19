// @ts-nocheck
import { render } from "@testing-library/react";

const mockUseTheme = jest.fn(() => ({ theme: "light" }));
const sonnerModule = jest.requireMock("sonner");

jest.mock("next-themes", () => ({
    __esModule: true,
    useTheme: () => mockUseTheme(),
}));

import { Toaster } from "./sonner";

describe("Toaster", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseTheme.mockReturnValue({ theme: "light" });
    });

    it("normalizes pastel themes to light", () => {
        mockUseTheme.mockReturnValue({ theme: "mint" });

        render(<Toaster />);

        const call = sonnerModule.Toaster.mock.calls[0][0];
        expect(call.theme).toBe("light");
    });

    it("preserves supported themes", () => {
        mockUseTheme.mockReturnValue({ theme: "dark" });

        render(<Toaster />);

        const call = sonnerModule.Toaster.mock.calls[0][0];
        expect(call.theme).toBe("dark");
    });
});
