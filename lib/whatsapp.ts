export type MaintenanceMessage = {
  ownerName: string;
  ownerPhone: string;
  boatName: string;
  description: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  date: string;
  status: string;
};

export type ReminderMessage = {
  ownerName: string;
  ownerPhone: string;
  boatName: string;
  dueDate: string;
  maintenanceType: string;
};

function cleanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "90" + digits.slice(1);
  if (digits.startsWith("90")) return digits;
  return "90" + digits;
}

export function maintenanceCompleteLink(msg: MaintenanceMessage): string {
  const text = [
    `Sayın ${msg.ownerName},`,
    ``,
    `⚓ *${msg.boatName}* teknenize ait bakım tamamlanmıştır.`,
    ``,
    `📋 *İşlem:* ${msg.description}`,
    `📅 *Tarih:* ${msg.date}`,
    ``,
    `💰 *Maliyet Özeti*`,
    `• İşçilik: ₺${msg.laborCost.toFixed(2)}`,
    `• Malzeme: ₺${msg.partsCost.toFixed(2)}`,
    `• *Toplam: ₺${msg.totalCost.toFixed(2)}*`,
    ``,
    `Teşekkür ederiz. 🚢`,
  ].join("\n");

  return `https://wa.me/${cleanPhone(msg.ownerPhone)}?text=${encodeURIComponent(text)}`;
}

export function maintenanceReminderLink(msg: ReminderMessage): string {
  const text = [
    `Sayın ${msg.ownerName},`,
    ``,
    `⚓ *${msg.boatName}* tekneniz için yaklaşan bakım hatırlatması:`,
    ``,
    `🔧 *Bakım Türü:* ${msg.maintenanceType}`,
    `📅 *Planlanan Tarih:* ${msg.dueDate}`,
    ``,
    `Randevu almak için bizimle iletişime geçebilirsiniz.`,
  ].join("\n");

  return `https://wa.me/${cleanPhone(msg.ownerPhone)}?text=${encodeURIComponent(text)}`;
}
