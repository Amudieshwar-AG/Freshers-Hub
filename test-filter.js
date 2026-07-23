const FACULTY_DATA = [
  {
    id: '9',
    name: 'Prof. R. Vijayakumar',
    designation: 'Assistant Professor',
    department: 'Mechanical Engineering',
    office: 'MECH Block, Room 102',
    specialization: 'CAD/CAM, Robotics',
    email: 'vijayakumar@rit.edu',
  }
];

const searchFaculty = "";
const selectedDept = "Mechanical Engineering";

const filteredFaculty = FACULTY_DATA.filter((f) => {
  const searchLower = searchFaculty.toLowerCase();
  const matchSearch = 
    f.name.toLowerCase().includes(searchLower) ||
    f.department.toLowerCase().includes(searchLower) ||
    f.designation.toLowerCase().includes(searchLower) ||
    (f.specialization && f.specialization.toLowerCase().includes(searchLower));
  
  const matchDept = selectedDept === 'All Departments' || f.department === selectedDept;
  return matchSearch && matchDept;
});

console.log(filteredFaculty);
