class AccordionMenu extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <section class="mt-5">
        <div class="accordion rounded-4 overflow-hidden shadow-sm" id="accordionPanelsStayOpenExample">
            <div class="accordion-item border-0 border-bottom">
                <h2 class="accordion-header">
                    <button
                    class="accordion-button accordion-income fw-semibold"
                    style="font-size: 1.2em"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#panelsStayOpen-collapseOne"
                    aria-expanded="true"
                    aria-controls="panelsStayOpen-collapseOne"
                    >
                    <div>
                        <p class="mb-0 text-primary">Incomes</p>
                        <p class="mb-0 fw-bold text-secondary" id="accordion-incomes">$000.00</p>
                    </div>
                    </button>
                </h2>
                <div
                    id="panelsStayOpen-collapseOne"
                    class="accordion-collapse collapse show"
                >
                    <div class="accordion-body bg-white py-2" id="accordion-incomes-body"></div>
                </div>
            </div>
            <div class="accordion-item border-0">
                <h2 class="accordion-header">
                    <button
                    class="accordion-button collapsed accordion-expense fw-semibold"
                    style="font-size: 1.2em"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#panelsStayOpen-collapseTwo"
                    aria-expanded="false"
                    aria-controls="panelsStayOpen-collapseTwo"
                    >
                    <div>
                        <p class="mb-0 text-primary">Expenses</p>
                        <p class="mb-0 fw-bold text-expense" id="accordion-expenses">$000.00</p>
                    </div>
                    </button>
                </h2>
                <div id="panelsStayOpen-collapseTwo" class="accordion-collapse collapse">
                    <div class="accordion-body bg-white py-2" id="accordion-expenses-body"></div>
                </div>
            </div>
        </div>
    </section>
    `;
  }
}

customElements.define("accordion-menu", AccordionMenu);
