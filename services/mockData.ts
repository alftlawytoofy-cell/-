import { Employee } from '../types';

export const MOCK_EMPLOYEE: Employee = {
  // Administrative
  p_id: "1234",
  p_name: "أحمد محمد علي",
  p_img: "https://avatar.iran.liara.run/public/boy?username=Ahmed",
  p_job: "مهندس أقدم",
  p_grade: "4",
  p_stage: "2",
  p_join_date: "2018/03/15",
  p_education: "بكالوريوس هندسة كهرباء",
  p_job_title: "رئيس مهندسين",
  p_salary: "1,250,000",
  p_promo_status: "مستحق",
  p_rollover: "لا يوجد",
  p_last_bonus: "2023/04/01",
  p_promo_date: "2024/01/01",
  p_due_pre: "500,000",
  p_due_post: "550,000",
  p_thanks: "كتاب شكر رقم 455 في 2023/11/10",
  p_annual_leave: "12 يوم",
  p_sick_leave: "0",

  // Financial
  employee_name: "أحمد محمد علي",
  employee_id: "1234",
  
  // Data Arrays
  salary_history: [
    {
      month: "مايو",
      year: "2024",
      net_salary: "1,450,000",
      raw_date: "2024/05/01",
      details: [
        { label: "الراتب الاسمي", value: "1,250,000" },
        { label: "مخصصات زوجية", value: "50,000" },
        { label: "مخصصات اطفال", value: "20,000" },
        { label: "مخصصات هندسية", value: "350,000" },
        { label: "ضريبة دخل", value: "-15,000" },
        { label: "توقيفات تقاعدية", value: "-125,000" },
        { label: "سلفة مصرفية", value: "-75,000" }
      ]
    }
  ],
  bonuses: [],
  dispatches: [],
  extra_hours: []
};

export const loginMock = async (id: string): Promise<Employee> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === "1234") {
        resolve(MOCK_EMPLOYEE);
      } else {
        reject(new Error("الرقم الوظيفي غير صحيح"));
      }
    }, 1500);
  });
};