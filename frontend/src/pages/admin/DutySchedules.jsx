import { useEffect, useState } from "react";
import { CalendarDays, Save, Pencil, X } from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import Card, { CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import attendanceService from "../../services/attendanceService";

const teachers = [
  { id: "u-duty-1", name: "Bapak Ahmad Fauzi, S.Pd" },
  { id: "u-teacher-1", name: "Ibu Siti Aminah, S.Pd" },
];
const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
export default function DutySchedules() {
  const [rows, setRows] = useState([]),
    [form, setForm] = useState({
      date: new Date().toISOString().slice(0, 10),
      teacherId: teachers[0].id,
      period: new Date().toISOString().slice(0, 7),
    }),
    [saving, setSaving] = useState(false),
    [editing, setEditing] = useState(null);
  async function load() {
    const d = await attendanceService.getDutySchedules({ period: form.period });
    setRows(d.rows || []);
  }
  useEffect(() => {
    load();
  }, []);
  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const teacher = teachers.find((t) => t.id === form.teacherId);
      const row = await attendanceService.saveDutySchedule({
        ...form,
        teacherName: teacher.name,
      });
      setRows((r) => [...r, row]);
    } finally {
      setSaving(false);
    }
  }
  function startEdit(row) {
    setEditing({ ...row });
  }
  function saveEdit() {
    const teacher =
      teachers.find((t) => t.id === editing.teacherId) ||
      teachers.find((t) => t.name === editing.teacherName) ||
      teachers[0];
    setRows((r) =>
      r.map((x) =>
        x.id === editing.id
          ? { ...editing, teacherId: teacher.id, teacherName: teacher.name }
          : x,
      ),
    );
    setEditing(null);
  }
  return (
    <PageContainer
      title="Jadwal Guru Piket"
      description="Akun guru tetap sama. Admin hanya mengatur assignment piket per tanggal atau periode."
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader
            title="Tambah Jadwal"
            subtitle="Tentukan guru yang bertugas pada tanggal tertentu."
          />
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Periode/Bulan"
              type="month"
              value={form.period}
              onChange={(e) =>
                setForm((f) => ({ ...f, period: e.target.value }))
              }
            />
            <Input
              label="Tanggal Piket"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Guru</label>
              <select
                className={selectClass}
                value={form.teacherId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, teacherId: e.target.value }))
                }
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" icon={Save} isLoading={saving} fullWidth>
              Simpan Jadwal
            </Button>
          </form>
        </Card>
        <Card padding="p-0">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <CalendarDays className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold">Daftar Jadwal Piket</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-950">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Guru</th>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.map((r) => {
                  const edit = editing?.id === r.id;
                  return (
                    <tr key={r.id}>
                      {edit ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              className={selectClass}
                              value={editing.date}
                              onChange={(e) =>
                                setEditing((x) => ({
                                  ...x,
                                  date: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              className={selectClass}
                              value={
                                editing.teacherId ||
                                teachers.find(
                                  (t) => t.name === editing.teacherName,
                                )?.id ||
                                teachers[0].id
                              }
                              onChange={(e) =>
                                setEditing((x) => ({
                                  ...x,
                                  teacherId: e.target.value,
                                }))
                              }
                            >
                              {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="month"
                              className={selectClass}
                              value={editing.period}
                              onChange={(e) =>
                                setEditing((x) => ({
                                  ...x,
                                  period: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button size="sm" icon={Save} onClick={saveEdit}>
                                Simpan
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                icon={X}
                                onClick={() => setEditing(null)}
                              >
                                Batal
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">{r.date}</td>
                          <td className="px-4 py-3 font-medium">
                            {r.teacherName}
                          </td>
                          <td className="px-4 py-3">{r.period}</td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={Pencil}
                              onClick={() => startEdit(r)}
                            >
                              Ubah
                            </Button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
