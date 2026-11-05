class AccordionMenu extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <section class="mt-5">
        <div class="accordion" id="accordionPanelsStayOpenExample">
            <div class="accordion-item">
            <h2 class="accordion-header">
                <button
                class="accordion-button collapsed bg-success-subtle"
                style="font-size: 1.2em"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseOne"
                aria-expanded="true"
                aria-controls="panelsStayOpen-collapseOne"
                >
                <div>
                    <p>Incomes</p>
                    <p id="accordion-incomes">$000.00</p>
                </div>
                </button>
            </h2>
            <div
                id="panelsStayOpen-collapseOne"
                class="accordion-collapse collapse show"
            >
                <div class="accordion-body py-1" id="accordion-incomes-body"></div>
            </div>
            </div>
            <div class="accordion-item">
            <h2 class="accordion-header">
                <button
                class="accordion-button collapsed bg-danger-subtle"
                style="font-size: 1.2em"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseTwo"
                aria-expanded="false"
                aria-controls="panelsStayOpen-collapseTwo"
                >
                <div>
                    <p>Expenses</p>
                    <p id="accordion-expenses">$000.00</p>
                </div>
                </button>
            </h2>
            <div id="panelsStayOpen-collapseTwo" class="accordion-collapse collapse">
                <div class="accordion-body py-1" id="accordion-expenses-body"></div>
            </div>
            </div>
        </div>
    </section>
    `;
  }
}

customElements.define("accordion-menu", AccordionMenu);
