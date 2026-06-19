// @ts-nocheck
import { render, screen, waitFor } from "@testing-library/react";

import JobProgress from "./JobProgress";

describe("JobProgress", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("updates status from server-sent events", async () => {
        const { container } = render(<JobProgress jobId="job-1" />);
        const source = (globalThis as any).MockEventSource.instances[0];

        expect(screen.getByText("Job status: queued")).toBeInTheDocument();

        source.emit({ status: "completed", progress: 85 });

        await waitFor(() => {
            expect(screen.getByText("Job status: completed")).toBeInTheDocument();
        });
        const progressFill = container.querySelectorAll('[data-motion="div"]')[1] as HTMLElement;
        expect(progressFill.style.width).toBe("85%");
    });
});
