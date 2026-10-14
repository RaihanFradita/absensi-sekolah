import DutyRecap from "./DutyRecap";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function NotScanned() {
  usePageTitle("Siswa Belum Scan");
  return <DutyRecap onlyNotScanned title="Siswa Belum Scan" />;
}
