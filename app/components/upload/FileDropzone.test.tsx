// @ts-nocheck
import { fireEvent, render } from "@testing-library/react";

import FileDropzone from "./FileDropzone";

describe("FileDropzone", () => {
    it("invokes onFiles when selection changes", () => {
        const onFiles = jest.fn();
        const { container } = render(<FileDropzone onFiles={onFiles} />);

        const input = container.querySelector("input");
        const file = new File(["content"], "reads.fast5", { type: "application/octet-stream" });

        fireEvent.change(input!, { target: { files: [file] } });

        expect(onFiles).toHaveBeenCalledWith([file]);
    });
});
