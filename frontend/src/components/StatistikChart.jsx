import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const BULAN_LABEL = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export default function StatistikChart({ semuaDataAset, darkMode }) {
  if (!semuaDataAset || semuaDataAset.length === 0) return null;

  // Palet warna disesuaikan tema
  const gridColor = darkMode ? "#1e293b" : "#e2e8f0";
  const textColor = darkMode ? "#94a3b8" : "#64748b";
  const cardBg = darkMode
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-slate-200";
  const titleColor = darkMode
    ? "text-slate-100 border-slate-800"
    : "text-slate-800 border-slate-200";
  const tooltipStyle = darkMode
    ? {
        backgroundColor: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 8,
        fontSize: 12,
        color: "#e2e8f0",
      }
    : {
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        fontSize: 12,
      };

  // 1. Rasio Status Server (Aktif vs Down) — nggak berubah, ini udah bener
  const webAktif = semuaDataAset.filter((d) => d.is_aktif == 1).length;
  const webMati = semuaDataAset.filter((d) => d.is_aktif == 0).length;
  const dataServer = [
    { name: "Aktif", value: webAktif },
    { name: "Down", value: webMati },
  ];
  const COLORS_SERVER = ["#22c55e", darkMode ? "#334155" : "#94a3b8"];

  // 2. Distribusi Jenis Anomali — DIPERBAIKI:
  //    a) "Aman" dikeluarkan (fokus chart ini cuma buat nyorotin masalah)
  //    b) Normalisasi teks (trim + lowercase) biar "Judol" & "JUDOL " kehitung 1 kategori
  //       Catatan: "Judol" vs "judi online" TETAP kehitung beda karena teksnya
  //       memang beda kata — solusi permanennya di form input (lihat catatan di bawah).
  const anomalyCounts = {};
  const labelAsli = {}; // simpan bentuk label yang enak dibaca
  semuaDataAset.forEach((d) => {
    const anomRaw = (d.jenis_anomali || "").trim();
    if (!anomRaw || anomRaw.toLowerCase() === "aman") return;
    const key = anomRaw.toLowerCase();
    anomalyCounts[key] = (anomalyCounts[key] || 0) + 1;
    if (!labelAsli[key]) labelAsli[key] = anomRaw;
  });

  const dataAnomali = Object.keys(anomalyCounts)
    .map((key) => ({ name: labelAsli[key], jumlah: anomalyCounts[key] }))
    .sort((a, b) => b.jumlah - a.jumlah);

  const COLORS_ANOMALI = [
    "#dc2626",
    "#d97706",
    "#9333ea",
    "#db2777",
    "#0891b2",
    "#65a30d",
  ];

  // 3. BARU: Tren Insiden per Bulan (dari tanggal_insiden yang terisi)
  const trenBulanan = {};
  semuaDataAset.forEach((d) => {
    if (!d.tanggal_insiden) return;
    const tgl = new Date(d.tanggal_insiden);
    if (isNaN(tgl)) return;
    const key = `${tgl.getFullYear()}-${String(tgl.getMonth() + 1).padStart(2, "0")}`;
    trenBulanan[key] = (trenBulanan[key] || 0) + 1;
  });
  const dataTren = Object.keys(trenBulanan)
    .sort()
    .slice(-6) // 6 bulan terakhir yang ada datanya
    .map((key) => {
      const [tahun, bulan] = key.split("-");
      return {
        name: `${BULAN_LABEL[parseInt(bulan) - 1]} ${tahun.slice(2)}`,
        insiden: trenBulanan[key],
      };
    });

  return (
    <div className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Grafik Pie: Status Server */}
        <div
          className={`p-6 rounded-xl shadow-lg border transition-colors ${cardBg}`}
        >
          <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${titleColor}`}>
            📊 Rasio Status Server
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataServer}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: textColor }}
                  style={{ fontSize: 12, fill: textColor }}
                >
                  {dataServer.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS_SERVER[index % COLORS_SERVER.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: 12, color: textColor }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Bar: Distribusi Jenis Anomali (tanpa "Aman") */}
        <div
          className={`p-6 rounded-xl shadow-lg border transition-colors ${cardBg}`}
        >
          <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${titleColor}`}>
            🚨 Distribusi Jenis Anomali
          </h3>
          {dataAnomali.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-slate-500">
              Tidak ada anomali tercatat saat ini. 🎉
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataAnomali}
                  margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={gridColor}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: textColor }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: textColor }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: darkMode ? "#1e293b" : "#f1f5f9" }}
                  />
                  <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                    {dataAnomali.map((entry, index) => (
                      <Cell
                        key={`cell-bar-${index}`}
                        fill={COLORS_ANOMALI[index % COLORS_ANOMALI.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* BARU: Grafik Tren Insiden per Bulan */}
      {dataTren.length > 0 && (
        <div
          className={`p-6 rounded-xl shadow-lg border transition-colors ${cardBg}`}
        >
          <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${titleColor}`}>
            📈 Tren Insiden per Bulan
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dataTren}
                margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={gridColor}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: textColor }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: textColor }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="insiden"
                  stroke="#dc2626"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#dc2626" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
