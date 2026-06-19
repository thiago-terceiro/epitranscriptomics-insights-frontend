// @ts-nocheck
import { fireEvent, render, screen } from "@testing-library/react";

import ModelSelector from "./ModelSelector";

describe("ModelSelector", () => {
    it("emits selected models", () => {
        const handleChange = jest.fn();
        render(<ModelSelector value={["cheui"]} onChange={handleChange} />);

        fireEvent.click(screen.getByRole("button", { name: "m6anet" }));
        expect(handleChange).toHaveBeenCalledWith(expect.arrayContaining(["cheui", "m6anet"]));
    });
});
