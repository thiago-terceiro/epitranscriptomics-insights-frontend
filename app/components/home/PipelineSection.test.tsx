// @ts-nocheck
import { render, screen } from "@testing-library/react";

import PipelineSection from "./PipelineSection";

describe("PipelineSection", () => {
    it("lists pipeline capabilities", () => {
        render(<PipelineSection />);

        expect(screen.getByRole("article", { name: "FastAPI gateway" })).toBeInTheDocument();
        expect(screen.getByRole("article", { name: "Celery scale-out" })).toBeInTheDocument();
        expect(screen.getByRole("article", { name: "Observability native" })).toBeInTheDocument();
        expect(screen.getByRole("article", { name: "Secure by default" })).toBeInTheDocument();
    });
});
