"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SerializedActivityLog } from "@/lib/actions/activity-log.actions";
import { Search, Loader2 } from "lucide-react";

type Props = {
  logs: SerializedActivityLog[];
  totalPages: number;
  currentPage: number;
};

const ACTION_STYLES: Record<string, { bg: string; text: string }> = {
  CREATE: { bg: "bg-green-100 dark:bg-green-950", text: "text-green-800 dark:text-green-300" },
  UPDATE: { bg: "bg-blue-100 dark:bg-blue-950", text: "text-blue-800 dark:text-blue-300" },
  DELETE: { bg: "bg-red-100 dark:bg-red-950", text: "text-red-800 dark:text-red-300" },
  TOGGLE_STATUS: { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-800 dark:text-amber-300" },
};

const TARGETS = [
  "Course",
  "Coupon",
  "Notice",
  "Registration",
  "Trainer",
  "Complaint",
  "Admin",
  "Setting",
  "Gallery",
  "Success Story",
  "Quick Registration"
];

export default function ActivityLogTable({ logs, totalPages, currentPage }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchText, setSearchText] = useState(searchParams.get("search") || "");
  const currentAction = searchParams.get("action") || "all";
  const currentTarget = searchParams.get("target") || "all";

  // Debounce search text changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchText !== (searchParams.get("search") || "")) {
        updateParams({ search: searchText, page: "1" });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText]);

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchText(searchParams.get("search") || "");
  }, [searchParams]);

  const updateParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search logs by admin name, email, or details..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9 h-10 w-full"
          />
        </div>

        {/* Action Type Select */}
        <div className="w-full md:w-48">
          <Select
            value={currentAction}
            onValueChange={(val) => updateParams({ action: val, page: "1" })}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Filter by Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="TOGGLE_STATUS">Toggle Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Target Module Select */}
        <div className="w-full md:w-52">
          <Select
            value={currentTarget}
            onValueChange={(val) => updateParams({ target: val, page: "1" })}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Filter by Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {TARGETS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isPending && (
          <div className="flex items-center justify-center pl-2">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-48">Timestamp</TableHead>
              <TableHead className="w-64">Admin / Moderator</TableHead>
              <TableHead className="w-32">Action</TableHead>
              <TableHead className="w-40">Module</TableHead>
              <TableHead>Activity Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => {
                const badge = ACTION_STYLES[log.action] || { bg: "bg-gray-100", text: "text-gray-800" };
                return (
                  <TableRow key={log._id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Timestamp */}
                    <TableCell className="text-gray-500 font-mono text-xs">
                      {formatDate(log.createdAt)}
                    </TableCell>

                    {/* Admin / Moderator */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {log.adminName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{log.adminName}</p>
                          <p className="text-xs text-gray-400 truncate">{log.adminEmail}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Action Badge */}
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold tracking-wide ${badge.bg} ${badge.text}`}>
                        {log.action.replace("_", " ")}
                      </span>
                    </TableCell>

                    {/* Module */}
                    <TableCell>
                      <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                        {log.target}
                      </span>
                    </TableCell>

                    {/* Details */}
                    <TableCell className="text-gray-700 text-sm font-medium">
                      {log.details}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-400 font-medium">
                  No activity logs found matching the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || isPending}
                onClick={() => updateParams({ page: String(currentPage - 1) })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => updateParams({ page: String(currentPage + 1) })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
