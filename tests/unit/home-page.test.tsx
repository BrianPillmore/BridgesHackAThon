import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the public meeting follow-up workspace", () => {
    render(createElement(HomePage));

    expect(
      screen.getByRole("heading", { name: "Public Meeting Follow-Up Kit" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Government workflow/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Public agenda")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Summary" })).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByText(/Community Mobility Improvements Listening Session/i),
    ).toBeInTheDocument();
  });

  it("generates action, FAQ, communications, and review artifacts", async () => {
    const user = userEvent.setup();
    render(createElement(HomePage));

    await user.click(screen.getByRole("tab", { name: "Actions" }));
    const actionOutput = screen.getByText(/Action tracker/i, { selector: "pre" });
    expect(actionOutput).toHaveTextContent(/Publish a plain-language meeting summary/i);

    await user.click(screen.getByRole("tab", { name: "FAQ" }));
    expect(screen.getByText(/Was a final decision made at the meeting/i)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Comms" }));
    expect(
      screen.getByText(/Follow-up communication plan/i, { selector: "pre" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Review" }));
    expect(screen.getByText(/Government-ready review checklist/i)).toBeInTheDocument();
  });
});
