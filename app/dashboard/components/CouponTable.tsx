"use client";

import { useMemo, useState } from "react";
import {
  createCoupon,
  CouponParams,
  deleteCoupon,
  SerializedCoupon,
  updateCoupon,
} from "@/lib/actions/coupon.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash } from "lucide-react";
import toast from "react-hot-toast";

type CouponFormState = CouponParams;

const emptyForm: CouponFormState = {
  code: "",
  discountType: "fixed",
  discountValue: 0,
  isActive: true,
};

const formatCouponValue = (coupon: SerializedCoupon) =>
  coupon.discountType === "percent"
    ? `${coupon.discountValue}%`
    : `৳${coupon.discountValue.toLocaleString()}`;

const CouponTable = ({ coupons }: { coupons: SerializedCoupon[] }) => {
  const [items, setItems] = useState<SerializedCoupon[]>(coupons);
  const [form, setForm] = useState<CouponFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredCoupons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;

    return items.filter(
      (coupon) =>
        coupon.code.toLowerCase().includes(q) ||
        coupon.discountType.toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload: CouponParams = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        isActive: Boolean(form.isActive),
      };

      const saved = editingId
        ? await updateCoupon(editingId, payload)
        : await createCoupon(payload);

      if (!saved) throw new Error("Coupon save failed");

      setItems((prev) =>
        editingId
          ? prev.map((item) => (item._id === saved._id ? saved : item))
          : [saved, ...prev],
      );
      resetForm();
      toast.success(editingId ? "Coupon updated" : "Coupon created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save coupon");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (coupon: SerializedCoupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      isActive: coupon.isActive,
    });
  };

  const handleDelete = async (couponId: string) => {
    try {
      setLoading(true);
      const result = await deleteCoupon(couponId);
      if (!result) throw new Error("Coupon delete failed");

      setItems((prev) => prev.filter((item) => item._id !== couponId));
      toast.success(result.message);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete coupon");
    } finally {
      setLoading(false);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 bg-white">
        <h4 className="font-semibold mb-4">
          {editingId ? "Edit Coupon" : "Create Coupon"}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Code</label>
            <Input
              value={form.code}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  code: event.target.value.toUpperCase(),
                }))
              }
              placeholder="OCTAL500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={form.discountType}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  discountType: event.target.value as CouponParams["discountType"],
                }))
              }
              className="border rounded-md px-3 py-2 w-full h-10"
            >
              <option value="fixed">Fixed Amount</option>
              <option value="percent">Percent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <Input
              type="number"
              min={0}
              max={form.discountType === "percent" ? 100 : undefined}
              value={form.discountValue}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  discountValue: Number(event.target.value),
                }))
              }
            />
          </div>

          <label className="flex items-center gap-2 h-10">
            <input
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  isActive: event.target.checked,
                }))
              }
            />
            <span className="text-sm font-medium">Active</span>
          </label>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading}>
              {editingId ? "Update" : "Create"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm} disabled={loading}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      <Input
        placeholder="Search coupons"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        className="w-full md:w-1/3"
      />

      <Table className="border rounded-xl overflow-hidden">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCoupons.length > 0 ? (
            filteredCoupons.map((coupon) => (
              <TableRow key={coupon._id}>
                <TableCell className="font-semibold">{coupon.code}</TableCell>
                <TableCell className="capitalize">
                  {coupon.discountType}
                </TableCell>
                <TableCell>{formatCouponValue(coupon)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      coupon.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  {coupon.createdAt
                    ? new Date(coupon.createdAt).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(coupon)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setConfirmDeleteId(coupon._id)}
                    className="hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-10 text-muted-foreground"
              >
                No coupons found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-md space-y-4">
            <p>Are you sure you want to delete this coupon?</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={loading}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponTable;
