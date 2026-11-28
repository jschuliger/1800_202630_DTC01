class DonutChart extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <section class="d-inline-flex flex-column align-items-center gap-4 mt-5 border bg-accent rounded-4 px-5 py-2">
            <div
            class="btn-group"
            role="group"
            aria-label="Basic radio toggle button group"
            id="donut-type"
            >
            <input
                type="radio"
                class="btn-check"
                name="donut-types"
                id="donut-incomes"
                value="incomes"
                checked
            />
            <label class="btn btn-theme" for="donut-incomes"
                >Income</label
            >
            <input
                type="radio"
                class="btn-check"
                name="donut-types"
                id="donut-expenses"
                value="expenses"
            />
            <label class="btn btn-theme" for="donut-expenses"
                >Expenses</label
            >
            <input
                type="radio"
                class="btn-check"
                name="donut-types"
                id="donut-net-worth"
                value="net-worth"
            />
            <label class="btn btn-theme" for="donut-net-worth"
                >Net Worth</label
            >
            </div>
            <!-- Donut chart -->
            <div>
            <canvas id="donut-chart"></canvas>
            </div>
        </section>
        `;
  }
}

customElements.define("donut-chart", DonutChart);
