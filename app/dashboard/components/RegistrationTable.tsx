"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Eye, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { FormProvider, useForm } from "react-hook-form";
import {
  deleteRegistration,
  RegistrationParams,
  SerializedRegistration,
  updateRegistration,
} from "@/lib/actions/registration.actions";
import { getCourseById } from "@/lib/actions/course.actions";
import Link from "next/link";

export type RegistrationItem = {
  _id: string;
  englishName?: string;
  fathersName?: string;
  mothersName?: string;
  gender?: string;
  email?: string;
  number?: string;
  whatsApp?: string;
  occupation?: string;
  institution?: string;
  address?: string;
  photo?: string;
  course?: { _id: string } | string;
  registrationNumber?: string;
  status?: string;
  certificateStatus?: string;
  paymentAmount?: number;
  paymentStatus?: string;
  transactionId?: string;
  paymentMethod?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type CourseInfo = {
  _id: string;
  title: string;
  category?: string;
  photo?: string;
  price?: number;
};

// Converts a SerializedRegistration into a RegistrationItem
function normalizeRegistration(
  updated: SerializedRegistration,
): RegistrationItem {
  return {
    _id: updated._id,
    englishName: updated.englishName ?? undefined,
    fathersName: updated.fathersName ?? undefined,
    mothersName: updated.mothersName ?? undefined,
    gender: updated.gender ?? undefined,
    email: updated.email ?? undefined,
    number: updated.number ?? undefined,
    whatsApp: updated.whatsApp ?? undefined,
    occupation: updated.occupation ?? undefined,
    institution: updated.institution ?? undefined,
    address: updated.address ?? undefined,
    photo: updated.photo ?? undefined,
    course: updated.course ?? undefined,
    registrationNumber: updated.registrationNumber ?? undefined,
    status: updated.status ?? undefined,
    certificateStatus: updated.certificateStatus ?? undefined,
    paymentAmount: updated.paymentAmount ?? undefined,
    paymentStatus: updated.paymentStatus ?? undefined,
    transactionId: updated.transactionId ?? undefined,
    paymentMethod: updated.paymentMethod ?? undefined,
    createdAt: updated.createdAt ?? undefined,
    updatedAt: updated.updatedAt ?? undefined,
  };
}

type Props = {
  registrations: RegistrationItem[];
};

type SortKey = keyof Pick<
  RegistrationItem,
  | "registrationNumber"
  | "englishName"
  | "email"
  | "paymentAmount"
  | "paymentStatus"
  | "status"
  | "certificateStatus"
  | "createdAt"
>;

/** Merge updates into client registration */
const mergeNormalized = <T extends Partial<RegistrationItem>>(
  prev: RegistrationItem,
  next: T,
) => ({
  ...prev,
  ...next,
});

const STATUS_OPTIONS = ["Pending", "Ongoing", "Completed", "Closed"] as const;
const STATUS_STYLES: Record<string, string> = {
  Pending: "text-yellow-600",
  Ongoing: "text-blue-600",
  Completed: "text-green-600",
  Closed: "text-gray-500",
};

export const RegistrationTable: React.FC<Props> = ({ registrations }) => {
  const [list, setList] = useState<RegistrationItem[]>(registrations);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [viewModalData, setViewModalData] = useState<RegistrationItem | null>(
    null,
  );
  const [editModalData, setEditModalData] = useState<RegistrationItem | null>(
    null,
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [certConfirmId, setCertConfirmId] = useState<string | null>(null);
  const [courseMap, setCourseMap] = useState<Record<string, CourseInfo>>({});

  /** ---------- Fetch Course Info ---------- */
  useEffect(() => {
    const fetchCourseInfo = async (courseId: string) => {
      if (!courseId || courseMap[courseId]) return;

      try {
        const course = await getCourseById(courseId);
        if (course) {
          setCourseMap((prev) => ({
            ...prev,
            [courseId]: {
              _id: course._id.toString(),
              title: course.title,
              category: course.category ?? "",
              photo: course.photo ?? "",
              price: course.price ?? 0,
            },
          }));
        }
      } catch (err) {
        console.error("Failed to fetch course info:", err);
      }
    };

    registrations.forEach((reg) => {
      if (reg.course) {
        const id = typeof reg.course === "string" ? reg.course : reg.course._id;
        if (id) fetchCourseInfo(id);
      }
    });
  }, [registrations, courseMap]);

  /** ---------- Helpers ---------- */
  const setLoading = (key: string, value: boolean) =>
    setLoadingMap((prev) => ({ ...prev, [key]: value }));

  const getCourseTitle = useCallback(
    (course?: RegistrationItem["course"]) => {
      if (!course) return "—";

      // Get the course ID whether course is string or object
      const courseId = typeof course === "string" ? course : course._id;
      if (!courseId) return "—";

      // Lookup in the course map
      return courseMap[courseId]?.title ?? courseId;
    },
    [courseMap], // dependency on courseMap so it updates when fetched
  );

  /** ---------- Filtering & Sorting ---------- */
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const base = list.filter((r) => {
      if (!q) return true;
      return (
        (r.registrationNumber ?? "").toLowerCase().includes(q) ||
        (r.englishName ?? "").toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q) ||
        getCourseTitle(r.course).toLowerCase().includes(q)
      );
    });

    if (!sortKey) return base;

    return [...base].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];

      if (sortKey === "createdAt") {
        const da = va ? new Date(va).getTime() : 0;
        const db = vb ? new Date(vb).getTime() : 0;
        return sortOrder === "asc" ? da - db : db - da;
      }

      if (typeof va === "number" && typeof vb === "number") {
        return sortOrder === "asc" ? va - vb : vb - va;
      }

      return sortOrder === "asc"
        ? String(va ?? "").localeCompare(String(vb ?? ""))
        : String(vb ?? "").localeCompare(String(va ?? ""));
    });
  }, [list, searchQuery, sortKey, sortOrder, getCourseTitle]); // now getCourseTitle is stable
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  /** ---------- Actions ---------- */
  const syncNormalized = (
    id: string,
    normalized: Partial<RegistrationItem>,
  ) => {
    setList((prev) =>
      prev.map((r) => (r._id === id ? mergeNormalized(r, normalized) : r)),
    );
  };

  const handleToggleCertificateConfirmed = async (id: string) => {
    const key = `cert-${id}`;
    try {
      setLoading(key, true);
      const current = list.find((r) => r._id === id);
      if (!current) throw new Error("Registration not found");

      const nextStatus =
        current.certificateStatus === "Certified"
          ? "Not Certified"
          : "Certified";
      const updated = await updateRegistration(id, {
        certificateStatus: nextStatus,
      });
      if (!updated) throw new Error("Update failed");

      syncNormalized(id, {
        certificateStatus: updated.certificateStatus ?? undefined,
        updatedAt: updated.updatedAt ?? undefined,
      });
      toast.success(
        nextStatus === "Certified"
          ? "Marked as certified"
          : "Certification removed",
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle certificate");
    } finally {
      setLoading(key, false);
      setCertConfirmId(null);
    }
  };

  const handleDeleteConfirmed = async (id: string) => {
    const key = `del-${id}`;
    try {
      setLoading(key, true);
      const res = await deleteRegistration(id);
      if (!res) throw new Error("Delete failed");
      setList((prev) => prev.filter((r) => r._id !== id));
      toast.success("Deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setLoading(key, false);
      setDeleteConfirmId(null);
    }
  };

  const methods = useForm<RegistrationItem>({
    defaultValues: editModalData ?? {},
  });

  useEffect(() => {
    if (editModalData) {
      methods.reset(editModalData);
    }
  }, [editModalData, methods]);

  /** ---------- Render ---------- */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search by reg#, name, email or course"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3"
        />
        <div className="text-sm text-muted-foreground">
          Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort("registrationNumber")}>
              Reg. No
            </TableHead>
            <TableHead onClick={() => handleSort("englishName")}>
              Name
            </TableHead>
            <TableHead onClick={() => handleSort("email")}>Email</TableHead>
            <TableHead>Course</TableHead>
            <TableHead onClick={() => handleSort("status")}>Status</TableHead>
            <TableHead onClick={() => handleSort("certificateStatus")}>
              Certified
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r._id}>
              <TableCell>
                <Link
                  href={`/dashboard/registrations/${r._id}`}
                  className="text-primary font-semibold"
                >
                  {r.registrationNumber ?? "—"}
                </Link>
              </TableCell>
              <TableCell>{r.englishName ?? "—"}</TableCell>
              <TableCell>{r.email ?? "—"}</TableCell>
              <TableCell>{getCourseTitle(r.course)}</TableCell>
              <TableCell className={STATUS_STYLES[r.status ?? "Pending"]}>
                {r.status ?? "Pending"}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={loadingMap[`cert-${r._id}`]}
                  onClick={() => setCertConfirmId(r._id)}
                >
                  {r.certificateStatus === "Certified" ? "✅" : "❌"}
                </Button>
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewModalData(r)}
                >
                  <Eye size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModalData(r)}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirmId(r._id)}
                  disabled={loadingMap[`del-${r._id}`]}
                >
                  <Trash size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Certificate confirmation modal */}
      {certConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h4 className="text-lg font-semibold">
              Confirm certification change
            </h4>
            <p className="text-sm text-muted-foreground mt-2">
              Are you sure you want to toggle certification for this
              registration?
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setCertConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleToggleCertificateConfirmed(certConfirmId)}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {viewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              {viewModalData.photo && (
                <Image
                  src={viewModalData.photo}
                  height={100}
                  width={100}
                  alt="Student Photo"
                  className="w-20 h-20 rounded-full object-cover border"
                />
              )}
              <h3 className="text-xl font-semibold">
                {viewModalData.englishName ?? "Registration Details"}
              </h3>
            </div>

            {/* Student Info */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Student Info</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p>
                  <strong>Name:</strong> {viewModalData.englishName ?? "—"}
                </p>
                <p>
                  <strong>Email:</strong> {viewModalData.email ?? "—"}
                </p>
                <p>
                  <strong>Phone:</strong> {viewModalData.number ?? "—"}
                </p>
                <p>
                  <strong>WhatsApp:</strong> {viewModalData.whatsApp ?? "—"}
                </p>
                <p>
                  <strong>Gender:</strong> {viewModalData.gender ?? "—"}
                </p>
              </div>
            </div>

            {/* Course Info */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Course Info</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p>
                  <strong>Course:</strong>{" "}
                  {getCourseTitle(viewModalData.course)}
                </p>
                <p>
                  <strong>Reg#:</strong>{" "}
                  {viewModalData.registrationNumber ?? "—"}
                </p>
                <p>
                  <strong>Status:</strong> {viewModalData.status ?? "—"}
                </p>
                <p>
                  <strong>Certificate:</strong>{" "}
                  {viewModalData.certificateStatus ?? "Not Certified"}
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Payment Info</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p>
                  <strong>Status:</strong>{" "}
                  {viewModalData.paymentStatus ?? "Pending"}
                </p>
                <p>
                  <strong>Amount:</strong> {viewModalData.paymentAmount ?? 0}
                </p>
                <p>
                  <strong>Method:</strong> {viewModalData.paymentMethod ?? "—"}
                </p>
                <p>
                  <strong>Transaction ID:</strong>{" "}
                  {viewModalData.transactionId ?? "—"}
                </p>
              </div>
            </div>

            {/* Address & Meta */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Additional Info</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <p>
                  <strong>Address:</strong> {viewModalData.address ?? "—"}
                </p>
                <p>
                  <strong>Occupation:</strong> {viewModalData.occupation ?? "—"}
                </p>
                <p>
                  <strong>Institution:</strong>{" "}
                  {viewModalData.institution ?? "—"}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {viewModalData.createdAt
                    ? new Date(viewModalData.createdAt).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setViewModalData(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {editModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Edit Registration</h3>

            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(async (data) => {
                  try {
                    const STATUS_OPTIONS = [
                      "Pending",
                      "Ongoing",
                      "Completed",
                      "Closed",
                    ] as const;
                    type StatusType = (typeof STATUS_OPTIONS)[number];

                    const CERT_OPTIONS = [
                      "Not Certified",
                      "Certified",
                    ] as const;
                    type CertType = (typeof CERT_OPTIONS)[number];

                    const PAYMENT_STATUS_OPTIONS = [
                      "Pending",
                      "Paid",
                      "Failed",
                    ] as const;
                    type PaymentStatusType =
                      (typeof PAYMENT_STATUS_OPTIONS)[number];

                    const PAYMENT_METHOD_OPTIONS = [
                      "Cash",
                      "Card",
                      "Bank Transfer",
                      "Mobile Payment",
                      "Other",
                    ] as const;
                    type PaymentMethodType =
                      (typeof PAYMENT_METHOD_OPTIONS)[number];

                    // inside your form submit handler
                    const payload: Partial<RegistrationParams> = {
                      ...data,
                      paymentAmount: Number(data.paymentAmount),

                      // Status
                      status: STATUS_OPTIONS.includes(data.status as StatusType)
                        ? (data.status as StatusType)
                        : "Pending",

                      // Certificate Status
                      certificateStatus: CERT_OPTIONS.includes(
                        data.certificateStatus as CertType,
                      )
                        ? (data.certificateStatus as CertType)
                        : "Not Certified",

                      // Payment Status
                      paymentStatus: PAYMENT_STATUS_OPTIONS.includes(
                        data.paymentStatus as PaymentStatusType,
                      )
                        ? (data.paymentStatus as PaymentStatusType)
                        : "Pending",

                      // Payment Method
                      paymentMethod: PAYMENT_METHOD_OPTIONS.includes(
                        data.paymentMethod as PaymentMethodType,
                      )
                        ? (data.paymentMethod as PaymentMethodType)
                        : "Other",
                    };

                    const updated = await updateRegistration(
                      editModalData._id,
                      payload,
                    );
                    if (updated) {
                      const normalized = normalizeRegistration(updated);

                      setList((prev) =>
                        prev.map((r) =>
                          r._id === normalized._id ? normalized : r,
                        ),
                      );
                      setEditModalData(null);
                      toast.success("Updated successfully");
                    }
                    if (!updated) throw new Error("Update failed");

                    syncNormalized(editModalData._id, payload);
                    toast.success("Updated successfully");
                    setEditModalData(null);
                  } catch (err) {
                    console.error(err);
                    toast.error("Update failed");
                  }
                })}
              >
                <div className="grid grid-cols-2 gap-3">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium">
                      English Name
                    </label>
                    <input
                      {...methods.register("englishName")}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                      {...methods.register("email")}
                      type="email"
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium">Phone</label>
                    <input
                      {...methods.register("number")}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-sm font-medium">
                      WhatsApp
                    </label>
                    <input
                      {...methods.register("whatsApp")}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium">Gender</label>
                    <select
                      {...methods.register("gender")}
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="">—</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select
                      {...methods.register("status")}
                      className="border rounded px-2 py-1 w-full"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Certificate */}
                  <div>
                    <label className="block text-sm font-medium">
                      Certificate
                    </label>
                    <select
                      {...methods.register("certificateStatus")}
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="Not Certified">Not Certified</option>
                      <option value="Certified">Certified</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <label className="block text-sm font-medium">
                      Payment Status
                    </label>
                    <input
                      {...methods.register("paymentStatus")}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>

                  {/* Payment Amount */}
                  <div>
                    <label className="block text-sm font-medium">
                      Payment Amount
                    </label>
                    <input
                      {...methods.register("paymentAmount")}
                      type="number"
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium">
                      Payment Method
                    </label>
                    <input
                      {...methods.register("paymentMethod")}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label className="block text-sm font-medium">
                      Transaction ID
                    </label>
                    <input
                      {...methods.register("transactionId")}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium">Address</label>
                    <input
                      {...methods.register("address")}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-sm font-medium">
                      Occupation
                    </label>
                    <input
                      {...methods.register("occupation")}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>

                  {/* Institution */}
                  <div>
                    <label className="block text-sm font-medium">
                      Institution
                    </label>
                    <input
                      {...methods.register("institution")}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setEditModalData(null)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h4 className="text-lg font-semibold">Delete registration</h4>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone. Are you sure you want to delete this
              registration?
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteConfirmed(deleteConfirmId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationTable;
