// @ts-nocheck
import { render, screen } from "@testing-library/react";

import AnimatedSubmit from "./AnimatedSubmit";

describe("AnimatedSubmit", () => {
    const onClick = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("shows loading state", () => {
        render(<AnimatedSubmit loading={true} success={false} onClick={onClick} />);

        const button = screen.getByRole("button", { name: "Submitting…" });
        expect(button).toBeDisabled();
    });

    it("shows success state", () => {
        render(<AnimatedSubmit loading={false} success={true} onClick={onClick} />);

        const button = screen.getByRole("button", { name: "Submitted!" });
        expect(button).toBeEnabled();
    });
});
