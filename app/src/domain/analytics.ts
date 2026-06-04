export type AnalyticsEvent =
  | "enter_onboarding"
  | "select_goal"
  | "fill_budget"
  | "select_product"
  | "select_buy_rule"
  | "complete_plan_creation"
  | "enable_reminder"
  | "complete_first_execution"
  | "create_review_record"
  | "modify_plan"
  | "pause_plan";

export interface AnalyticsPayload {
  [key: string]: string | number | boolean | undefined;
}

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  console.log("[analytics]", event, payload);
}
