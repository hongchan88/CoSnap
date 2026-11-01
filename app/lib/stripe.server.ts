export const createCheckoutSession = async (
  _userId: string,
  _planType: "premium_monthly" | "premium_yearly"
): Promise<string> => {
  throw new Error("Payments are not available yet.");
};

export const getSubscriptionStatus = async (_userId: string) => null;
