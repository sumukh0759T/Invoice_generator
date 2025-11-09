import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/money";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type RoomCategory =
  | "Deluxe room"
  | "Standard room"
  | "Family room"
  | "Dormitory";

export const CATEGORY_RATES: Record<RoomCategory, number> = {
  "Deluxe room": 2500,
  "Standard room": 2000,
  "Family room": 4500,
  Dormitory: 1200,
};

export interface RoomRowData {
  id: string;
  category: RoomCategory | "";
  hsn?: string;
  rate: number;
  rooms: number;
  nights: number;
  subtotal: number; // computed
  sgst: number; // computed
  cgst: number; // computed
  total: number; // computed
  dirtyRate?: boolean; // whether user manually changed rate
}

export function computeRow(row: RoomRowData): RoomRowData {
  const subtotal = (row.rate || 0) * (row.rooms || 0) * (row.nights || 0);
  const sgst = subtotal * 0.025;
  const cgst = subtotal * 0.025;
  const total = subtotal + sgst + cgst;
  return { ...row, subtotal, sgst, cgst, total };
}

export default function RoomRow({
  data,
  onChange,
  onRemove,
}: {
  data: RoomRowData;
  onChange: (updated: RoomRowData) => void;
  onRemove: () => void;
}) {
  const [row, setRow] = useState<RoomRowData>(() => computeRow(data));
  const prevCategory = useRef(row.category);

  useEffect(() => {
    setRow((r) => computeRow({ ...r, ...data }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id]);

  useEffect(() => {
    onChange(computeRow(row));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.category, row.rate, row.rooms, row.nights, row.hsn]);

  const setField = <K extends keyof RoomRowData>(
    key: K,
    value: RoomRowData[K],
  ) => {
    setRow((r) => ({ ...r, [key]: value } as RoomRowData));
  };

  const handleCategoryChange = (value: RoomCategory | "") => {
    const isChange = prevCategory.current !== value;
    prevCategory.current = value;
    setRow((r) => {
      let newRate = r.rate;
      if (value && (!r.dirtyRate || isChange)) {
        newRate = CATEGORY_RATES[value];
      }
      return computeRow({ ...r, category: value, rate: newRate });
    });
  };

  const handleRateChange = (value: number) => {
    setRow((r) => computeRow({ ...r, rate: value, dirtyRate: true }));
  };

  const inputCls =
    "w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40";
  const labelCls = "text-xs text-muted-foreground";

  return (
    <div className="grid grid-cols-12 gap-3 items-end border rounded-md p-3 bg-white">
      <div className="col-span-12 md:col-span-3">
        <label className={labelCls}>Room Category</label>
        <select
          className={inputCls}
          value={row.category}
          onChange={(e) => handleCategoryChange(e.target.value as RoomCategory | "")}
        >
          <option value="">Select category</option>
          {Object.keys(CATEGORY_RATES).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-6 md:col-span-1">
        <label className={labelCls}>HSN Code</label>
        <input
          type="text"
          className={inputCls}
          value={row.hsn || ""}
          onChange={(e) => setField("hsn", e.target.value)}
          placeholder="e.g. 9954"
        />
      </div>

      <div className="col-span-6 md:col-span-2">
        <label className={labelCls}>Rate / night</label>
        <input
          type="number"
          min={0}
          className={inputCls}
          value={row.rate}
          onChange={(e) => handleRateChange(Number(e.target.value || 0))}
        />
      </div>

      <div className="col-span-6 md:col-span-2">
        <label className={labelCls}>No. of Rooms</label>
        <input
          type="number"
          min={0}
          className={inputCls}
          value={row.rooms}
          onChange={(e) => setField("rooms", Number(e.target.value || 0))}
        />
      </div>
      <div className="col-span-6 md:col-span-2">
        <label className={labelCls}>No. of Nights</label>
        <input
          type="number"
          min={0}
          className={inputCls}
          value={row.nights}
          onChange={(e) => setField("nights", Number(e.target.value || 0))}
        />
      </div>
      <div className="col-span-6 md:col-span-2">
        <label className={labelCls}>Subtotal</label>
        <div className="h-10 flex items-center rounded-md border bg-slate-50 px-3 text-sm">{formatINR(row.subtotal)}</div>
      </div>

      <div className="col-span-6 md:col-span-2">
        <label className={labelCls}>SGST (2.5%)</label>
        <div className="h-10 flex items-center rounded-md border bg-slate-50 px-3 text-sm">{formatINR(row.sgst)}</div>
      </div>
      <div className="col-span-6 md:col-span-2">
        <label className={labelCls}>CGST (2.5%)</label>
        <div className="h-10 flex items-center rounded-md border bg-slate-50 px-3 text-sm">{formatINR(row.cgst)}</div>
      </div>
      <div className="col-span-6 md:col-span-2">
        <label className={labelCls}>Total</label>
        <div className="h-10 flex items-center rounded-md border bg-slate-50 px-3 text-sm font-medium">{formatINR(row.total)}</div>
      </div>

      <div className="col-span-12 md:col-span-1 flex md:justify-end">
        <Button variant="secondary" className="text-red-600 border border-red-200 bg-red-50 hover:bg-red-100" type="button" onClick={onRemove} aria-label="Remove room row">
          <X className="w-4 h-4" />
          <span className="hidden md:inline">Remove</span>
        </Button>
      </div>
    </div>
  );
}
