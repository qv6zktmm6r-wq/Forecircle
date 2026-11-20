import { getSupabase } from "./client";
import { profileSchema } from "../validation";
export async function saveProfile(input: unknown) {
  const data = profileSchema.parse(input);
  const db = getSupabase();
  if (!db)
    throw new Error(
      "Accounts are not available yet. Explore the preview instead.",
    );
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();
  if (authError || !user) throw new Error("Please sign in first.");
  const { error } = await db.from("profiles").upsert({ id: user.id, ...data });
  if (error) throw error;
}
export interface PaymentProvider {
  createRegistrationPayment(eventId: string): Promise<{ url: string }>;
  refund(paymentId: string): Promise<void>;
  getPayoutStatus(id: string): Promise<string>;
}
export const paymentsEnabled = false;
