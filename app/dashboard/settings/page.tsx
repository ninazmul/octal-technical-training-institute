import { getSetting } from "@/lib/actions/setting.actions";
import { SettingFormValues } from "../components/SettingForm";
import ClientWrapper from "../components/ClientWrapper";

export default async function SettingsPage() {
  const setting = await getSetting();

  return (
    <main className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">General Settings</h1>
        <ClientWrapper initialData={setting as Partial<SettingFormValues>} />
      </div>
    </main>
  );
}
