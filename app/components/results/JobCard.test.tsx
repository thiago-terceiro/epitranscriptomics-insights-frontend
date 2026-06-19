// @ts-nocheck
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import JobCard from "./JobCard";

describe("JobCard", () => {
    const toastModule = jest.requireMock("sonner");
    const fetchMock = global.fetch as jest.Mock;
    const createJob = (overrides: Record<string, any> = {}) => ({
        id: "job-123456",
        status: "completed",
        created_at: "2024-05-01T12:00:00Z",
        result: {
            execution_time: 180,
            completed_at: "2024-05-01T12:05:00Z",
            results: {
                cheui: {
                    sites_tsv: "https://example.com/cheui.tsv",
                    sites_bed: "https://example.com/cheui.bed",
                },
            },
        },
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("reveals completed job details when expanded", async () => {
        render(<JobCard job={createJob()} />);

        fireEvent.click(screen.getByRole("button", { name: "Expand details" }));

        expect(await screen.findByText("Download TSV")).toBeInTheDocument();
        expect(screen.getByText("Download BED")).toBeInTheDocument();
        expect(screen.getByText(/Summary Statistics/)).toBeInTheDocument();
    });

    it("handles download actions", async () => {
        const { toast } = toastModule;
        fetchMock.mockResolvedValueOnce({
            ok: true,
            blob: async () => new Blob(["content"]),
        });

        render(<JobCard job={createJob()} />);

        fireEvent.click(screen.getByRole("button", { name: "Expand details" }));
        fireEvent.click(await screen.findByRole("button", { name: /Download TSV/i }));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith("https://example.com/cheui.tsv");
        });
        expect(toast.info).toHaveBeenCalledWith("Downloading TSV...");
        expect(toast.success).toHaveBeenCalledWith("TSV downloaded successfully");
    });

    it("shows failure details", async () => {
        render(
            <JobCard
                job={createJob({
                    status: "failed",
                    result: {
                        error: "Something went wrong",
                    },
                })}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Expand details" }));

        expect(await screen.findByText("Job Failed")).toBeInTheDocument();
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("renders running state copy", async () => {
        render(
            <JobCard
                job={createJob({
                    status: "running",
                    result: undefined,
                })}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Expand details" }));

        expect(await screen.findByText("Analysis Running")).toBeInTheDocument();
        expect(screen.getByText(/actively being processed/)).toBeInTheDocument();
    });
});
