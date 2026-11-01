"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteParticipantFromDirectory } from "@/lib/actions/olympiad-participant.actions";
import { formatDhakaDateTime } from "@/lib/olympiad-lifecycle";
import { exportRowsToCsv } from "@/lib/export.client";
import toast from "react-hot-toast";
import Image from "next/image";
import { Users, Search, Download, Trash2, Mail, Phone } from "lucide-react";

interface ParticipantDirectoryTableProps {
  initialData: {
    participants: any[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}

export default function ParticipantDirectoryTable({
  initialData,
}: ParticipantDirectoryTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const participants = initialData.participants || [];

  const filterRows = participants.filter((p) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.studentName?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phoneNumber?.toLowerCase().includes(q) ||
      p.institution?.toLowerCase().includes(q) ||
      p.rollNumber?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Remove "${name}" from the participant directory? This does not affect any Olympiad registration.`,
      )
    )
      return;
    setIsProcessing(true);
    try {
      await deleteParticipantFromDirectory(id);
      toast.success("Participant removed from directory.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove participant.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCsv = () => {
    exportRowsToCsv(
      filterRows,
      [
        { header: "Student Name", value: (p) => p.studentName },
        { header: "Email", value: (p) => p.email },
        { header: "Phone Number", value: (p) => p.phoneNumber },
        { header: "Institution", value: (p) => p.institution },
        { header: "Class / Grade", value: (p) => p.grade },
        { header: "Roll Number", value: (p) => p.rollNumber },
        { header: "District", value: (p) => p.district || "" },
        { header: "Guardian Phone", value: (p) => p.guardianPhone || "" },
        {
          header: "Olympiads",
          value: (p) =>
            (p.sources || [])
              .map((s: any) => s.olympiadTitle)
              .filter(Boolean)
              .join(" | "),
        },
        {
          header: "Last Synced",
          value: (p) => formatDhakaDateTime(p.lastSyncedAt),
        },
      ],
      `participant-directory-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Participant Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            A reusable pool of participant details reserved from Olympiad
            registrations. This data is stored separately and survives even if
            the source Olympiad is deleted.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="border border-gray-300 text-gray-700 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5 transition"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, institution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap">
          {filterRows.length} of {initialData.totalCount} participant
          {initialData.totalCount === 1 ? "" : "s"}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-medium">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Institution & Class</th>
                <th className="py-3.5 px-4">Olympiads</th>
                <th className="py-3.5 px-4">Last Synced</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filterRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No participants in the directory yet. Use{" "}
                    <strong>Reserve Details</strong> from an Olympiad&apos;s
                    registration tab to populate it.
                  </td>
                </tr>
              ) : (
                filterRows.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {p.photo ? (
                          <Image
                            src={p.photo}
                            alt={p.studentName}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {p.studentName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">
                            {p.studentName}
                          </div>
                          {p.rollNumber && (
                            <div className="text-xs text-gray-400">
                              Roll: {p.rollNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-gray-400" /> {p.email}
                      </div>
                      {p.phoneNumber && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-gray-400">
                          <Phone className="w-3 h-3" /> {p.phoneNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      <div className="font-medium text-gray-800">
                        {p.institution}
                      </div>
                      <div>
                        Class: {p.grade}
                        {p.district ? ` • ${p.district}` : ""}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                        {p.sources?.length || 0}
                      </span>
                      <div className="mt-0.5 text-gray-400 truncate max-w-[200px]">
                        {(p.sources || [])
                          .map((s: any) => s.olympiadTitle)
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {formatDhakaDateTime(p.lastSyncedAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(p._id, p.studentName)}
                        disabled={isProcessing}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                        title="Remove from directory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
