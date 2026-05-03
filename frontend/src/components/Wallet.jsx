import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://bgmi-arena-n3mk.vercel.app";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const transactionTypeLabels = {
  deposit: "Deposit",
  entry_fee: "Entry Fee",
  win: "Winnings",
  withdrawal: "Withdrawal",
};

function formatCurrency(amount) {
  return currencyFormatter.format(Number(amount || 0));
}

function formatStatus(status) {
  if (!status) {
    return "Pending";
  }

  return String(status).charAt(0).toUpperCase() + String(status).slice(1);
}

function formatTimestamp(value) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildTransactionActivity(transaction) {
  const amount = Number(transaction.amount || 0);
  const isCredit = transaction.type === "deposit" || transaction.type === "win";

  return {
    id: transaction._id,
    title: transactionTypeLabels[transaction.type] || "Transaction",
    time: formatTimestamp(transaction.createdAt),
    status: formatStatus(transaction.status),
    amount,
    amountLabel: `${isCredit ? "+" : "-"}${formatCurrency(amount)}`,
    positive: isCredit,
    createdAt: transaction.createdAt,
  };
}

function buildWithdrawalActivity(withdrawal) {
  return {
    id: `withdrawal-request-${withdrawal._id}`,
    title: "Withdrawal Request",
    time: formatTimestamp(withdrawal.createdAt),
    status: formatStatus(withdrawal.status),
    amount: Number(withdrawal.amount || 0),
    amountLabel: `-${formatCurrency(withdrawal.amount)}`,
    positive: false,
    createdAt: withdrawal.createdAt,
  };
}

async function ensureRazorpayLoaded() {
  if (window.Razorpay) {
    return true;
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function ActionPanel({
  type,
  amount,
  setAmount,
  processing,
  onSubmit,
  onCancel,
}) {
  if (!type) {
    return null;
  }

  const isDeposit = type === "deposit";

  return (
    <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <label className="auth-field flex-1">
          <span>{isDeposit ? "Add Money Amount" : "Withdraw Amount"}</span>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={isDeposit ? "Enter top-up amount" : "Enter withdrawal amount"}
          />
        </label>
        <div className="flex gap-3">
          <button type="button" onClick={onSubmit} className="btn-primary" disabled={processing}>
            {processing ? "Processing..." : isDeposit ? "Continue Payment" : "Request Withdrawal"}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={processing}>
            Cancel
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm text-arena-muted">
        {isDeposit
          ? "You will be redirected to Razorpay checkout if payment keys are configured."
          : "Withdrawal requests stay pending until an admin reviews and approves them."}
      </p>
    </div>
  );
}

function Wallet() {
  const { isAuthenticated, token, user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState({ error: "", success: "" });

  const loadWalletData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setStatus({ error: "", success: "" });

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [walletResponse, transactionsResponse, withdrawalsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/wallet/balance`, { headers }),
        fetch(`${API_BASE_URL}/api/wallet/transactions`, { headers }),
        fetch(`${API_BASE_URL}/api/withdrawals`, { headers }),
      ]);

      const [walletData, transactionsData, withdrawalsData] = await Promise.all([
        walletResponse.json().catch(() => ({})),
        transactionsResponse.json().catch(() => ({})),
        withdrawalsResponse.json().catch(() => ({})),
      ]);

      if (!walletResponse.ok) {
        throw new Error(walletData.message || "Failed to load wallet balance");
      }

      if (!transactionsResponse.ok) {
        throw new Error(transactionsData.message || "Failed to load wallet activity");
      }

      if (!withdrawalsResponse.ok) {
        throw new Error(withdrawalsData.message || "Failed to load withdrawals");
      }

      setWallet(walletData.wallet || null);
      setTransactions(transactionsData.transactions || []);
      setWithdrawals(withdrawalsData.withdrawals || []);
    } catch (error) {
      setStatus({ error: error.message, success: "" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [token]);

  const activity = useMemo(() => {
    const pendingOrRejectedWithdrawals = withdrawals
      .filter((withdrawal) => withdrawal.status !== "approved")
      .map(buildWithdrawalActivity);

    return [...transactions.map(buildTransactionActivity), ...pendingOrRejectedWithdrawals].sort(
      (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
    );
  }, [transactions, withdrawals]);

  const resetAction = () => {
    setActiveAction("");
    setAmount("");
  };

  const selectAction = (type) => {
    setActiveAction(type);
    setAmount("");
    setStatus({ error: "", success: "" });
  };

  const handleWithdrawal = async () => {
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setStatus({ error: "Enter a valid withdrawal amount", success: "" });
      return;
    }

    try {
      setProcessing(true);
      setStatus({ error: "", success: "" });

      const response = await fetch(`${API_BASE_URL}/api/withdrawals`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: numericAmount }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit withdrawal request");
      }

      setStatus({ error: "", success: "Withdrawal request submitted for admin approval." });
      resetAction();
      await loadWalletData();
    } catch (error) {
      setStatus({ error: error.message, success: "" });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeposit = async () => {
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setStatus({ error: "Enter a valid top-up amount", success: "" });
      return;
    }

    try {
      setProcessing(true);
      setStatus({ error: "", success: "" });

      const orderResponse = await fetch(`${API_BASE_URL}/api/wallet/deposit/order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: numericAmount }),
      });

      const orderData = await orderResponse.json().catch(() => ({}));

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Failed to create payment order");
      }

      const sdkLoaded = await ensureRazorpayLoaded();
      if (!sdkLoaded || !window.Razorpay) {
        throw new Error("Razorpay checkout could not load on this device");
      }

      const paymentResult = await new Promise((resolve, reject) => {
        const instance = new window.Razorpay({
          key: orderData.key,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "BGMI Arena",
          description: "Wallet top-up",
          order_id: orderData.order.id,
          prefill: {
            name: user?.username || "",
            contact: user?.emailOrPhone || "",
          },
          theme: {
            color: "#ff6a00",
          },
          handler: (response) => resolve(response),
          modal: {
            ondismiss: () => reject(new Error("Payment was cancelled")),
          },
        });

        instance.open();
      });

      const verifyResponse = await fetch(`${API_BASE_URL}/api/wallet/deposit/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentResult),
      });

      const verifyData = await verifyResponse.json().catch(() => ({}));

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || "Failed to verify payment");
      }

      setStatus({ error: "", success: "Wallet updated successfully." });
      resetAction();
      await loadWalletData();
    } catch (error) {
      setStatus({ error: error.message, success: "" });
    } finally {
      setProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="arena-card p-8">
        <h2 className="text-3xl font-bold text-white">Login to open your wallet</h2>
        <p className="mt-3 max-w-2xl text-lg text-arena-muted">
          Sign in to view your balance, top up funds, and track match payments.
        </p>
        <div className="mt-6">
          <Link to="/login" className="btn-primary">
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  const stats = wallet || {};

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className="arena-card overflow-hidden p-6 shadow-glow">
        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-arena-muted">Available Balance</div>
        {loading ? (
          <div className="mt-4 text-xl text-arena-muted">Loading wallet...</div>
        ) : (
          <>
            <div className="mt-4 text-6xl font-bold text-white">{formatCurrency(stats.walletBalance)}</div>
            <p className="mt-2 max-w-md text-lg text-arena-muted">
              Funds can be used to join matches instantly or withdrawn to your bank after admin approval.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-arena-muted">Total Earnings</div>
                <div className="mt-2 text-2xl font-bold text-white">{formatCurrency(stats.totalEarnings)}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-arena-muted">Matches</div>
                <div className="mt-2 text-2xl font-bold text-white">{Number(stats.matchesPlayed || 0)}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-arena-muted">Wins</div>
                <div className="mt-2 text-2xl font-bold text-white">{Number(stats.wins || 0)}</div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => selectAction("deposit")}
                className={`${activeAction === "deposit" ? "btn-primary" : "btn-secondary"} flex-1`}
              >
                Add Money
              </button>
              <button
                type="button"
                onClick={() => selectAction("withdraw")}
                className={`${activeAction === "withdraw" ? "btn-primary" : "btn-secondary"} flex-1`}
              >
                Withdraw
              </button>
            </div>

            <ActionPanel
              type={activeAction}
              amount={amount}
              setAmount={setAmount}
              processing={processing}
              onSubmit={activeAction === "deposit" ? handleDeposit : handleWithdrawal}
              onCancel={resetAction}
            />
          </>
        )}

        {status.error ? (
          <p className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {status.error}
          </p>
        ) : null}
        {status.success ? (
          <p className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {status.success}
          </p>
        ) : null}
      </section>

      <section className="arena-card overflow-hidden">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-3xl font-bold">Transaction History</h2>
        </div>
        <div className="divide-y divide-white/10">
          {loading ? (
            <div className="px-6 py-8 text-arena-muted">Loading activity...</div>
          ) : activity.length ? (
            activity.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="text-xl font-semibold text-white">{item.title}</div>
                  <div className="text-sm text-arena-muted">{item.time}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${item.positive ? "text-arena-green" : "text-white"}`}>
                    {item.amountLabel}
                  </div>
                  <div className="text-sm text-arena-muted">{item.status}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-arena-muted">No wallet activity yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Wallet;
