import {
  getAllAdmins,
  getCourses,
  getRegistrations,
  getSetting,
} from "@/lib/actions";
import DashboardClient from "./components/DashboardClient";
import { IAdmin } from "@/lib/database/models/admin.model";
import { ICourseSafe } from "@/lib/database/models/course.model";
import { SerializedRegistration } from "@/lib/actions/registration.actions";

export default async function DashboardPage() {
  try {
    const [setting, admins, courses, registrations] =
      await Promise.all([
        getSetting(),
        getAllAdmins(),
        getCourses({ tab: "all" }),
        getRegistrations(),
      ]);

    return (
      <DashboardClient
        setting={setting ?? null}
        admins={(admins ?? []) as IAdmin[]}
        courses={(courses ?? []) as ICourseSafe[]}
        registrations={(registrations ?? []) as SerializedRegistration[]}
      />
    );
  } catch (error) {
    console.error("Dashboard page error:", error);
    return (
      <div className="p-6 text-red-500">
        Failed to load dashboard. Try again later.
      </div>
    );
  }
}
