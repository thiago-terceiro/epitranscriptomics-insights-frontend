// @ts-nocheck
import { render, screen } from "@testing-library/react";

import HeroSection from "./HeroSection";

describe("HeroSection", () => {
    it("highlights deployment callouts", () => {
        render(<HeroSection />);

        expect(screen.getByRole("heading", {
            name: /Accelerate m6A and m5C discovery/i,
        })).toBeInTheDocument();
        expect(screen.getByText("Containerized runners")).toBeInTheDocument();
        expect(screen.getByLabelText("Deployment highlights")).toBeInTheDocument();
    });
});
