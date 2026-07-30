/**
 * A controller to help with form submission
 */
class FormSubmitController {
    constructor(host, options) {
        (this.host = host).addController(this);
        this.options = Object.assign({ form: (input) => {
                return input.closest("form");
            } }, options);
    }
    hostConnected() {
        this.form = this.options.form(this.host);
    }
    hostDisconnected() {
        if (this.form) {
            this.form = undefined;
        }
    }
    /**
     * Creates a temporary native HTML button that can participate in form and invoke form submits and reset
     * Button is removed once action is performed
     */
    doAction(type, invoker) {
        if (this.form) {
            const button = document.createElement("button");
            button.type = type;
            button.style.position = "absolute";
            button.style.width = "0";
            button.style.height = "0";
            button.style.clipPath = "inset(50%)";
            button.style.overflow = "hidden";
            button.style.whiteSpace = "nowrap";
            // Pass form attributes through to the temporary button
            if (invoker) {
                ["formaction", "formmethod", "formnovalidate", "formtarget"].forEach(attr => {
                    if (invoker.hasAttribute(attr)) {
                        button.setAttribute(attr, invoker.getAttribute(attr));
                    }
                });
                // Forward name/value so the submitter's data is included in FormData
                if (type === "submit" && invoker.hasAttribute("name")) {
                    button.name = invoker.getAttribute("name");
                    button.value = invoker.getAttribute("value") || "";
                }
            }
            this.form.append(button);
            button.click();
            button.remove();
        }
    }
    /** Resets the form, restoring all the control to their default value */
    reset(invoker) {
        this.doAction("reset", invoker);
    }
    /** Submits the form, triggering validation and form data injection. */
    submit(invoker) {
        // Calling form.submit() bypasses the submit event and constraint validation. To prevent this, we can inject a
        // native submit button into the form, "click" it, then remove it to simulate a standard form submission.
        this.doAction("submit", invoker);
    }
}

export { FormSubmitController };
//# sourceMappingURL=formSubmitController.js.map
