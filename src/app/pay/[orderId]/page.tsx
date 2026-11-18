import type { Metadata } from "next";
import { PayCard } from "@/components/PayCard";

export const metadata: Metadata = {
  title: "پرداخت کارت‌به‌کارت",
  robots: { index: false, follow: false },
};

export default async function PayPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
      <PayCard orderId={orderId} />
    </main>
  );
}
