// @ts-nocheck
import { render, screen } from "@testing-library/react";

import Footer from "./Footer";

describe("Footer", () => {
    it("renders legal links", () => {
        render(<Footer />);

        expect(screen.getByText(/Epimod Pipeline/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Privacy" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Security center" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Status" })).toBeInTheDocument();
    });
});
