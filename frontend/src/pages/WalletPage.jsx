import Wallet from "../components/Wallet";

function WalletPage() {
  return (
    <section className="arena-container py-12">
      <div className="mb-6">
        <span className="arena-pill border-orange-500/30 bg-orange-500/10 text-arena-orange">Wallet</span>
        <h1 className="mt-4 text-5xl font-bold text-white">Cash Center</h1>
      </div>
      <Wallet />
    </section>
  );
}

export default WalletPage;
