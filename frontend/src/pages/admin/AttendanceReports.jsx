import { useCallback, useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import DailyAttendanceManager from '../../components/attendance/DailyAttendanceManager';
import attendanceService from '../../services/attendanceService';
import useAuth from '../../hooks/useAuth';

export default function AttendanceReports(){
  const {user}=useAuth(); const [date,setDate]=useState(new Date().toISOString().slice(0,10)); const [className,setClassName]=useState(''); const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[exporting,setExporting]=useState(false);
  const classes=['VIII-A','VIII-B','IX-A'];
  const load=useCallback(async()=>{setLoading(true);setError('');try{const d=await attendanceService.getDailyAttendance({date,className});setRows(d.rows||[]);}catch(e){setError(e.message||'Gagal memuat data.');}finally{setLoading(false);}},[date,className]);
  useEffect(()=>{load();},[load]);
  async function update(id,payload){await attendanceService.updateAttendanceStatus(id,payload);await load();}
  async function exportExcel(){setExporting(true);try{const file=await attendanceService.exportAttendanceExcel({date,className});attendanceService.downloadBlob(file);}finally{setExporting(false);}}
  return <PageContainer title="Data Absensi" description="Rekap kehadiran harian sekolah. Perubahan status tidak menghapus data scan asli.">{loading&&<Loading label="Memuat data absensi..."/>}{!loading&&error&&<EmptyState title="Gagal memuat data" description={error} action={<Button onClick={load}>Coba Lagi</Button>}/>} {!loading&&!error&&<DailyAttendanceManager title="Rekap Absensi Sekolah" subtitle="Filter berdasarkan tanggal dan kelas, lalu ekspor ke Excel sesuai hak akses." rows={rows} date={date} setDate={setDate} classes={classes} className={className} setClassName={setClassName} canEdit onUpdate={update} onExport={exportExcel} exporting={exporting} currentUserName={user?.name}/>}</PageContainer>;
}
