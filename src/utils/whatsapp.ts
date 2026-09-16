// 39Production — WhatsApp Utility Functions
import { WHATSAPP_NUMBER } from './constants';

/**
 * Generate a WhatsApp URL with a pre-filled message
 */
export function getWhatsAppUrl(message: string, number?: string): string {
  const phone = number || WHATSAPP_NUMBER;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

/**
 * Open WhatsApp in a new tab
 */
export function openWhatsApp(message: string, number?: string): void {
  window.open(getWhatsAppUrl(message, number), '_blank');
}

/**
 * Generate a customer-to-admin inquiry message
 */
export function customerToAdminMessage(serviceName?: string): string {
  if (serviceName) {
    return `Halo 39Production, saya ingin bertanya mengenai layanan ${serviceName}.`;
  }
  return 'Halo 39Production, saya ingin bertanya mengenai layanan yang tersedia.';
}

/**
 * Generate an admin-to-customer message about an order
 */
export function adminToCustomerMessage(customerName: string, orderId: string): string {
  return `Halo ${customerName}, saya dari 39Production. Saya ingin membahas order #${orderId}.`;
}

/**
 * Generate a project inquiry message
 */
export function projectInquiryMessage(): string {
  return 'Halo 39Production, saya tertarik untuk memulai sebuah proyek bersama. Bisa tolong jelaskan prosesnya?';
}

