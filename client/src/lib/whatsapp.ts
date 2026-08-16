export const MESSAGES = {
  generalInquiry:
    "Hello, I have a question about your plants. Could you help me?",
  orderConfirmation: "Hello, I just placed an order.",
  discussPlant: "Hello, I’d like to discuss this plant:",
  discussOrder: "Hello, I’d like to discuss this order:",
  placedOrder:
    "Hello, I have placed an order. Kindly share updates on the status and expected delivery time.",
} as const;

export function buildWhatsAppLink(number: string, message: string): string {
  const digits = number.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(number: string, message: string) {
  const url = buildWhatsAppLink(number, message);
  if (url) window.open(url, "_blank");
}

export function buildOrderMessage(lines: string[]): string {
  return `${MESSAGES.placedOrder}\n\nOrder details:\n${lines.join("\n")}`;
}

export function buildDiscussionMessage(
  lines: string[],
  intro: string,
): string {
  return `${intro}\n\n${lines.join("\n")}`;
}
