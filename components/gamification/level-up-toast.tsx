import { toast } from "sonner";

/**
 * Show a premium level-up toast notification.
 */
export function showLevelUpToast(newLevel: number, totalXP: number) {
  toast.success(`🎉 Level Up!`, {
    description: `Selamat! Anda naik ke Level ${newLevel}. Total XP: ${totalXP}`,
    duration: 6000,
  });
}

/**
 * Show a badge unlock toast notification.
 */
export function showBadgeUnlockToast(badgeName: string, xpReward: number) {
  toast.success(`🏆 Badge Unlocked!`, {
    description: `Anda membuka lencana "${badgeName}" (+${xpReward} XP)`,
    duration: 5000,
  });
}

/**
 * Show a simple XP gain toast.
 */
export function showXPToast(amount: number, source: string) {
  toast(`⚡ +${amount} XP`, {
    description: source,
    duration: 2000,
  });
}
