import { useState } from "react";
import Placeholder from "../_Placeholder";
import { useEffect } from "react";
import { adminTeacherServices } from "../../services/adminServices/teacherServices";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDataTeachers = async () => {
      setLoading(true);
      try {
        const response = await adminTeacherServices.getTeachers();

        if (response.success) {
          setTeachers(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataTeachers();
  }, []);

  console.log(teachers);
  return <Placeholder title="Data Guru" />;
}
