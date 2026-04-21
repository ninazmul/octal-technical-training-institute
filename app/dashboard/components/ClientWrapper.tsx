"use client";

import { useRouter } from "next/navigation";
import { upsertSetting } from "@/lib/actions/setting.actions";
import SettingForm, { SettingFormValues } from "../components/SettingForm";

export default function ClientWrapper({
  initialData,
}: {
  initialData: Partial<SettingFormValues>;
}) {
  const router = useRouter();

  async function onSubmit(data: SettingFormValues) {
    await upsertSetting(data); // ✅ call server action
    router.refresh(); // ✅ smooth reload
  }

  return <SettingForm initialData={initialData} onSubmit={onSubmit} />;
}
