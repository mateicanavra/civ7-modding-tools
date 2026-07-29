export const advisorWarningNotificationTypeNames = [
  "NOTIFICATION_ADVISOR_WARNING_SCIENCE",
  "NOTIFICATION_ADVISOR_WARNING_CULTURE",
  "NOTIFICATION_ADVISOR_WARNING_ECONOMIC",
  "NOTIFICATION_ADVISOR_WARNING_MILITARY",
] as const;

export type Civ7AdvisorWarningNotificationTypeName =
  (typeof advisorWarningNotificationTypeNames)[number];

export function isAdvisorWarningNotificationType(
  typeName: string | null
): typeName is Civ7AdvisorWarningNotificationTypeName {
  return advisorWarningNotificationTypeNames.some((candidate) => candidate === typeName);
}
