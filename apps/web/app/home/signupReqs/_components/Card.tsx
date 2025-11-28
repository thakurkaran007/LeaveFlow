"use client";

import { useState } from "react";
import { Card, CardContent } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Mail, 
  CheckCircle, 
  XCircle,
  Loader2,
  Calendar
} from "lucide-react";
// import { format } from "date-fns";

interface SignupRequestCardProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: "STUDENT" | "TEACHER" | "HOD" | "ADMIN";
    createdAt: Date;
    image?: string | null;
  };
  onAccept: (userId: string, email: string) => Promise<void>;
  onReject: (userId: string, email: string) => Promise<void>;
}

export default function SignupRequestCard({ user, onAccept, onReject }: SignupRequestCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "STUDENT":
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case "TEACHER":
        return <BookOpen className="w-4 h-4 text-green-600" />;
      case "HOD":
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      STUDENT: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      TEACHER: "bg-green-100 text-green-800 hover:bg-green-100",
      HOD: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    };

    return (
      <Badge className={styles[role as keyof typeof styles]}>
        <span className="flex items-center gap-1">
          {getRoleIcon(role)}
          {role}
        </span>
      </Badge>
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(user.id, user.email);
      window.location.reload();
    } catch (error) {
      console.error("Error accepting user:", error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject(user.id, user.email);
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting user:", error);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Card className="transition-all hover:shadow-md border-l-4 border-l-amber-400">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* User Info Section */}
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar */}
            <Avatar className="w-12 h-12 border-2 border-gray-200">
              <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base text-gray-900 truncate">
                  {user.name || "Anonymous User"}
                </h3>
                {getRoleBadge(user.role)}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {/* <span>{format(new Date(user.createdAt), "MMM dd, yyyy")}</span> */}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleReject}
              variant="outline"
              size="sm"
              disabled={isAccepting || isRejecting}
              className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Rejecting
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Reject
                </>
              )}
            </Button>
            
            <Button
              onClick={handleAccept}
              size="sm"
              disabled={isAccepting || isRejecting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Accepting
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Accept
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}