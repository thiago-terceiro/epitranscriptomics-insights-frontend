// @ts-nocheck
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import ResultsDashboard from "./ResultsDashboard";

describe("ResultsDashboard", () => {
    const fetchMock = global.fetch as jest.Mock;
    const { toast } = jest.requireMock("sonner");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("loads jobs and displays summary counts", async () => {
        const jobs = [
            { id: "job-1", status: "completed", created_at: "2024-05-01T12:00:00Z" },
            { id: "job-2", status: "failed" },
            { id: "job-3", status: "running" },
        ];
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ jobs }),
        });

        render(<ResultsDashboard />);

        await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/jobs/list"));

        await waitFor(() => {
            const totalCard = screen.getByText("Total Jobs").closest('[data-slot="card-header"]');
            expect(totalCard).not.toBeNull();
            expect(within(totalCard!).getByText("3")).toBeInTheDocument();
        });

        const completedDescriptions = screen.getAllByText("Completed");
        const statDescription = completedDescriptions.find((el) => el.getAttribute("data-slot") === "card-description");
        expect(statDescription).toBeTruthy();
        const completedHeader = statDescription!.closest('[data-slot="card-header"]');
        expect(completedHeader).not.toBeNull();
        expect(within(completedHeader!).getByText("1")).toBeInTheDocument();

        const expandButtons = await screen.findAllByRole("button", { name: "Expand details" });
        expect(expandButtons).toHaveLength(3);
    });

    it("filters jobs by status", async () => {
        const jobs = [
            { id: "job-1", status: "completed" },
            { id: "job-2", status: "failed" },
            { id: "job-3", status: "running" },
        ];
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ jobs }),
        });

        render(<ResultsDashboard />);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalled();
        });

        fireEvent.click(screen.getByRole("button", { name: "Completed" }));

        const expandButtons = await screen.findAllByRole("button", { name: "Expand details" });
        expect(expandButtons).toHaveLength(1);
    });

    it("shows error state when fetch fails", async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false,
            json: async () => ({}),
        });

        render(<ResultsDashboard />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Failed to load jobs");
        });

        expect(screen.getByText("No jobs found")).toBeInTheDocument();
    });
});
