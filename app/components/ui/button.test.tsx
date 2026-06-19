// @ts-nocheck
import { render, screen } from "@testing-library/react";

import { Button } from "./button";

describe("Button", () => {
    it("applies default styling", () => {
        render(<Button>Primary</Button>);

        const button = screen.getByRole("button", { name: "Primary" });
        expect(button).toHaveAttribute("data-slot", "button");
        expect(button.className).toContain("bg-primary");
    });

    it("supports outline variant", () => {
        render(
            <Button variant="outline">
                Outline
            </Button>,
        );

        const button = screen.getByRole("button", { name: "Outline" });
        expect(button.className).toContain("border");
    });
});
