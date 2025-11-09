import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import RoomRow, {
  CATEGORY_RATES,
  RoomCategory,
  RoomRowData,
  computeRow,
} from "@/components/invoice/RoomRow";
import InvoicePreview, { HotelInfo } from "@/components/invoice/InvoicePreview";
import { formatINR } from "@/lib/money";
import { Plus, FileText } from "lucide-react";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Index() {
  // Hotel details (editable)
  const [hotel, setHotel] = useState<HotelInfo>({
    name: "Lucent The Luxury Hotel",
    address: "Ratnagiri Extension, Kempanahalli Main Road, Chikkmagaluru",
    gstin: "29BPIPK0091R1Z7",
    phone: "+918618376684",
    email: "lucentthehomelystay@gmail.com",
  });

  // Guest and invoice fields
  const todayISO = new Date().toISOString().slice(0, 10);
  const [invoiceDate, setInvoiceDate] = useState<string>(todayISO);
  const [folioNo, setFolioNo] = useState("");
  const [guestName, setGuestName] = useState("");
  const [billTo, setBillTo] = useState("");
  const [checkIn, setCheckIn] = useState<string>(todayISO);
  const [checkOut, setCheckOut] = useState<string>(todayISO);
  const [adults, setAdults] = useState<number>(2);
  const [defaultRooms, setDefaultRooms] = useState<number>(1);
  const [defaultNights, setDefaultNights] = useState<number>(1);
  const [source, setSource] = useState<string>("Direct");

  // Room rows
  const [rows, setRows] = useState<RoomRowData[]>([
    computeRow({
      id: uid(),
      category: "" as any,
      hsn: "",
      rate: 0,
      rooms: defaultRooms,
      nights: defaultNights,
      subtotal: 0,
      sgst: 0,
      cgst: 0,
      total: 0,
    }),
  ]);

  // Editable category rates (user-entered prices)
  const [categoryRates, setCategoryRates] = useState<Record<RoomCategory, number>>(() => ({ ...CATEGORY_RATES }));

  const setCategoryRate = (cat: RoomCategory, value: number) => {
    setCategoryRates((s) => ({ ...s, [cat]: value }));
    // Update existing non-dirty rows that match this category
    setRows((rs) => rs.map((r) => (r.category === cat && !r.dirtyRate ? computeRow({ ...r, rate: value }) : r)));
  };

  useEffect(() => {
    // If defaults change, apply to rows that are zero
    setRows((rs) =>
      rs.map((r) =>
        computeRow({
          ...r,
          rooms: r.rooms || defaultRooms,
          nights: r.nights || defaultNights,
        }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultRooms, defaultNights]);

  const totals = useMemo(() => {
    const subtotal = rows.reduce((s, r) => s + r.subtotal, 0);
    const sgst = rows.reduce((s, r) => s + r.sgst, 0);
    const cgst = rows.reduce((s, r) => s + r.cgst, 0);
    const grand = subtotal + sgst + cgst;
    return { subtotal, sgst, cgst, grand };
  }, [rows]);

  const salesSummary = useMemo(() => {
    const map: Record<
      string,
      {
        category: string;
        rooms: number;
        nights: number;
        subtotal: number;
        sgst: number;
        cgst: number;
        total: number;
      }
    > = {};
    rows.forEach((r) => {
      const key = r.category || "Uncategorized";
      if (!map[key])
        map[key] = {
          category: key,
          rooms: 0,
          nights: 0,
          subtotal: 0,
          sgst: 0,
          cgst: 0,
          total: 0,
        };
      map[key].rooms += r.rooms || 0;
      map[key].nights += r.nights || 0;
      map[key].subtotal += r.subtotal;
      map[key].sgst += r.sgst;
      map[key].cgst += r.cgst;
      map[key].total += r.total;
    });
    return Object.values(map);
  }, [rows]);

  const addRow = () => {
    setRows((rs) => [
      ...rs,
      computeRow({
        id: uid(),
        category: "" as any,
        hsn: "",
        rate: 0,
        rooms: defaultRooms,
        nights: defaultNights,
        subtotal: 0,
        sgst: 0,
        cgst: 0,
        total: 0,
      }),
    ]);
  };

  const removeRow = (id: string) =>
    setRows((rs) => rs.filter((r) => r.id !== id));
  const updateRow = (id: string, updated: RoomRowData) =>
    setRows((rs) => rs.map((r) => (r.id === id ? computeRow(updated) : r)));

  // Invoice number handling
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = () => {
    const inv = nextInvoiceNumber(new Date(invoiceDate));
    setInvoiceNumber(inv);
    setShowPreview(true);
    // Scroll to preview
    setTimeout(() => {
      document
        .getElementById("invoice")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const newInvoice = () => {
    setInvoiceDate(todayISO);
    setFolioNo("");
    setGuestName("");
    setBillTo("");
    setCheckIn(todayISO);
    setCheckOut(todayISO);
    setAdults(2);
    setDefaultRooms(1);
    setDefaultNights(1);
    setSource("Direct");
    setRows([
      computeRow({
        id: uid(),
        category: "" as any,
        hsn: "",
        rate: 0,
        rooms: 1,
        nights: 1,
        subtotal: 0,
        sgst: 0,
        cgst: 0,
        total: 0,
      }),
    ]);
    setInvoiceNumber("");
    setShowPreview(false);
  };

  const input =
    "w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40";
  const label = "text-xs text-muted-foreground";
  const card = "bg-white border rounded-xl shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10 print:hidden">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-extrabold">
              A
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invoice Generator</p>
              <h1 className="text-lg font-bold">{hotel.name}</h1>
            </div>
          </div>
          <Button className="hidden md:inline-flex" onClick={newInvoice}>
            New Invoice
          </Button>
        </div>
      </header>

      <main className="container py-6 space-y-8">
        <div className="print:hidden space-y-8">
          {/* Hotel details */}
          <section className={card + " p-5"}>
            <h2 className="text-sm font-semibold tracking-wide mb-4">
              Hotel Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={label}>Hotel Name</label>
                <input
                  className={input}
                  value={hotel.name}
                  onChange={(e) => setHotel({ ...hotel, name: e.target.value })}
                />
              </div>
              <div>
                <label className={label}>GSTIN</label>
                <input
                  className={input}
                  value={hotel.gstin}
                  onChange={(e) =>
                    setHotel({ ...hotel, gstin: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={label}>HSN CODE</label>
                <input
                  className={input}
                  value={hotel.hsn}
                  onChange={(e) => setHotel({ ...hotel, hsn: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Phone</label>
                  <input
                    className={input}
                    value={hotel.phone}
                    onChange={(e) =>
                      setHotel({ ...hotel, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={label}>Email</label>
                  <input
                    className={input}
                    value={hotel.email}
                    onChange={(e) =>
                      setHotel({ ...hotel, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <label className={label}>Address</label>
                <textarea
                  className={input}
                  rows={2}
                  value={hotel.address}
                  onChange={(e) =>
                    setHotel({ ...hotel, address: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          {/* Guest & invoice fields */}
          <section className={card + " p-5"}>
            <h2 className="text-sm font-semibold tracking-wide mb-4">
              Guest & Invoice Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={label}>Invoice Date</label>
                <input
                  type="date"
                  className={input}
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div>
                <label className={label}>Folio / Reservation No.</label>
                <input
                  className={input}
                  placeholder="e.g. RES12345"
                  value={folioNo}
                  onChange={(e) => setFolioNo(e.target.value)}
                />
              </div>
              <div>
                <label className={label}>Guest Name</label>
                <input
                  className={input}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
              <div>
                <label className={label}>Bill To</label>
                <input
                  className={input}
                  placeholder="Company / Person"
                  value={billTo}
                  onChange={(e) => setBillTo(e.target.value)}
                />
              </div>
              <div>
                <label className={label}>Check-in</label>
                <input
                  type="date"
                  className={input}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div>
                <label className={label}>Check-out</label>
                <input
                  type="date"
                  className={input}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div>
                <label className={label}>No. of Nights</label>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={defaultNights}
                  onChange={(e) =>
                    setDefaultNights(Number(e.target.value || 0))
                  }
                />
              </div>
              <div>
                <label className={label}>No. of Rooms</label>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={defaultRooms}
                  onChange={(e) => setDefaultRooms(Number(e.target.value || 0))}
                />
              </div>
              <div>
                <label className={label}>Adults</label>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value || 0))}
                />
              </div>
              <div>
                <label className={label}>Source</label>
                <select
                  className={input}
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option>Direct</option>
                  <option>Website</option>
                  <option>Booking.com</option>
                  <option>MakeMyTrip</option>
                  <option>Phone</option>
                  <option>Corporate</option>
                </select>
              </div>
            </div>
          </section>

          {/* Room rows */}
          <section className={card + " p-5 space-y-4"}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide">
                Room Details
              </h2>
              <Button
                onClick={addRow}
                type="button"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4" /> Add Room
              </Button>
            </div>
            <div className="space-y-3">
              {rows.map((r) => (
                <RoomRow
                  key={r.id}
                  data={r}
                  rates={categoryRates}
                  onChange={(u) => updateRow(r.id, u)}
                  onRemove={() => removeRow(r.id)}
                />
              ))}
            </div>

            {/* Real-time totals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-2 text-sm text-muted-foreground">
              <div className="mb-2">Category pricing (enter your rates):</div>
              <div className="grid grid-cols-1 gap-2">
                {Object.keys(categoryRates).map((k) => (
                  <div key={k} className="flex items-center gap-2">
                    <label className="text-xs w-36">{k}</label>
                    <input
                      type="number"
                      className="w-full rounded-md border px-2 py-1 text-sm"
                      value={categoryRates[k as RoomCategory]}
                      onChange={(e) => setCategoryRate(k as RoomCategory, Number(e.target.value || 0))}
                    />
                  </div>
                ))}
              </div>
            </div>
              <div className="md:col-span-1">
                <div className="border rounded-md overflow-hidden">
                  <div className="flex items-center justify-between p-2 border-b bg-slate-50">
                    <span className="text-sm">Subtotal</span>
                    <span className="font-medium">
                      {formatINR(totals.subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b">
                    <span className="text-sm">SGST (2.5%)</span>
                    <span className="font-medium">
                      {formatINR(totals.sgst)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 border-b">
                    <span className="text-sm">CGST (2.5%)</span>
                    <span className="font-medium">
                      {formatINR(totals.cgst)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-primary/5">
                    <span className="text-sm font-semibold">Grand Total</span>
                    <span className="text-base font-bold text-primary">
                      {formatINR(totals.grand)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={card + " p-5"}>
            <h2 className="text-sm font-semibold tracking-wide mb-4">
              Sales Summary
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="p-3 border-b">Category</th>
                    <th className="p-3 border-b">Rooms</th>
                    <th className="p-3 border-b">Nights</th>
                    <th className="p-3 border-b">Subtotal</th>
                    <th className="p-3 border-b">SGST</th>
                    <th className="p-3 border-b">CGST</th>
                    <th className="p-3 border-b text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {salesSummary.map((s) => (
                    <tr key={s.category} className="border-b last:border-b-0">
                      <td className="p-3">{s.category}</td>
                      <td className="p-3">{s.rooms}</td>
                      <td className="p-3">{s.nights}</td>
                      <td className="p-3">{formatINR(s.subtotal)}</td>
                      <td className="p-3">{formatINR(s.sgst)}</td>
                      <td className="p-3">{formatINR(s.cgst)}</td>
                      <td className="p-3 text-right font-medium">
                        {formatINR(s.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex items-center justify-end">
            <Button
              onClick={handleGenerate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <FileText className="w-4 h-4" /> Generate Invoice
            </Button>
          </div>
        </div>

        {showPreview && (
          <InvoicePreview
            hotel={hotel}
            invoiceNumber={invoiceNumber}
            invoiceDate={invoiceDate}
            folioNo={folioNo}
            guestName={guestName}
            billTo={billTo}
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            rooms={defaultRooms}
            nights={defaultNights}
            source={source}
            items={rows}
          />
        )}
      </main>

      <footer className="py-8 text-center text-xs text-muted-foreground">
        This is computer generated bill, Signature is not required
      </footer>
    </div>
  );
}

function nextInvoiceNumber(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const key = `invoiceCounter-${yyyy}-${mm}`;
  const current = parseInt(localStorage.getItem(key) || "0", 10) || 0;
  const next = current + 1;
  localStorage.setItem(key, String(next));
  const seq = String(next).padStart(3, "0");
  return `INV-${yyyy}-${mm}-${seq}`;
}
