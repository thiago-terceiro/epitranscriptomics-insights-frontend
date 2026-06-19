// @ts-nocheck
import { fireEvent, render, screen } from "@testing-library/react";

import ReferenceSelector from "./ReferenceSelector";

describe("ReferenceSelector", () => {
    it("propagates URL changes", () => {
        const handleChange = jest.fn();
        render(<ReferenceSelector value="" onChange={handleChange} />);

        fireEvent.change(screen.getByLabelText("Reference FASTA URL"), {
            target: { value: "https://example.com/genome.fa" },
        });

        expect(handleChange).toHaveBeenCalledWith("https://example.com/genome.fa");
    });
});
