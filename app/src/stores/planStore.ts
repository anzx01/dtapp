import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  applyGoalDefaults,
  createDefaultDraft,
  createPlanFromDraft,
  createRecord,
  createReview,
  type DcaPlan,
  type DcaPlanDraft,
  type DcaRecord,
  type PlanStatus,
  type ReviewRecord,
} from "../domain/plan";

const PLAN_KEY = "dca_plan_v1";
const DRAFT_KEY = "dca_plan_draft_v1";
const RECORDS_KEY = "dca_records_v1";
const REVIEWS_KEY = "dca_reviews_v1";

export const usePlanStore = defineStore("plan", () => {
  const draft = ref<DcaPlanDraft>(createDefaultDraft());
  const plan = ref<DcaPlan | null>(null);
  const records = ref<DcaRecord[]>([]);
  const reviews = ref<ReviewRecord[]>([]);
  const hydrated = ref(false);

  const hasPlan = computed(() => Boolean(plan.value));
  const latestRecord = computed(() => records.value[0] || null);
  const latestReview = computed(() => reviews.value[0] || null);

  function hydrate(): void {
    if (hydrated.value) return;
    draft.value = readStorage(DRAFT_KEY, createDefaultDraft());
    plan.value = readStorage<DcaPlan | null>(PLAN_KEY, null);
    records.value = readStorage<DcaRecord[]>(RECORDS_KEY, []);
    reviews.value = readStorage<ReviewRecord[]>(REVIEWS_KEY, []);
    hydrated.value = true;
  }

  function patchDraft(partial: Partial<DcaPlanDraft>): void {
    draft.value = { ...draft.value, ...partial };
    if (partial.goal_type || partial.goal_term) {
      draft.value = applyGoalDefaults(draft.value);
    }
    persistDraft();
  }

  function replaceDraft(nextDraft: DcaPlanDraft): void {
    draft.value = nextDraft;
    persistDraft();
  }

  function resetDraft(): void {
    draft.value = plan.value ? planToDraft(plan.value) : createDefaultDraft();
    persistDraft();
  }

  function createOrUpdatePlan(): DcaPlan {
    const nextPlan = createPlanFromDraft(draft.value);
    if (plan.value) {
      nextPlan.plan_id = plan.value.plan_id;
      nextPlan.created_at = plan.value.created_at;
    }
    plan.value = nextPlan;
    writeStorage(PLAN_KEY, nextPlan);
    persistDraft();
    return nextPlan;
  }

  function setPlanStatus(status: PlanStatus): void {
    if (!plan.value) return;
    plan.value = { ...plan.value, status, updated_at: new Date().toISOString() };
    writeStorage(PLAN_KEY, plan.value);
  }

  function patchPlan(partial: Partial<DcaPlan>): void {
    if (!plan.value) return;
    plan.value = { ...plan.value, ...partial, updated_at: new Date().toISOString() };
    writeStorage(PLAN_KEY, plan.value);
  }

  function saveRecord(input: Partial<DcaRecord>): DcaRecord | null {
    if (!plan.value) return null;
    const record = createRecord(plan.value, input);
    records.value = [record, ...records.value];
    writeStorage(RECORDS_KEY, records.value);
    return record;
  }

  function saveReview(input: Partial<ReviewRecord>): ReviewRecord | null {
    if (!plan.value) return null;
    const review = createReview(plan.value, input);
    reviews.value = [review, ...reviews.value];
    writeStorage(REVIEWS_KEY, reviews.value);
    return review;
  }

  function clearAll(): void {
    draft.value = createDefaultDraft();
    plan.value = null;
    records.value = [];
    reviews.value = [];
    writeStorage(DRAFT_KEY, draft.value);
    writeStorage(PLAN_KEY, null);
    writeStorage(RECORDS_KEY, []);
    writeStorage(REVIEWS_KEY, []);
  }

  function persistDraft(): void {
    writeStorage(DRAFT_KEY, draft.value);
  }

  return {
    draft,
    plan,
    records,
    reviews,
    hydrated,
    hasPlan,
    latestRecord,
    latestReview,
    hydrate,
    patchDraft,
    replaceDraft,
    resetDraft,
    createOrUpdatePlan,
    setPlanStatus,
    patchPlan,
    saveRecord,
    saveReview,
    clearAll,
  };
});

function planToDraft(plan: DcaPlan): DcaPlanDraft {
  const {
    goal_type,
    goal_desc,
    goal_term,
    monthly_budget,
    disposable_surplus,
    has_emergency_reserve,
    has_large_expense_in_3_years,
    investment_products,
    buy_rule,
    frequency,
    execution_date,
    custom_execution_day,
    sell_rule,
    reminder_settings,
    record_fields,
    valuation_state,
  } = plan;
  return {
    goal_type,
    goal_desc,
    goal_term,
    monthly_budget,
    disposable_surplus,
    has_emergency_reserve,
    has_large_expense_in_3_years,
    investment_products,
    buy_rule,
    frequency,
    execution_date,
    custom_execution_day,
    sell_rule,
    reminder_settings,
    record_fields,
    valuation_state,
  };
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = uni.getStorageSync(key);
    return value || fallback;
  } catch (error) {
    console.warn(`Failed to read storage: ${key}`, error);
    return fallback;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    uni.setStorageSync(key, value);
  } catch (error) {
    console.warn(`Failed to write storage: ${key}`, error);
  }
}
