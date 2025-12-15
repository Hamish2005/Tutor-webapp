const API = "http://localhost:3000/api";

async function loadPayments() {
    const student = JSON.parse(localStorage.getItem("student"));
    const student_id = student?.student_id;

    const res = await fetch(`${API}/payments/outstanding/${student_id}`);
    const data = await res.json();

    console.log("PAYMENTS RESPONSE:", data);

    const div = document.getElementById("payList");
    div.innerHTML = "";

    // Properly check outstandingBills
    if (!data.success || !data.outstandingBills || data.outstandingBills.length === 0) {
        div.innerHTML = "<p>No outstanding bills!</p>";
        return;
    }

    data.outstandingBills.forEach(p => {
        div.innerHTML += `
        <div class="card p-3 mt-2">
            <h5>Booking #${p.booking_id}</h5>

            <p><b>Tutor:</b> ${p.tutor_name}</p>
            <p><b>Course:</b> ${p.course_title}</p>
            <p><b>Amount Due:</b> $${Number(p.price_dollars).toFixed(2)}</p>

            <button class="btn btn-success mt-2" onclick="pay(${p.payment_id})">
                Pay Now
            </button>
        </div>
        `;
    });
}

async function pay(payment_id) {
    const res = await fetch(`${API}/payments/pay/${payment_id}`, {
        method: "PUT"
    });

    const data = await res.json();

    alert(data.message || "Payment completed");
    loadPayments();
}

loadPayments();
