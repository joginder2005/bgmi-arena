import { transactions } from "../data/mockData";

function Wallet() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className="arena-card overflow-hidden p-6 shadow-glow">
        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-arena-muted">Available Balance</div>
        <div className="mt-4 text-6xl font-bold text-white">₹4,850</div>
        <p className="mt-2 max-w-md text-lg text-arena-muted">
          Funds can be used to join matches instantly or withdrawn to your bank after admin approval.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button className="btn-primary flex-1">Add Money</button>
          <button className="btn-secondary flex-1">Withdraw</button>
        </div>
      </section>

      <section className="arena-card overflow-hidden">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-3xl font-bold">Transaction History</h2>
        </div>
        <div className="divide-y divide-white/10">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <div className="text-xl font-semibold text-white">{transaction.type}</div>
                <div className="text-sm text-arena-muted">{transaction.time}</div>
              </div>
              <div className="text-right">
                <div
                  className={`text-xl font-bold ${
                    transaction.amount.startsWith("+") ? "text-arena-green" : "text-white"
                  }`}
                >
                  {transaction.amount}
                </div>
                <div className="text-sm text-arena-muted">{transaction.status}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Wallet;
