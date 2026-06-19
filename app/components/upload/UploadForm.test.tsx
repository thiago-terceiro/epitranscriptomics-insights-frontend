// @ts-nocheck
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import UploadForm from "./UploadForm";

describe("UploadForm", () => {
    const fetchMock = global.fetch as jest.Mock;
    const { toast } = jest.requireMock("sonner");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("validates inputs before submission", () => {
        const { container } = render(<UploadForm />);

        fireEvent.click(screen.getByRole("button", { name: "Submit" }));
        expect(toast.error).toHaveBeenCalledWith("Upload raw signal (FAST5/POD5) and sequencing reads (FASTQ) files");

        toast.error.mockClear();
        const fileInput = container.querySelector('input[type="file"]');
        const fast5 = new File(["data"], "reads.fast5");
        const fastq = new File(["data"], "reads.fastq");

        fireEvent.change(fileInput!, { target: { files: [fast5, fastq] } });
        fireEvent.click(screen.getByRole("button", { name: "Submit" }));
        expect(toast.error).toHaveBeenCalledWith("Enter a reference FASTA URL");
    });

    it("submits successfully with valid data", async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ job_id: "job-42" }),
        });

        const { container } = render(<UploadForm />);

        const fileInput = container.querySelector('input[type="file"]');
        const fast5 = new File(["data"], "reads.fast5");
        const fastq = new File(["data"], "reads.fastq");
        fireEvent.change(fileInput!, { target: { files: [fast5, fastq] } });

        fireEvent.change(screen.getByLabelText("Reference FASTA URL"), {
            target: { value: "https://example.com/genome.fa" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith("/api/jobs/submit", expect.any(Object));
        });

        const request = fetchMock.mock.calls[0][1];
        const entries = Array.from((request.body as FormData).entries());
        expect(entries.some(([key]) => key === "files")).toBe(true);
        expect(entries).toContainEqual(["reference_fasta", "https://example.com/genome.fa"]);
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("submitted successfully"));
        expect(await screen.findByRole("button", { name: "Submitted!" })).toBeInTheDocument();
    });
});
