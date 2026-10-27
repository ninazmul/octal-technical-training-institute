"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  duplicateOlympiad,
  cancelOlympiad,
  deleteOlympiad,
} from "@/lib/actions/olympiad.actions";
import { formatDhakaDateTime } from "@/lib/olympiad-lifecycle";
import { exportRowsToCsv } from "@/lib/export.client";
import toast from "react-hot-toast";
import {
  Trophy,
  Search,
  Filter,
  Plus,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertTriangle,
  XCircle,
  Users,
} from "lucide-react";

interface OlympiadTableProps {
  initialData: {
    olympiads: any[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}

export default function OlympiadTable({ initialData }: OlympiadTableProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [cancelModalOlympiad, setCancelModalOlympiad] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const filterRows = data.olympiads.filter((o) => {
    const matchesSearch =
      !searchTerm ||
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || o.status === statusFilter;

    const matchesCat =
      categoryFilter === "all" || o.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCat;
  });

  const handleDuplicate = async (id: string) => {
    if (!confirm("Duplicate this Olympiad as a new draft?")) return;
    setIsProcessing(true);
    try {
      const res = await duplicateOlympiad(id);
      if (res) {
        toast.success("Olympiad duplicated as new draft!");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate Olympiad.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${title}"? This cannot be undone.`,
      )
    )
      return;
    setIsProcessing(true);
    try {
      await deleteOlympiad(id);
      toast.success("Olympiad deleted successfully.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete Olympiad.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOlympiad) return;
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason.");
      return;
    }
    setIsProcessing(true);
    try {
      await cancelOlympiad(cancelModalOlympiad._id, cancelReason.trim());
      toast.success("Olympiad marked as cancelled.");
      setCancelModalOlympiad(null);
      setCancelReason("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel Olympiad.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCsv = () => {
    exportRowsToCsv(
      filterRows,
      [
        { header: "Title", value: (o) => o.title },
        { header: "Slug", value: (o) => o.slug },
        { header: "Category", value: (o) => o.category },
        { header: "Classes", value: (o) => o.targetClasses?.join(", ") },
        { header: "Status", value: (o) => o.status },
        { header: "Lifecycle State", value: (o) => o.lifecycle?.state },
        { header: "Total Registrations", value: (o) => o.registrationCount },
        { header: "Exam Submissions", value: (o) => o.attemptCount },
        {
          header: "Reg. Start",
          value: (o) => formatDhakaDateTime(o.registrationStartDate),
        },
        {
          header: "Reg. Deadline",
          value: (o) => formatDhakaDateTime(o.registrationDeadline),
        },
        {
          header: "Exam Start",
          value: (o) => formatDhakaDateTime(o.examStartDate),
        },
        {
          header: "Duration (mins)",
          value: (o) => o.durationMinutes,
        },
      ],
      `olympiads-list-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const getBadgeClass = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "destructive":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "secondary":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" /> Olympiad Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create academic competitions, manage questions, schedule exams, and
            publish rankings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="border border-gray-300 text-gray-700 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <Link
            href="/dashboard/olympiads/create"
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Create Olympiad
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, category, or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Filter className="w-4 h-4" /> Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="all">All Persisted Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="all">All Categories</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="Programming & ICT">Programming & ICT</option>
            <option value="General Knowledge">General Knowledge</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <th className="py-3.5 px-4">Olympiad Title</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Lifecycle State</th>
                <th className="py-3.5 px-4">Participants</th>
                <th className="py-3.5 px-4">Key Dates (Dhaka Time)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filterRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No Olympiads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filterRows.map((olympiad) => {
                  const stateInfo = olympiad.lifecycle;
                  return (
                    <tr
                      key={olympiad._id}
                      className="hover:bg-gray-50/80 transition"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">
                          <Link
                            href={`/dashboard/olympiads/${olympiad._id}`}
                            className="hover:text-primary transition"
                          >
                            {olympiad.title}
                          </Link>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          /{olympiad.slug}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 font-medium">
                          {olympiad.category}
                        </span>
                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[140px]">
                          {olympiad.targetClasses?.slice(0, 2).join(", ")}
                          {olympiad.targetClasses?.length > 2 && "..."}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeClass(
                            stateInfo?.badgeVariant || "default",
                          )}`}
                        >
                          {stateInfo?.label || olympiad.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            <strong>{olympiad.registrationCount || 0}</strong>{" "}
                            registered
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {olympiad.attemptCount || 0} attempts
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        <div>
                          <span className="text-gray-400">Reg ends:</span>{" "}
                          {formatDhakaDateTime(olympiad.registrationDeadline)}
                        </div>
                        <div className="mt-0.5 font-medium text-gray-800">
                          <span className="text-gray-400 font-normal">
                            Exam:
                          </span>{" "}
                          {formatDhakaDateTime(olympiad.examStartDate)} (
                          {olympiad.durationMinutes}m)
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/dashboard/olympiads/${olympiad._id}`}
                            className="p-1.5 text-gray-600 hover:text-primary rounded hover:bg-gray-100"
                            title="Manage Olympiad Hub & Questions"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/olympiads/${olympiad.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-600 hover:text-primary rounded hover:bg-gray-100"
                            title="Public View Preview"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDuplicate(olympiad._id)}
                            disabled={isProcessing}
                            className="p-1.5 text-gray-600 hover:text-primary rounded hover:bg-gray-100"
                            title="Duplicate as new draft"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {olympiad.status !== "Cancelled" && (
                            <button
                              onClick={() => {
                                setCancelModalOlympiad(olympiad);
                                setCancelReason("");
                              }}
                              className="p-1.5 text-amber-600 hover:text-amber-800 rounded hover:bg-amber-50"
                              title="Cancel Olympiad"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleDelete(olympiad._id, olympiad.title)
                            }
                            disabled={isProcessing}
                            className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelModalOlympiad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-gray-900">
                Cancel Olympiad
              </h3>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to cancel{" "}
              <strong>&quot;{cancelModalOlympiad.title}&quot;</strong>? This
              will close exam access and notify registered participants.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Reason for Cancellation *
              </label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Rescheduled due to unavoidable national holidays..."
                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOlympiad(null)}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {isProcessing ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
