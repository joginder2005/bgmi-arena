import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://bgmi-arena-n3mk.vercel.app";

function JoinMatchModal({ match, isOpen, onClose, onJoined }) {
  const { isAuthenticated, token } = useAuth();
  const [walletBalance, setWalletBalance] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [joining, setJoining] = useState(false);
  const [status, setStatus] = useState({ error: "", success: "" });

  useEffect(() => {
    if (!isOpen || !isAuthenticated || !match?.id) {
      return;
    }

    const loadWallet = async () => {
      try {
        setLoadingWallet(true);
        setStatus({ error: "", success: "" });
        const response = await fetch(`${API_BASE_URL}/api/wallet/balance`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Failed to load wallet");
        }

        setWalletBalance(Number(data.wallet?.walletBalance || 0));
      } catch (error) {
        setStatus({ error: error.message, success: "" });
      } finally {
        setLoadingWallet(false);
      }
    };

    loadWallet();
  }, [isOpen, isAuthenticated, token, match?.id]);

  if (!isOpen || !match) {
    return null;
  }

  const canJoin = isAuthenticated && walletBalance !== null && walletBalance >= Number(match.entryFee || 0);

  const handleJoin = async () => {
    try {
      setJoining(true);
      setStatus({ error: "", success: "" });

      const response = await fetch(`${API_BASE_URL}/api/matches/${match.id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to join match");
      }

      setWalletBalance(Number(data.walletBalance || walletBalance || 0));
      setStatus({ error: "", success: "Payment successful. You joined the match." });
      onJoined?.();
    } catch (error) {
      setStatus({ error: error.message, success: "" });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div className="arena-card w-full max-w-2xl p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-arena-muted">Join Match</div>
            <h3 className="mt-2 text-3xl font-bold text-white">{match.title}</h3>
            <p className="mt-2 text-arena-muted">{match.map ? `${match.map} · ` : ""}{match.meta}</p>
          </div>
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-arena-muted">Entry Fee</div>
            <div className="mt-2 text-3xl font-bold text-arena-orange">₹{Number(match.entryFee || 0).toLocaleString("en-IN")}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-arena-muted">Prize Pool</div>
            <div className="mt-2 text-3xl font-bold text-white">₹{Number(match.prizePool || 0).toLocaleString("en-IN")}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-arena-muted">Per Kill</div>
            <div className="mt-2 text-3xl font-bold text-white">₹{Number(match.perKillReward || 0).toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          {!isAuthenticated ? (
            <div className="space-y-3">
              <div className="text-lg font-semibold text-white">Login required before payment</div>
              <p className="text-arena-muted">Sign in first, then your wallet balance and payment confirmation will appear here.</p>
              <Link to="/login" className="btn-primary">
                Login to Continue
              </Link>
            </div>
          ) : loadingWallet ? (
            <div className="text-arena-muted">Loading wallet balance...</div>
          ) : (
            <div className="space-y-3">
              <div className="text-lg font-semibold text-white">
                Wallet Balance: ₹{Number(walletBalance || 0).toLocaleString("en-IN")}
              </div>
              {walletBalance < Number(match.entryFee || 0) ? (
                <>
                  <p className="text-arena-muted">
                    You need ₹{Number(match.entryFee || 0).toLocaleString("en-IN")} to join this match.
                  </p>
                  <Link to="/wallet" className="btn-secondary">
                    Add Money in Wallet
                  </Link>
                </>
              ) : (
                <p className="text-arena-muted">Entry fee will be deducted from your wallet when you confirm payment.</p>
              )}
            </div>
          )}
        </div>

        {status.error ? <p className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{status.error}</p> : null}
        {status.success ? <p className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{status.success}</p> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleJoin} className="btn-primary" disabled={!canJoin || joining}>
            {joining ? "Processing Payment..." : "Pay & Join Match"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinMatchModal;
