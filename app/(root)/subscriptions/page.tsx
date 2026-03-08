import { PricingTable } from "@clerk/nextjs";

export default function SubscriptionsPage() {
  return (
    <div className="container wrapper py-6 sm:py-10 overflow-x-hidden">
      <div className="flex flex-col items-center text-center mb-8 sm:mb-10 px-2">
        <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-3">Choose Your Plan</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
          Upgrade to unlock more books, longer sessions, and advanced features.
        </p>
      </div>

      <div className="w-full max-w-5xl mx-auto">
        <PricingTable />
      </div>
    </div>
  );
}