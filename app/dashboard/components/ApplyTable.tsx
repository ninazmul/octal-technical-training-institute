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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { getCourseById } from "@/lib/actions/course.actions";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { deleteApply } from "@/lib/actions/apply.actions";

export type applyItem = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  course: string; // courseId
  createdAt?: string | Date;
};

type CourseInfo = {
  _id: string;
  title: string;
};

type Props = {
  applies: applyItem[];
};

type SortKey = keyof Pick<applyItem, "name" | "email" | "phone" | "createdAt">;

export const ApplyTable: React.FC<Props> = ({ applies }) => {
  const [list, setList] = useState<applyItem[]>(applies);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [courseMap, setCourseMap] = useState<Record<string, CourseInfo>>({});
  const [selectedApplies, setSelectedApplies] = useState<string[]>([]);

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: "", html: "" });
  const [mode, setMode] = useState<"email" | "sms">("email");
  const [smsContent, setSmsContent] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  /** 🔥 Fetch Courses (optimized) */
  useEffect(() => {
    const fetchCourses = async () => {
      const uniqueIds = [
        ...new Set(applies.map((r) => r.course).filter(Boolean)),
      ];

      const results = await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const c = await getCourseById(id);
            if (!c) return null;
            return { id, title: c.title };
          } catch {
            return null;
          }
        }),
      );

      const map: Record<string, CourseInfo> = {};
      results.forEach((r) => {
        if (r) map[r.id] = { _id: r.id, title: r.title };
      });

      setCourseMap(map);
    };

    fetchCourses();
  }, [applies]);

  /** Course Title */
  const getCourseTitle = useCallback(
    (id?: string) => {
      if (!id) return "—";
      return courseMap[id]?.title || "Loading...";
    },
    [courseMap],
  );

  /** Filtering + Sorting */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();

    const data = list.filter((r) => {
      const title = getCourseTitle(r.course).toLowerCase();
      return (
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        title.includes(q)
      );
    });

    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];

      if (sortKey === "createdAt") {
        return sortOrder === "asc"
          ? new Date(va || 0).getTime() - new Date(vb || 0).getTime()
          : new Date(vb || 0).getTime() - new Date(va || 0).getTime();
      }

      return sortOrder === "asc"
        ? String(va || "").localeCompare(String(vb || ""))
        : String(vb || "").localeCompare(String(va || ""));
    });
  }, [list, searchQuery, sortKey, sortOrder, getCourseTitle]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  /** Delete */
  const handleDelete = async (id: string) => {
    try {
      await deleteApply(id);
      setList((prev) => prev.filter((r) => r._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  /** Send */
  const handleSend = async () => {
    const selected = list.filter((r) => selectedApplies.includes(r._id));

    try {
      if (mode === "email") {
        await fetch("/api/send-email", {
          method: "POST",
          body: JSON.stringify({
            recipients: selected.map((r) => ({
              email: r.email,
              subject: emailContent.subject,
              html: emailContent.html,
            })),
          }),
        });
        toast.success("Emails sent");
      } else {
        for (const r of selected) {
          await fetch("/api/send-sms", {
            method: "POST",
            body: JSON.stringify({
              number: r.phone,
              message: smsContent,
            }),
          });
        }
        toast.success("SMS sent");
      }

      setSelectedApplies([]);
      setEmailModalOpen(false);
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex justify-between gap-4">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 w-full md:w-1/2 lg:w-1/3"
        />

        {selectedApplies.length > 0 && (
          <Button onClick={() => setEmailModalOpen(true)}>
            Send ({selectedApplies.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <Table className="border rounded-xl overflow-hidden">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="text-white cursor-pointer">
              <input
                type="checkbox"
                checked={selectedApplies.length === filtered.length}
                onChange={(e) =>
                  setSelectedApplies(
                    e.target.checked ? filtered.map((r) => r._id) : [],
                  )
                }
              />
            </TableHead>
            <TableHead onClick={() => handleSort("name")}>Name</TableHead>
            <TableHead onClick={() => handleSort("email")}>Email</TableHead>
            <TableHead onClick={() => handleSort("phone")}>Phone</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r._id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedApplies.includes(r._id)}
                  onChange={() =>
                    setSelectedApplies((prev) =>
                      prev.includes(r._id)
                        ? prev.filter((i) => i !== r._id)
                        : [...prev, r._id],
                    )
                  }
                />
              </TableCell>

              <TableCell>{r.name}</TableCell>
              <TableCell>{r.email}</TableCell>
              <TableCell>{r.phone}</TableCell>

              <TableCell>{getCourseTitle(r.course)}</TableCell>

              <TableCell className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-100 hover:text-red-600"
                  onClick={() => setDeleteConfirmId(r._id)}
                >
                  <Trash size={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Email/SMS Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
          </DialogHeader>

          {/* Mode Toggle */}
          <div className="flex space-x-2 mb-4">
            <button
              className={`px-2 py-1 rounded ${mode === "email" ? "bg-indigo-500 text-white" : "bg-gray-200"}`}
              onClick={() => setMode("email")}
            >
              Email
            </button>
            <button
              className={`px-2 py-1 rounded ${mode === "sms" ? "bg-indigo-500 text-white" : "bg-gray-200"}`}
              onClick={() => setMode("sms")}
            >
              SMS
            </button>
          </div>

          {mode === "email" ? (
            <>
              <Input
                placeholder="Subject"
                value={emailContent.subject}
                onChange={(e) =>
                  setEmailContent((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
              />
              <RichTextEditor
                value={emailContent.html}
                onChange={(html) =>
                  setEmailContent((prev) => ({ ...prev, html }))
                }
              />
              <div className="text-xs text-muted-foreground">
                You can use formatting, links, and images. This will be sent as
                HTML email.
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <textarea
                placeholder="SMS message"
                value={smsContent}
                onChange={(e) => setSmsContent(e.target.value)}
                className="w-full border rounded p-2 h-32"
              />
              <div className="text-xs text-muted-foreground">
                SMS will be sent as plain text to all selected registrations.
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-2">
            Sending to {selectedApplies.length} recipient(s)
          </p>

          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend}>
              {mode === "email" ? "Send Email" : "Send SMS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      {deleteConfirmId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded">
            <p>Delete this apply?</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
              <Button onClick={() => handleDelete(deleteConfirmId)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyTable;
