export default function TradeFlowLogo({ className = "h-8 w-8" }) {
  const base = import.meta.env.BASE_URL;
  return (
    <img
      src={`${base}favicon-192.png`}
      alt="TradeFlow"
      className={className}
      style={{ borderRadius: '20%' }}
    />
  );
}
