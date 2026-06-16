import {
  ArrowLeftRight,
  Banknote,
  Barcode,
  Briefcase,
  Car,
  CreditCard,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  PartyPopper,
  PiggyBank,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  Tag,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
  Target,
  Plane,
  GraduationCap as Grad,
  Smartphone,
  Gift,
  Heart,
  Dumbbell,
  Coins,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowLeftRight,
  Banknote,
  Barcode,
  Briefcase,
  Car,
  CreditCard,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  PartyPopper,
  PiggyBank,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  Tag,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
  Target,
  Plane,
  Grad,
  Smartphone,
  Gift,
  Heart,
  Dumbbell,
  Coins,
};

/** Retorna o componente de ícone para o nome informado (fallback: Wallet). */
export function getIcon(name?: string): LucideIcon {
  if (name && ICON_MAP[name]) return ICON_MAP[name];
  return Wallet;
}

/** Lista de ícones disponíveis para seleção em formulários. */
export const SELECTABLE_ICONS: string[] = [
  "Wallet", "Briefcase", "Laptop", "TrendingUp", "Tag", "Coins",
  "Utensils", "Home", "Car", "PartyPopper", "HeartPulse", "GraduationCap",
  "ShoppingBag", "ReceiptText", "Sparkles", "Target", "Plane", "Smartphone",
  "Gift", "Heart", "Dumbbell", "PiggyBank", "CreditCard", "Zap",
];
