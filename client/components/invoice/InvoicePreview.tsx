import { formatINR, numberToIndianWords } from "@/lib/money";
import { RoomRowData } from "./RoomRow";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export interface HotelInfo {
  name: string;
  address: string;
  gstin: string;
  hsn?: string;
  phone: string;
  email: string;
}

export default function InvoicePreview({
  hotel,
  invoiceNumber,
  invoiceDate,
  folioNo,
  guestName,
  billTo,
  checkIn,
  checkOut,
  adults,
  rooms,
  nights,
  source,
  items,
}: {
  hotel: HotelInfo;
  invoiceNumber: string;
  invoiceDate: string; // ISO date string
  folioNo: string;
  guestName: string;
  billTo: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  nights: number;
  source: string;
  items: RoomRowData[];
}) {
  const subtotal = items.reduce((s, r) => s + r.subtotal, 0);
  const sgst = items.reduce((s, r) => s + r.sgst, 0);
  const cgst = items.reduce((s, r) => s + r.cgst, 0);
  const grand = subtotal + sgst + cgst;

  return (
    <div
      id="invoice"
      className="bg-white border rounded-xl shadow-sm overflow-hidden print:shadow-none"
    >
      <div className="border-b p-6 bg-primary/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{hotel.name}</h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              {hotel.address}
            </p>
            <p className="text-sm text-muted-foreground">
              GSTIN: {hotel.gstin}
            </p>
            <p className="text-sm text-muted-foreground">
              Phone: {hotel.phone} • Email: {hotel.email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Invoice No.</p>
            <p className="font-semibold">{invoiceNumber}</p>
            <p className="text-xs text-muted-foreground mt-1">Invoice Date</p>
            <p className="font-medium">{formatDate(invoiceDate)}</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-wide text-foreground">
            Bill To
          </h2>
          <p className="text-sm whitespace-pre-line">{billTo || guestName}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Folio / Reservation No.</p>
            <p className="font-medium">{folioNo}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Guest Name</p>
            <p className="font-medium">{guestName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Check-in</p>
            <p className="font-medium">{formatDate(checkIn)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Check-out</p>
            <p className="font-medium">{formatDate(checkOut)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Adults</p>
            <p className="font-medium">{adults}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Rooms × Nights</p>
            <p className="font-medium">
              {rooms} × {nights}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Source</p>
            <p className="font-medium">{source}</p>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="p-3 border-b">Room Category</th>
                <th className="p-3 border-b">HSN</th>
                <th className="p-3 border-b">Rate</th>
                <th className="p-3 border-b">Rooms</th>
                <th className="p-3 border-b">Nights</th>
                <th className="p-3 border-b">Subtotal</th>
                <th className="p-3 border-b">SGST (2.5%)</th>
                <th className="p-3 border-b">CGST (2.5%)</th>
                <th className="p-3 border-b text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b last:border-b-0">
                  <td className="p-3">{it.category}</td>
                  <td className="p-3">{it.hsn || "-"}</td>
                  <td className="p-3">{formatINR(it.rate)}</td>
                  <td className="p-3">{it.rooms}</td>
                  <td className="p-3">{it.nights}</td>
                  <td className="p-3">{formatINR(it.subtotal)}</td>
                  <td className="p-3">{formatINR(it.sgst)}</td>
                  <td className="p-3">{formatINR(it.cgst)}</td>
                  <td className="p-3 text-right font-medium">
                    {formatINR(it.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-2">
          <p className="text-sm text-muted-foreground">Amount in words</p>
          <p className="font-medium">{numberToIndianWords(grand)}</p>
        </div>
        <div className="md:col-span-1">
          <div className="border rounded-md overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b bg-slate-50">
              <span className="text-sm">Subtotal</span>
              <span className="font-medium">{formatINR(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between p-3 border-b">
              <span className="text-sm">SGST (2.5%)</span>
              <span className="font-medium">{formatINR(sgst)}</span>
            </div>
            <div className="flex items-center justify-between p-3 border-b">
              <span className="text-sm">CGST (2.5%)</span>
              <span className="font-medium">{formatINR(cgst)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/5">
              <span className="text-sm font-semibold">Grand Total</span>
              <span className="text-base font-bold text-primary">
                {formatINR(grand)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex items-center justify-end gap-3 print:hidden">
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => window.print()}
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </Button>
      </div>
    </div>
  );
}

function formatDate(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
