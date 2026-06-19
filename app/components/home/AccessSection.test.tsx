// @ts-nocheck
import { render, screen } from "@testing-library/react";

import AccessSection from "./AccessSection";

describe("AccessSection", () => {
    it("renders registration and login forms", () => {
        render(<AccessSection />);

        expect(screen.getByRole("heading", { name: "Request access" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
        expect(screen.getByLabelText("Full name")).toBeInTheDocument();
        expect(screen.getByLabelText("Work email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });
});
