"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Label } from "@repo/ui/label";
import { 
  User, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3,
  ExternalLink,
  AlertCircle,
  Loader2
} from "lucide-react";
// import { format } from "date-fns";
import { getImageByKey } from "@/data/teachers/user";

interface HODStudentLeaveCardProps {
  leave: {
    id: string;
    studentId: string;
    status: "PENDING" | "APPROVED" | "DENIED";
    reason: string | null;
    createdAt: Date;
    updatedAt: Date;
    applicationId: string | null;
    student: {
      name?: string;
      email?: string;
      attendence: number;
    };
    application?: {
      s3ObjectKey: string | null;
    } | null;
  };
  onApprove: (leaveId: string, hasApplication: boolean) => Promise<void>;
  onReject: (leaveId: string, hasApplication: boolean) => Promise<void>;
}

export default function HODStudentLeaveCard({ leave, onApprove, onReject }: HODStudentLeaveCardProps) {
  const [isViewingApplication, setIsViewingApplication] = useState(false);
  const [applicationUrl, setApplicationUrl] = useState<string | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const hasApplication = leave.applicationId !== null;
  const isPending = leave.status === "PENDING";

  const getStatusBadge = () => {
    if (leave.status === "APPROVED") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
    }
    if (leave.status === "DENIED") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Review</Badge>;
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 75) return "text-green-600 bg-green-50";
    if (attendance >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const handleViewApplication = async () => {
    if (!leave.application?.s3ObjectKey) return;

    setIsLoadingApp(true);
    try {
      const key = `students/${leave.id}`;
      const url = await getImageByKey(key);
      setApplicationUrl(url);
      setIsViewingApplication(true);
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setIsLoadingApp(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(leave.id, hasApplication);
    } catch (error) {
      console.error("Error approving:", error);
    } finally {
      setIsApproving(false);
    }
    window.location.reload();
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject(leave.id, hasApplication);
    } catch (error) {
      console.error("Error rejecting:", error);
    } finally {
      setIsRejecting(false);  
    }
    window.location.reload();
  };

  return (
    <>
      <Card className={`transition-all ${
        leave.status === "APPROVED" ? "border-green-200 bg-green-50/30" :
        leave.status === "DENIED" ? "border-red-200 bg-red-50/30" :
        "border-blue-200 bg-blue-50/20"
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {leave.student.name?.charAt(0).toUpperCase() || "S"}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{leave.student.name || "Student"}</h3>
                <p className="text-sm text-gray-500">{leave.student.email || "N/A"}</p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Student Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getAttendanceColor(leave.student.attendence)}`}>
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Attendance</Label>
                <p className="font-bold text-lg">{leave.student.attendence}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Leave Details */}
          {leave.reason && (<div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">Reason for Leave</Label>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed p-3 bg-gray-50 rounded-md border border-gray-200">
                {leave.reason}
              </p>
            </div>

          </div>)}

          {/* Application Status */}
          {hasApplication ? (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-blue-700">Application Document Available</span>
                <p className="text-xs text-blue-600">Supporting document has been submitted</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-amber-700">No Application Document</span>
                <p className="text-xs text-amber-600">Student has not submitted supporting documents</p>
              </div>
            </div>
          )}

          {/* Warning for low attendance */}
          {leave.student.attendence < 75 && isPending && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm font-medium text-red-700">Low Attendance Warning</span>
                <p className="text-xs text-red-600">Student's attendance is below 75%. Consider carefully before approval.</p>
              </div>
            </div>
          )}
        </CardContent>

        {isPending && (
          <CardFooter className="bg-gray-50 border-t pt-4 flex flex-col gap-3">
            {/* View Application Button */}
            {hasApplication && (
              <Button
                onClick={handleViewApplication}
                variant="outline"
                className="w-full"
                disabled={isLoadingApp}
              >
                {isLoadingApp ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Application...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Application Document
                  </>
                )}
              </Button>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <Button
                onClick={handleReject}
                variant="outline"
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                disabled={isApproving || isRejecting}
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={isApproving || isRejecting}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        )}

        {!isPending && (
          <CardFooter className="bg-gray-50 border-t pt-4">
            <div className="w-full text-center text-sm text-gray-600">
              {leave.status === "APPROVED" ? (
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>Request was approved </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-red-700">
                  <XCircle className="w-4 h-4" />
                  <span>Request was rejected </span>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Application Viewer Dialog */}
      <Dialog open={isViewingApplication} onOpenChange={setIsViewingApplication}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Application Document</DialogTitle>
            <DialogDescription>
              Leave application submitted by {leave.student.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden rounded-lg border border-gray-200">
            {applicationUrl ? (
              <iframe
                src={applicationUrl}
                className="w-full h-full"
                title="Application Document"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewingApplication(false)}>
              Close
            </Button>
            {applicationUrl && (
              <Button onClick={() => window.open(applicationUrl, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}