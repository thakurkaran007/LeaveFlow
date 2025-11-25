"use server"

import { db } from "@repo/db/src"
import HODStudentLeaveCard from "./_components/Card";
import { approveStudentLeaveRequest, rejectStudentLeaveRequest } from "@/actions/admins/studentLeave";


const StudentReqs = async () => {
    const reqs = await db.studentLeaveRequest.findMany({
        include: {
            student: {
                select: {
                    name: true,
                    email: true,
                    attendence: true
                }
            },
            application: {
                select: {
                    s3ObjectKey: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    console.log(reqs);
    return (
        <div className="p-6 space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Student Leave Requests</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Review and manage student leave applications
                </p>
            </div>

            {reqs.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg border border-gray-200">
                    No leave requests to review.
                </div>
            ) : (
                <div className="space-y-4">
                    {reqs.map((req) => {
                        const leave = {
                            ...req,
                            student: {
                                ...req.student,
                                name: req.student.name ?? undefined,
                                attendence: req.student.attendence ?? 0
                            }
                        };

                        return (
                            <HODStudentLeaveCard
                                key={req.id}
                                leave={leave}
                                onApprove={approveStudentLeaveRequest}
                                onReject={rejectStudentLeaveRequest}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default StudentReqs;