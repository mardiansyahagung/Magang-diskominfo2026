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
} from "recharts";

export default function StatistikChart({ semuaDataAset }) {
  // 1. Data untuk Grafik Status Server (Aktif vs Down)
  const webAktif = semuaDataAset.filter((d) => d.is_aktif == 1).length;
  const webMati = semuaDataAset.filter((d) => d.is_aktif == 0).length;

  const dataServer = [
    { name: "Aktif", value: webAktif },
    { name: "Down", value: webMati },
  ];
  const COLORS_SERVER = ["#16a34a", "#475569"]; // Hijau & Slate

  // 2. Data untuk Grafik Jenis Anomali
  const anomalyCounts = {};
  semuaDataAset.forEach((d) => {
    let anom = d.jenis_anomali ? d.jenis_anomali.trim() : "Aman";
    anomalyCounts[anom] = (anomalyCounts[anom] || 0) + 1;
  });

  const dataAnomali = Object.keys(anomalyCounts).map((key) => ({
    name: key,
    jumlah: anomalyCounts[key],
  }));

  const COLORS_ANOMALI = [
    "#059669",
    "#dc2626",
    "#2563eb",
    "#d97706",
    "#9333ea",
    "#db2777",
  ];

  if (semuaDataAset.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      {/* Grafik Pie: Status Server */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
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
              >
                {dataServer.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS_SERVER[index % COLORS_SERVER.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grafik Bar: Distribusi Jenis Anomali */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
          📈 Distribusi Jenis Anomali
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dataAnomali}
              margin={{ top: 10, right: 30, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#2563eb" radius={[6, 6, 0, 0]}>
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
      </div>
    </div>
  );
}
