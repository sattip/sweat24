import React from 'react';

export interface PointsNotification {
  type: 'points_earned' | 'points_spent' | 'reward_redeemed' | 'milestone_reached';
  title: string;
  message: string;
  points?: number;
  data?: any;
}

export class PointsNotificationService {
  private toastFunction: any;
  private notificationService: any;

  constructor() {
    // Θα αρχικοποιηθεί από το component που το χρησιμοποιεί
  }

  initialize(toast: any, notifications: any) {
    this.toastFunction = toast;
    this.notificationService = notifications;
  }

  // Ειδοποίηση για κερδισμένους πόντους
  pointsEarned(points: number, reason: string) {
    const notification: PointsNotification = {
      type: 'points_earned',
      title: `🌟 Κερδίσατε ${points} πόντους!`,
      message: reason,
      points: points,
      data: {
        type: 'points_earned',
        points: points,
        reason: reason
      }
    };

    this.showNotification(notification);
    this.sendPushNotification(notification);
  }

  // Ειδοποίηση για εξαργύρωση ανταμοιβής
  rewardRedeemed(rewardName: string, pointsSpent: number) {
    const notification: PointsNotification = {
      type: 'reward_redeemed',
      title: '🎁 Ανταμοιβή εξαργυρώθηκε!',
      message: `Εξαργυρώσατε "${rewardName}" με ${pointsSpent} πόντους`,
      points: pointsSpent,
      data: {
        type: 'reward_redeemed',
        reward_name: rewardName,
        points_spent: pointsSpent
      }
    };

    this.showNotification(notification);
    this.sendPushNotification(notification);
  }

  // Ειδοποίηση για επίτευγμα milestone
  milestoneReached(milestone: string, totalPoints: number) {
    const notification: PointsNotification = {
      type: 'milestone_reached',
      title: '🏆 Νέο επίτευγμα!',
      message: `Φτάσατε ${milestone} με συνολικά ${totalPoints} πόντους!`,
      points: totalPoints,
      data: {
        type: 'milestone_reached',
        milestone: milestone,
        total_points: totalPoints
      }
    };

    this.showNotification(notification);
    this.sendPushNotification(notification);
  }

  // Εμφάνιση toast notification
  private showNotification(notification: PointsNotification) {
    if (this.toastFunction) {
      this.toastFunction({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'points_earned' ? 'default' : 'default',
        duration: 5000,
      });
    }
  }

  // Αποστολή push notification (αν υποστηρίζεται)
  private sendPushNotification(notification: PointsNotification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo-light.png',
        badge: '/favicon.ico',
        data: notification.data,
        tag: notification.type // Αποτρέπει duplicate notifications
      });
    }
  }

  // Αίτημα άδειας για notifications
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Τα notifications δεν υποστηρίζονται σε αυτό το browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Έλεγχος αν τα notifications είναι ενεργοποιημένα
  areNotificationsEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }
}

// Singleton instance
export const pointsNotificationService = new PointsNotificationService();

// Hook για χρήση στα React components
export const usePointsNotifications = () => {
  // Αρχικοποίηση του service
  React.useEffect(() => {
    pointsNotificationService.initialize(null, null);
  }, []);

  return {
    pointsEarned: pointsNotificationService.pointsEarned.bind(pointsNotificationService),
    rewardRedeemed: pointsNotificationService.rewardRedeemed.bind(pointsNotificationService),
    milestoneReached: pointsNotificationService.milestoneReached.bind(pointsNotificationService),
    requestPermission: pointsNotificationService.requestNotificationPermission.bind(pointsNotificationService),
    areEnabled: pointsNotificationService.areNotificationsEnabled.bind(pointsNotificationService),
  };
};
