"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "../database";
import ActivityLog from "../database/models/activity-log.model";
import Admin from "../database/models/admin.model";
import { getUserEmailById } from "./user.actions";
import { handleError } from "../utils";

export type SerializedActivityLog = {
  _id: string;
  adminEmail: string;
  adminName: string;
  role: string;
  action: string;
  target: string;
  details: string;
  createdAt: string;
  updatedAt: string;
};

function serializeActivityLog(log: any): SerializedActivityLog {
  return {
    _id: String(log._id),
    adminEmail: log.adminEmail,
    adminName: log.adminName,
    role: log.role,
    action: log.action,
    target: log.target,
    details: log.details,
    createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : "",
    updatedAt: log.updatedAt ? new Date(log.updatedAt).toISOString() : "",
  };
}

// Helper to log administrative actions
export async function logActivity(action: string, target: string, details: string) {
  try {
    await connectToDatabase();
    const { sessionClaims } = await auth();
    const userId = sessionClaims?.userId as string;
    if (!userId) {
      console.log("[Activity Log] No user session found. Action skipped.");
      return;
    }

    const email = await getUserEmailById(userId);
    if (!email) {
      console.log(`[Activity Log] No email found for user ID: ${userId}`);
      return;
    }

    const admin = await Admin.findOne({ email }).lean() as any;
    if (!admin) {
      console.log(`[Activity Log] User ${email} is not authorized in Admin database.`);
      return;
    }

    await ActivityLog.create({
      adminEmail: admin.email,
      adminName: admin.name,
      role: admin.role,
      action,
      target,
      details,
    });
  } catch (error) {
    console.error("[Activity Log] Failed to log action:", error);
  }
}

// Fetch activity logs with pagination, filtering, and search
export async function getActivityLogs(options?: {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  target?: string;
  adminEmail?: string;
}) {
  try {
    await connectToDatabase();

    const page = options?.page || 1;
    const limit = options?.limit || 15;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filters
    if (options?.action && options.action !== "all") {
      query.action = options.action;
    }
    if (options?.target && options.target !== "all") {
      query.target = options.target;
    }
    if (options?.adminEmail && options.adminEmail !== "all") {
      query.adminEmail = options.adminEmail;
    }

    // Search query across name, email, details, and target
    if (options?.search) {
      const searchRegex = new RegExp(options.search, "i");
      query.$or = [
        { adminName: searchRegex },
        { adminEmail: searchRegex },
        { details: searchRegex },
        { target: searchRegex },
      ];
    }

    const [logs, totalCount] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    const serializedLogs = logs.map(serializeActivityLog);

    return {
      logs: serializedLogs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    handleError(error);
    return {
      logs: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

// Fetch aggregate statistics for dashboard
export async function getActivityStats() {
  try {
    await connectToDatabase();

    const totalLogs = await ActivityLog.countDocuments();

    // Distinct admins active
    const activeAdmins = await ActivityLog.distinct("adminEmail");
    const activeAdminsCount = activeAdmins.length;

    // Breakdown of actions
    const actionsBreakdown = await ActivityLog.aggregate([
      { $group: { _id: "$action", count: { $sum: 1 } } }
    ]);

    const formattedActions = {
      CREATE: 0,
      UPDATE: 0,
      DELETE: 0,
      TOGGLE_STATUS: 0,
    } as Record<string, number>;

    actionsBreakdown.forEach((item) => {
      if (item._id in formattedActions) {
        formattedActions[item._id] = item.count;
      }
    });

    // Top active admin
    const topAdminResult = await ActivityLog.aggregate([
      { $group: { _id: "$adminEmail", count: { $sum: 1 }, name: { $first: "$adminName" } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const topAdmin = topAdminResult.length > 0
      ? { email: topAdminResult[0]._id, name: topAdminResult[0].name, count: topAdminResult[0].count }
      : null;

    return {
      totalLogs,
      activeAdminsCount,
      actions: formattedActions,
      topAdmin,
    };
  } catch (error) {
    handleError(error);
    return {
      totalLogs: 0,
      activeAdminsCount: 0,
      actions: { CREATE: 0, UPDATE: 0, DELETE: 0, TOGGLE_STATUS: 0 },
      topAdmin: null,
    };
  }
}
