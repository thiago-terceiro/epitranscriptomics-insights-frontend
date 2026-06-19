// @ts-nocheck
import { render, screen } from "@testing-library/react";

import { Input } from "./input";

import { Label } from "./label";

describe("Input", () => {
    it("associates with labels", () => {
        render(
            <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="user@example.com" />
            </div>,
        );

        expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("renders disabled state", () => {
        render(<Input disabled placeholder="disabled" />);

        expect(screen.getByPlaceholderText("disabled")).toBeDisabled();
    });
});
