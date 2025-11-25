import { PrismaClient, User, Subject, TimeSlot } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const delay = (ms: number = 50) => new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------------------------------------------
// USERS
// ------------------------------------------------------------

interface TeacherSeed {
  email: string;
  name: string;
  scheduleType: "MORNING" | "MID" | "EVENING";
}

async function createUsers() {
  const teacherData: TeacherSeed[] = [
    { email: "t1@example.com", name: "Dr. Rohan S", scheduleType: "MORNING" },
    { email: "t2@example.com", name: "Prof. Meera J", scheduleType: "MID" },
    { email: "t3@example.com", name: "Dr. Kunal N", scheduleType: "EVENING" },
    { email: "t4@example.com", name: "Dr. Anita D", scheduleType: "MORNING" },
    { email: "t5@example.com", name: "Prof. Karthik P", scheduleType: "MID" },
    { email: "t6@example.com", name: "Dr. Neha A", scheduleType: "EVENING" },
  ];

  const teachers: Array<User & { scheduleType: TeacherSeed["scheduleType"] }> = [];

  for (const t of teacherData) {
    const teacher = await prisma.user.create({
      data: {
        email: t.email,
        name: t.name,
        password: await bcrypt.hash("password123", 10),
        status: "ACTIVE",
        role: "TEACHER",
        emailVerified: new Date(),
      },
    });

    teachers.push({ ...teacher, scheduleType: t.scheduleType });
    await delay(10);
  }

  // Create HOD
  const hod = await prisma.user.create({
    data: {
      email: "hod@example.com",
      name: "Dr. HOD Kumar",
      password: await bcrypt.hash("password123", 10),
      role: "HOD",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Dr. Admin Kumar",
      password: await bcrypt.hash("password123", 10),
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  // Create Students with attendance
  const student1 = await prisma.user.create({
    data: {
      email: "s1@example.com",
      name: "Rahul Sharma",
      password: await bcrypt.hash("password123", 10),
      role: "STUDENT",
      status: "ACTIVE",
      attendence: 85, // Good attendance
      emailVerified: new Date(),
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "s2@example.com",
      name: "Priya Patel",
      password: await bcrypt.hash("password123", 10),
      role: "STUDENT",
      status: "ACTIVE",
      attendence: 68, // Low attendance
      emailVerified: new Date(),
    },
  });

  return { teachers, students: [student1, student2], hod };
}

// ------------------------------------------------------------
// SUBJECTS
// ------------------------------------------------------------

async function createSubjects(): Promise<Subject[]> {
  const subjects = ["Maths", "Physics", "DSA", "OS", "DBMS"];

  return await prisma.$transaction(
    subjects.map((name, i) =>
      prisma.subject.create({
        data: { name, code: `SUB${i + 1}` },
      })
    )
  );
}

// ------------------------------------------------------------
// TIMESLOTS
// ------------------------------------------------------------

async function createTimeSlots(): Promise<TimeSlot[]> {
  const baseDate = new Date("2025-01-01T00:00:00Z");

  const slotData = [
    ["08:00", "09:00", "Period 1"],
    ["09:00", "10:00", "Period 2"],
    ["10:00", "11:00", "Period 3"],
    ["11:00", "12:00", "Period 4"],
  ] as const;

  return await prisma.$transaction(
    slotData.map(([start, end, label]) => {
      const startTime = new Date(baseDate);
      const endTime = new Date(baseDate);

      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);

      startTime.setUTCHours(sh, sm, 0, 0);
      endTime.setUTCHours(eh, em, 0, 0);

      return prisma.timeSlot.create({
        data: { startTime, endTime, label },
      });
    })
  );
}

// ------------------------------------------------------------
// PICK SLOTS
// ------------------------------------------------------------

function pickSlots(type: TeacherSeed["scheduleType"], slots: TimeSlot[]): TimeSlot[] {
  if (type === "MORNING") return slots.slice(0, 2);
  if (type === "MID") return slots.slice(1, 3);
  return slots.slice(2, 4);
}

// ------------------------------------------------------------
// CREATE LECTURES
// ------------------------------------------------------------

async function createLectures(
  teachers: Array<User & { scheduleType: TeacherSeed["scheduleType"] }>,
  subjects: Subject[],
  slots: TimeSlot[],
  students: User[]
) {
  const today = new Date();
  const data: any[] = [];

  for (let day = 0; day < 5; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);

    for (const t of teachers) {
      const tSlots = pickSlots(t.scheduleType, slots);

      tSlots.forEach((slot, idx) => {
        data.push({
          teacherId: t.id,
          subjectId: subjects[(idx + day) % subjects.length].id,
          timeSlotId: slot.id,
          date,
          weekDay: date.getDay(),
          room: `R-${100 + Math.floor(Math.random() * 200)}`,
          studentId: students[Math.floor(Math.random() * students.length)].id,
        });
      });
    }
  }

  await prisma.lecture.createMany({ data });
}

// ------------------------------------------------------------
// CREATE STUDENT LEAVE REQUESTS
// ------------------------------------------------------------

async function createStudentLeaveRequests(students: User[]) {
  console.log("📝 Creating student leave requests...");

  const student1 = students[0]; // Rahul (85% attendance)
  const student2 = students[1]; // Priya (68% attendance)

  // ========== STUDENT 1 (Rahul) - Good Attendance ==========
  
  // 1. First rejection - NO application (CAN RESUBMIT)
  await prisma.studentLeaveRequest.create({
    data: {
      studentId: student1.id,
      applicationId: null,
      status: "DENIED",
      reason: "Personal work without proper justification",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  });

  // 2. Pending request WITH application
  const pendingLeave1 = await prisma.studentLeaveRequest.create({
    data: {
      studentId: student1.id,
      status: "PENDING",
      reason: "Medical emergency - need to visit specialist doctor for urgent treatment",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  const pendingApp1 = await prisma.applicationLeave.create({
    data: {
      applicantId: student1.id,
      studentLeaveId: pendingLeave1.id,
      s3ObjectKey: `students/${pendingLeave1.id}`,
    },
  });

  await prisma.studentLeaveRequest.update({
    where: { id: pendingLeave1.id },
    data: { applicationId: pendingApp1.id },
  });

  // 3. Final rejection WITH application (CANNOT RESUBMIT)
  const finalRejectedLeave = await prisma.studentLeaveRequest.create({
    data: {
      studentId: student1.id,
      status: "DENIED",
      reason: "Family trip abroad - declined even with supporting documents",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  });

  const finalRejectedApp = await prisma.applicationLeave.create({
    data: {
      applicantId: student1.id,
      studentLeaveId: finalRejectedLeave.id,
      s3ObjectKey: `students/${finalRejectedLeave.id}`,
    },
  });

  await prisma.studentLeaveRequest.update({
    where: { id: finalRejectedLeave.id },
    data: { applicationId: finalRejectedApp.id },
  });

  // 4. Approved request WITH application
  const approvedLeave1 = await prisma.studentLeaveRequest.create({
    data: {
      studentId: student1.id,
      status: "APPROVED",
      reason: "Sister's wedding ceremony - family function",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
  });

  const approvedApp1 = await prisma.applicationLeave.create({
    data: {
      applicantId: student1.id,
      studentLeaveId: approvedLeave1.id,
      s3ObjectKey: `students/${approvedLeave1.id}`,
    },
  });

  await prisma.studentLeaveRequest.update({
    where: { id: approvedLeave1.id },
    data: { applicationId: approvedApp1.id },
  });

  // ========== STUDENT 2 (Priya) - Low Attendance ==========

  // 1. First rejection - NO application (CAN RESUBMIT)
  await prisma.studentLeaveRequest.create({
    data: {
      studentId: student2.id,
      applicationId: null,
      status: "DENIED",
      reason: "Need to attend cousin's wedding",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });

  // 2. Another first rejection - NO application (CAN RESUBMIT)
  await prisma.studentLeaveRequest.create({
    data: {
      studentId: student2.id,
      applicationId: null,
      status: "DENIED",
      reason: "Festival celebration at home",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    },
  });

  // 3. Pending WITHOUT application (HOD will see low attendance warning)
  await prisma.studentLeaveRequest.create({
    data: {
      studentId: student2.id,
      applicationId: null,
      status: "PENDING",
      reason: "Dental appointment scheduled for tooth extraction",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  // 4. Pending WITH application (but low attendance)
  const pendingLeave2 = await prisma.studentLeaveRequest.create({
    data: {
      studentId: student2.id,
      status: "PENDING",
      reason: "Medical appointment at city hospital with doctor's referral",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  });

  const pendingApp2 = await prisma.applicationLeave.create({
    data: {
      applicantId: student2.id,
      studentLeaveId: pendingLeave2.id,
      s3ObjectKey: `students/${pendingLeave2.id}`,
    },
  });

  await prisma.studentLeaveRequest.update({
    where: { id: pendingLeave2.id },
    data: { applicationId: pendingApp2.id },
  });

  // 5. Approved WITH application
  const approvedLeave2 = await prisma.studentLeaveRequest.create({
    data: {
      studentId: student2.id,
      status: "APPROVED",
      reason: "Previous medical emergency with proper documentation",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    },
  });

  const approvedApp2 = await prisma.applicationLeave.create({
    data: {
      applicantId: student2.id,
      studentLeaveId: approvedLeave2.id,
      s3ObjectKey: `students/${approvedLeave2.id}`,
    },
  });

  await prisma.studentLeaveRequest.update({
    where: { id: approvedLeave2.id },
    data: { applicationId: approvedApp2.id },
  });

  console.log("✅ Student leave requests created!");
}

// ------------------------------------------------------------
// MAIN
// ------------------------------------------------------------

async function main() {
  console.log("🔄 Resetting...");

  // DELETE IN DEPENDENCY ORDER
  await prisma.replacementOffer.deleteMany();
  await prisma.studentLeaveRequest.deleteMany();
  await prisma.applicationLeave.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.lecture.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  console.log("👥 Creating users...");
  const { teachers, students, hod } = await createUsers();

  console.log("📚 Creating subjects...");
  const subjects = await createSubjects();

  console.log("⏰ Creating timeslots...");
  const slots = await createTimeSlots();

  console.log("📅 Creating lectures...");
  await createLectures(teachers, subjects, slots, students);

  console.log("📋 Creating student leave requests...");
  await createStudentLeaveRequests(students);

  console.log("🎉 Done! Users, Subjects, Slots, Lectures & Student Leaves seeded.");
}

main()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());