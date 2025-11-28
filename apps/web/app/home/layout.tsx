"use client";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Home, ArrowLeftRight, Users, Menu, X } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { getUser } from "@/hooks/getUser";
import { createLeave, todayLeave } from "@/actions/admins/studentLeave";
import { toast } from "@repo/ui/src/hooks/use-toast";
import SidebarItem from "./_components/SidebarItem";

// Leave Popup Component
function LeavePopup({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason);
      setReason("");
      onClose();
    } else {
      toast({
        title: "Error",
        description: "Please enter a reason for the leave.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Leave</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Leave
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter reason for leave..."
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): any {
  const [isOpen, setIsOpen] = useState(true);
  const [created, setCreated] = useState(false);
  const [showLeavePopup, setShowLeavePopup] = useState(false);
  const user = getUser();

  useEffect(() => {
    todayLeave().then((res) => {
      setCreated(res);
    });
  }, []);

  const handleCreate = async (reason: string) => {
    createLeave(reason)
      .then(() => {
        setCreated(true);
        toast({
          title: "Leave Created",
          description: "You have successfully created a leave for today.",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "There was an error creating the leave. Please try again.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="flex min-h-screen ">
      {/* Toggle button */}
      <div className="fixed top-5 left-5 z-50">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full shadow-md"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200 pt-28 transition-all duration-300 ${
          isOpen ? "w-72 px-4" : "w-0 px-0"
        } overflow-hidden`}
      >
        {user?.role == "TEACHER" ? (
          <>
            <SidebarItem href="/home/dashboard" icon={<Home />} title="Home" />
            <SidebarItem href="/home/leaves" icon={<Users />} title="Leaves" />
            <SidebarItem href="/home/replacements" icon={<ArrowLeftRight />} title="Replacements" />
            <SidebarItem href="/home/offers" icon={<ArrowLeftRight />} title="Offers" />
          </>
        ) : user?.role == "ADMIN" ? (
          <>
            <SidebarItem href="/home/manage" icon={<Users />} title="Manage Users" />
            <SidebarItem href="/home/leavesReqs" icon={<Home />} title="LeavesReqs" />
            <SidebarItem href="/home/signupReqs" icon={<ArrowLeftRight />} title="SignupReqs" />
          </>
        ) : user?.role == "HOD" ? (
          <>
            <SidebarItem href="/home/leavesReqs" icon={<Users />} title="LeavesReqs" />
            <SidebarItem href="/home/students" icon={<Users />} title="StudentReqs" />
            <SidebarItem href="/home/replacementsReqs" icon={<ArrowLeftRight />} title="ReplacementsReqs" />
          </>
        ) : (
          <>
            <SidebarItem href="/home/dashboard" icon={<Home />} title="Home" />
            <SidebarItem href="/home/leaves" icon={<Users />} title="Leaves" />
            {!created && (
              <Button className="mt-4 w-full" onClick={() => setShowLeavePopup(true)}>
                Create Leave
              </Button>
            )}
          </>
        )}
        <Button onClick={() => signOut()} className="mt-4 w-full">
          Log Out
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-4">{children}</main>

      {/* Leave Popup */}
      <LeavePopup
        isOpen={showLeavePopup}
        onClose={() => setShowLeavePopup(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}