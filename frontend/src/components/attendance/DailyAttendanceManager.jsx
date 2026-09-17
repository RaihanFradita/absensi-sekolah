import { useMemo, useState } from 'react';
import { Download, Search, Save, X, History } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import AttendanceStats from './AttendanceStats';
import AttendanceStatus from './AttendanceStatus';
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABEL } from '../../utils/constants';

const selectClass='h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const EDITABLE=[ATTENDANCE_STATUS.PRESENT,ATTENDANCE_STATUS.LATE,ATTENDANCE_STATUS.ABSENT,ATTENDANCE_STATUS.EXCUSED,ATTENDANCE_STATUS.SICK,ATTENDANCE_STATUS.NOT_YET];

export default function DailyAttendanceManager({
  title='Rekap Kehadiran', subtitle, rows=[], date, setDate, classes=[], className='', setClassName,
  canEdit=false, onUpdate, onExport, exporting=false, currentUserName,
}){
  const [activeStatus,setActiveStatus]=useState('total');
  const [search,setSearch]=useState('');
  const [editingId,setEditingId]=useState(null);
  const [draft,setDraft]=useState({status:'',note:''});

  const filtered=useMemo(()=>rows.filter((r)=>{
    const statusOk=activeStatus==='total'||r.currentStatus===activeStatus;
    const q=search.trim().toLowerCase();
    const searchOk=!q||r.student?.name?.toLowerCase().includes(q)||r.student?.nis?.includes(q);
    return statusOk&&searchOk;
  }),[rows,activeStatus,search]);
  const count=(s)=>rows.filter((r)=>r.currentStatus===s).length;
  const stats=[
    {key:'total',label:'Total Siswa',value:rows.length},
    {key:'present',label:'Hadir',value:count(ATTENDANCE_STATUS.PRESENT)},
    {key:'absent',label:'Tidak Hadir',value:count(ATTENDANCE_STATUS.ABSENT)},
    {key:'late',label:'Terlambat',value:count(ATTENDANCE_STATUS.LATE)},
    {key:'excused',label:'Izin',value:count(ATTENDANCE_STATUS.EXCUSED)},
    {key:'sick',label:'Sakit',value:count(ATTENDANCE_STATUS.SICK)},
  ];

  function startEdit(row){setEditingId(row.id);setDraft({status:row.currentStatus,note:row.note||''});}
  async function save(row){await onUpdate?.(row.id,{status:draft.status,note:draft.note,changedBy:currentUserName});setEditingId(null);}

  return <div className="space-y-5">
    <Card>
      <CardHeader title={title} subtitle={subtitle} action={<Button variant="secondary" icon={Download} isLoading={exporting} onClick={onExport}>Download Excel</Button>} />
      <div className="grid gap-3 md:grid-cols-3">
        <Input label="Tanggal" type="date" value={date} onChange={(e)=>setDate?.(e.target.value)} />
        {classes.length>0&&<div><label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Kelas</label><select className={`${selectClass} w-full`} value={className} onChange={(e)=>setClassName?.(e.target.value)}>{classes.length>1&&<option value="">Semua kelas</option>}{classes.map(c=><option key={c} value={c}>{c}</option>)}</select></div>}
        <Input label="Cari siswa" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Nama atau NIS" startAdornment={<Search className="h-4 w-4"/>}/>
      </div>
    </Card>

    <AttendanceStats items={stats} onItemClick={setActiveStatus} activeKey={activeStatus}/>

    <Card padding="p-0">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Daftar {activeStatus==='total'?'Semua Siswa':ATTENDANCE_STATUS_LABEL[activeStatus]}</h3>
        <p className="mt-1 text-xs text-slate-500">{filtered.length} siswa ditampilkan. Data scan asli tetap disimpan walau status dikoreksi.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950"><tr><th className="px-4 py-3">NIS/NISN</th><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Kelas</th><th className="px-4 py-3">Jam Scan</th><th className="px-4 py-3">Status Awal</th><th className="px-4 py-3">Status Akhir</th><th className="px-4 py-3">Keterangan</th>{canEdit&&<th className="px-4 py-3">Aksi</th>}</tr></thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {filtered.map(row=>{
            const editing=editingId===row.id;
            return <tr key={row.id} className="bg-white align-top dark:bg-slate-900">
              <td className="px-4 py-3 text-xs text-slate-500">{row.student?.nis}<br/>{row.student?.nisn}</td>
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.student?.name}{row.changedBy&&<div className="mt-1 flex items-center gap-1 text-[11px] font-normal text-slate-400"><History className="h-3 w-3"/>Diubah {row.changedBy}</div>}</td>
              <td className="px-4 py-3">{row.student?.className}</td>
              <td className="px-4 py-3 font-mono">{row.scanTimeLabel||'-'}</td>
              <td className="px-4 py-3">{row.initialStatus?<AttendanceStatus status={row.initialStatus}/>:<span className="text-slate-400">Belum scan</span>}</td>
              <td className="px-4 py-3">{editing?<select className={selectClass} value={draft.status} onChange={(e)=>setDraft(d=>({...d,status:e.target.value}))}>{EDITABLE.map(s=><option key={s} value={s}>{ATTENDANCE_STATUS_LABEL[s]}</option>)}</select>:<AttendanceStatus status={row.currentStatus}/>}</td>
              <td className="px-4 py-3">{editing?<input className="h-10 w-52 rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950" value={draft.note} onChange={(e)=>setDraft(d=>({...d,note:e.target.value}))} placeholder="Alasan/keterangan"/>:<span className="text-slate-600 dark:text-slate-300">{row.note||'-'}</span>}</td>
              {canEdit&&<td className="px-4 py-3">{editing?<div className="flex gap-2"><Button size="sm" icon={Save} onClick={()=>save(row)}>Simpan</Button><Button size="sm" variant="ghost" icon={X} onClick={()=>setEditingId(null)}>Batal</Button></div>:<Button size="sm" variant="secondary" onClick={()=>startEdit(row)}>Ubah</Button>}</td>}
            </tr>})}
          {filtered.length===0&&<tr><td colSpan={canEdit?8:7} className="px-4 py-10 text-center text-slate-500">Tidak ada siswa yang cocok dengan filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  </div>;
}
