import { getAuthUser } from "@/lib/get-auth-user";
import { getDefaultSchedule } from "@/lib/dal";
import { AvailabilityView } from "./availability-view";

export const metadata = {
  title: "Availability — Bookly",
};

export default async function AvailabilityPage() {
  const user = await getAuthUser();
  const scheduleData = await getDefaultSchedule(user.id);

  const serializedRules = (scheduleData?.rules ?? []).map((r) => ({
    id: r.id,
    dayOfWeek: r.dayOfWeek,
    startTime: r.startTime,
    endTime: r.endTime,
    isOverride: r.isOverride,
  }));

  return (
    <AvailabilityView
      scheduleName={scheduleData?.schedule.name ?? null}
      scheduleTimezone={scheduleData?.schedule.timezone ?? user.timezone}
      rules={serializedRules}
    />
  );
}
