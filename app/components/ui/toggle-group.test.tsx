// @ts-nocheck
import { fireEvent, render, screen } from "@testing-library/react";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

describe("ToggleGroup", () => {
    it("shares context across toggle items", () => {
        const handleChange = jest.fn();
        render(
            <ToggleGroup type="multiple" value={["cheui"]} onValueChange={handleChange} variant="outline">
                <ToggleGroupItem value="cheui">CHEUI</ToggleGroupItem>
                <ToggleGroupItem value="m6anet">m6Anet</ToggleGroupItem>
            </ToggleGroup>,
        );

        const cheui = screen.getByRole("button", { name: "CHEUI" });
        expect(cheui.className).toContain("border");

        fireEvent.click(screen.getByRole("button", { name: "m6Anet" }));
        expect(handleChange).toHaveBeenCalledWith(expect.arrayContaining(["cheui", "m6anet"]));
    });
});
