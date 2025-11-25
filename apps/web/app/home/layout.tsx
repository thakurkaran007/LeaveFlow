"use client";
import { use, useEffect, useState } from "react";

import SidebarItem from "./_components/SidebarItem";
import { signOut } from "next-auth/react";
import { Home, ArrowLeftRight, Bell, Users, Menu, X } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { getUser } from "@/hooks/getUser";
import { createLeave, todayLeave } from "@/actions/admins/studentLeave";
import { toast } from "@repo/ui/src/hooks/use-toast";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}):any {
  const [isOpen, setIsOpen] = useState(true);
  const [created, setCreated] = useState(false);
  const user = getUser();

  useEffect(() => {
    todayLeave()
      .then((res) => {
        setCreated(res);
      })
  }, []);
  const handleCreate = async () => {
    createLeave()
    .then(() => {
      setCreated(true);
      toast({
        title: "Leave Created",
        description: "You have successfully created a leave for today.",})
    })
    .catch(() => {
      toast({
        title: "Error",
        description: "There was an error creating the leave. Please try again.",
        variant: "destructive",
      });
    });
  }
  return  (<div className="flex min-h-screen ">
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
        {
          user?.role == 'TEACHER' ? (
            <>
              <SidebarItem href="/home/dashboard" icon={<Home />} title="Home" />
              <SidebarItem href="/home/leaves" icon={<Users />} title="Leaves" />
              <SidebarItem href="/home/replacements" icon={<ArrowLeftRight />} title="Replacements" />
              <SidebarItem href="/home/offers" icon={<ArrowLeftRight />} title="Offers" />
            </>
          ) : (
            user?.role == 'ADMIN' ? (
              <>
                <SidebarItem href="/home/manage" icon={<Users />} title="Manage Users" />
                <SidebarItem href="/home/leavesReqs" icon={<Home /> } title="LeavesReqs" />
                <SidebarItem href="/home/signupReqs" icon={<ArrowLeftRight />} title="SignupReqs" />
              </>
            ) : (
              user?.role == 'HOD' ? (
                <>
                  <SidebarItem href="/home/leavesReqs" icon={<Users />} title="LeavesReqs" />
                  <SidebarItem href="/home/students" icon={<Users />} title="StudentReqs" />
                  <SidebarItem href="/home/replacementsReqs" icon={<ArrowLeftRight />} title="ReplacementsReqs" />
                </>
            ) : (
              <>
                <SidebarItem href="/home/dashboard" icon={<Home />} title="Home" />
                <SidebarItem href="/home/leaves" icon={<Users />} title="Leaves" />
                {
                  !created && (
                    <Button className="mt-4 w-full" onClick={() => handleCreate()}
                    >Create Leave</Button>
                  )
                }
              </>
            )
          )
        )
        }
        <Button onClick={() => signOut()} className="mt-4 w-full">
          Log Out
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-4">{children}</main>
    </div>
  );
}
