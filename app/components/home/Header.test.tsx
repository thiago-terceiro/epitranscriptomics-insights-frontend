// @ts-nocheck
import { render, screen } from "@testing-library/react";

import Header from "./Header";

describe("Header", () => {
    it("renders navigation links", () => {
        render(<Header />);

        expect(screen.getByRole("link", { name: "EI Epimod Insights" })).toHaveAttribute("href", "/");
        expect(screen.getByRole("link", { name: "Pipeline" })).toHaveAttribute("href", "/#pipeline");
        expect(screen.getByRole("link", { name: "Stack" })).toHaveAttribute("href", "/#pipeline");
        expect(screen.getByRole("link", { name: "Theory" })).toHaveAttribute("href", "/theory");
        expect(screen.getByRole("link", { name: "Upload" })).toHaveAttribute("href", "/upload");
    });
});
