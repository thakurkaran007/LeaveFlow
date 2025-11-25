import { auth } from "@/auth";
import { AdminWelcome, HODWelcome } from "./_components/animations";
import { db } from "@repo/db/src";
import WeeklyTimetable from "../_components/calender/TimeTable";

const Calender = async () => {
  const session = await auth();
  
  // Check user role
  if (session?.user?.role === 'ADMIN') {
    return <AdminWelcome />;
  }
  
  if (session?.user?.role === 'HOD') {
    return <HODWelcome />;
  }
  
  let lectures: any[] = [];
  if (session?.user?.role === 'TEACHER') {
      lectures = await db.lecture.findMany({
          where: {
            teacherId: session?.user?.id
          },
          include: {
            subject: true,
            teacher: true,
            timeSlot: true
          },
          orderBy: [
            { weekDay: 'asc' },
            { timeSlot: { startTime: 'asc' } }
          ]
      });
  } else if (session?.user?.role === 'STUDENT') {
    lectures = await db.lecture.findMany({
        where: {
          studentId: session?.user?.id
        },
        include: {
          subject: true,
          teacher: true,
          timeSlot: true
        },
        orderBy: [
          { weekDay: 'asc' },
          { timeSlot: { startTime: 'asc' } }
        ]
    })
  }
    
      return (
        <>
          <WeeklyTimetable sampleLectures={lectures}/>  
        </>
      );
}

export default Calender;