import { FaqSection } from "~/components/ui/faq-section";

const FAQ_ITEMS = [
  {
    question: "Which cities do you cover in Saudi Arabia?",
    answer:
      "We provide chauffeur services across major cities in KSA including Riyadh, Jeddah, Dammam, Al Khobar, Mecca, Medina, Taif, Tabuk, and Hail. We also offer intercity routes with transparent pricing.",
  },
  {
    question: "Do you provide airport pickup services?",
    answer:
      "Yes. We offer meet‑and‑greet at the terminal, monitor flight delays in real time, and include waiting time in the price so your driver is ready when you land.",
  },
  {
    question: "How do I receive my booking confirmation?",
    answer:
      "You’ll get an instant WhatsApp message with ride details, driver contact, vehicle, and pickup instructions. All updates are sent over WhatsApp.",
  },
  {
    question: "Can I modify or cancel my booking?",
    answer:
      "Modify by replying to the WhatsApp message. Change pickup time/location or passenger count up to 2 hours before. Cancellations are free up to 1 hour before pickup.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "All major cards and digital wallets are supported. Business accounts get invoices and optional corporate billing. Payment is processed securely at booking.",
  },
];

export default function FAQ() {
  return (
    <FaqSection
      title="Frequently Asked Questions"
      description="Quick answers about booking, airports, coverage and payments"
      items={FAQ_ITEMS}
      contactInfo={{
        title: "Still have questions?",
        description:
          "Message us and we’ll help you pick the right service in minutes.",
        buttonText: "Book or Chat",
        onContact: () => {
          // Prefer booking route; fall back to WhatsApp if desired
          if (typeof window !== "undefined") {
            window.location.href = "/book";
          }
        },
      }}
    />
  );
}
