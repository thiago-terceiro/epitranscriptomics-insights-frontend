// @ts-nocheck
import { render, screen } from "@testing-library/react";

import { Toggle } from "./toggle";

describe("Toggle", () => {
    it("toggles aria-pressed state", () => {
        render(
            <Toggle pressed={false} onPressedChange={jest.fn()}>
                Toggle
            </Toggle>,
        );

        const toggle = screen.getByRole("button", { name: "Toggle" });
        expect(toggle).toHaveAttribute("data-state", "off");
    });

    it("supports custom variants", () => {
        render(<Toggle variant="outline">Outline Toggle</Toggle>);

        const toggle = screen.getByRole("button", { name: "Outline Toggle" });
        expect(toggle.className).toContain("border");
    });
});
