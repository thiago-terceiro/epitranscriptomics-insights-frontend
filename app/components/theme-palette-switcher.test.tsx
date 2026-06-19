// @ts-nocheck
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockSetTheme = jest.fn();
const mockUseTheme = jest.fn(() => ({
    theme: "system",
    resolvedTheme: "light",
    setTheme: mockSetTheme,
}));

jest.mock("next-themes", () => ({
    __esModule: true,
    useTheme: () => mockUseTheme(),
}));

import ThemePaletteSwitcher from "./theme-palette-switcher";

describe("ThemePaletteSwitcher", () => {
    beforeEach(() => {
        mockSetTheme.mockClear();
        mockUseTheme.mockImplementation(() => ({
            theme: "system",
            resolvedTheme: "light",
            setTheme: mockSetTheme,
        }));
    });

    it("renders base mode buttons and applies selection", async () => {
        render(<ThemePaletteSwitcher />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "System" })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: "Light" }));
        expect(mockSetTheme).toHaveBeenCalledWith("light");
    });

    it("switches to palette themes", async () => {
        render(<ThemePaletteSwitcher />);

        await waitFor(() => {
            expect(screen.getByLabelText("Mint theme")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByLabelText("Mint theme"));
        expect(mockSetTheme).toHaveBeenCalledWith("mint");
    });
});
