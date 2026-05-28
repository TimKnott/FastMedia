const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken?.startsWith("pk_test_")) return null;
  return (
    <div className="w-full bg-accent/15 border-b border-accent/30 px-4 py-2 text-center text-xs text-foreground">
      <span className="font-medium">Test mode:</span> all payments in the preview use Stripe test cards (e.g. 4242 4242 4242 4242).{" "}
      <a
        href="https://docs.lovable.dev/features/payments#test-and-live-environments"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-medium hover:text-accent"
      >
        Learn more
      </a>
    </div>
  );
}
