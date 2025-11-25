import { auth } from "@/auth";
import { getLeaveReqsById } from "@/data/teachers/user";
import LeaveCard from "../_components/teacher/LeaveCard";
import StudentLeaveCard from "./_components/card";

const LeavePage = async () => {
  const session = await auth();
  const leaves = await getLeaveReqsById(session?.user.id!, session?.user.role!);

  if (session?.user.role === 'TEACHER') {
        return (
        <div className="p-6 space-y-4">
          {leaves.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No leave requests found.
            </div>
          ) : (
            leaves.map((leave) => <LeaveCard key={leave.id} leave={leave} />)
          )}
        </div>
      );
  } else if (session?.user.role === 'STUDENT') {
    return (
      <div className="p-6 space-y-4">
        {leaves.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No leave requests found.
          </div>
        ) : (
          leaves.map((leave) => <StudentLeaveCard key={leave.id} leave={leave} />)
        )}
      </div>
    );
  }
};

export default LeavePage;
