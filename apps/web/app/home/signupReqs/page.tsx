"use server";
import { auth } from "@/auth";
import { db } from "@repo/db/src";
import SignupRequestCard from "./_components/Card";
import { approveSignupRequest, rejectSignupRequest } from "@/actions/admins/signupReqs";


const SignupReqs = async () => {
  const session = await auth();
  
  if (session?.user.role !== "HOD" && session?.user.role !== "ADMIN") {
    return (
      <div className="p-6">
        <div className="text-center text-red-600 py-10">
          Unauthorized access. Only HOD and Admin can view signup requests.
        </div>
      </div>
    );
  }

  const users = await db.user.findMany({
    where: { 
      status: "PENDING" 
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Signup Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve pending user registrations
        </p>
      </div>

      {users.length === 0 ? (
        <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-lg font-medium">No pending signup requests</p>
          <p className="text-sm mt-1">All registrations have been processed</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{users.length}</span> pending request{users.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <SignupRequestCard
                key={user.id}
                user={user}
                onAccept={approveSignupRequest}
                onReject={rejectSignupRequest}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SignupReqs;