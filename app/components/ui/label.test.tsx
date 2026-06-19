// @ts-nocheck
import { render, screen } from "@testing-library/react";

import { Label } from "./label";

describe("Label", () => {
    it("renders text and htmlFor attribute", () => {
        render(<Label htmlFor="field">Field Label</Label>);

        const label = screen.getByText("Field Label");
        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute("for", "field");
    });
});
