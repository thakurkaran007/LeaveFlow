"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Textarea } from "@repo/ui/textarea";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { CheckCircle2, XCircle, Clock, Upload, AlertCircle, FileText, Send, Loader2, File, X } from "lucide-react";
// import { format } from "date-fns";
import axios from "axios";
import { createApplication, getSignUrl } from "@/data/teachers/user";
import { toast } from "@repo/ui/src/hooks/use-toast";

interface StudentLeaveCardProps {
  leave: {
    id: string;
    status: "PENDING" | "APPROVED" | "DENIED";
    count: number;
    reason: string;
    createdAt: Date;
    updatedAt: Date;
    applicationId: string | null;
    application?: {
      s3ObjectKey: string | null;
    } | null;
  };
}

export default function StudentLeaveCard({ leave }: StudentLeaveCardProps) {
  const [isResubmitDialogOpen, setIsResubmitDialogOpen] = useState(false);
  const [newReason, setNewReason] = useState("");
  const [applicationFile, setApplicationFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Determine the actual state
  const isFirstRejection = leave.status === "DENIED" && leave.applicationId === null;
  const isFinalRejection = leave.status === "DENIED" && leave.applicationId !== null;
  const isAccepted = leave.status === "APPROVED";

  const getStatusIcon = () => {
    if (isAccepted) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (isFirstRejection || isFinalRejection) return <XCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusBadge = () => {
    if (isAccepted) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
    }
    if (isFirstRejection) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected - Action Required</Badge>;
    }
    if (isFinalRejection) {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Final Rejection</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Under Review</Badge>;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setApplicationFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setApplicationFile(selectedFile);
      }
    }
  };

  const removeFile = () => {
    setApplicationFile(null);
  };

  const handleResubmit = async () => {
    if (!newReason.trim() && !applicationFile) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("leaveRequestId", leave.id);
      formData.append("reason", newReason || leave.reason);
      if (applicationFile) {
        formData.append("application", applicationFile);
      }

      const key = `students/${leave.id}`
      const url = await getSignUrl(key);

      if (url) {
        
        // If there's a presigned URL, upload the file
        if (url && applicationFile) {
          await createApplication(leave.id, key, newReason);
          await axios.put(url, applicationFile, {
            headers: { "Content-Type": applicationFile.type },
          });
        }

        setIsResubmitDialogOpen(false);
        setNewReason("");
        setApplicationFile(null);
        window.location.reload();
        toast({
          title: "Resubmission Successful",
          description: "Your leave request has been resubmitted for review.",
        })
      } else {
        console.error("Failed to resubmit");
      }
    } catch (error) {
      console.error("Error resubmitting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className={`transition-all ${
        isFirstRejection ? "border-red-300 bg-red-50/50 shadow-md" : 
        isFinalRejection ? "border-gray-300 bg-gray-50 opacity-75" :
        isAccepted ? "border-green-200 bg-green-50/30" :
        "border-gray-200"
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <h3 className="font-semibold text-lg">Leave Request</h3>
                <p className="text-sm text-gray-500">
                  {/* Submitted {format(new Date(leave.createdAt), "PPP")} */}
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {leave.reason && (<div>
            <Label className="text-sm font-medium text-gray-700">Reason for Leave</Label>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{leave.reason}</p>
          </div>)}

          <div className="flex gap-6 text-sm">
            <div>
              <Label className="text-xs text-gray-500">Duration</Label>
              <p className="font-medium text-base">{leave.count ? leave.count : 0} day{leave.count > 1 ? 's' : ''}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Last Updated</Label>
              {/* <p className="font-medium">{format(new Date(leave.updatedAt), "PP")}</p> */}
            </div>
          </div>

          {leave.application?.s3ObjectKey && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <FileText className="w-4 h-4 text-blue-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-blue-700">Application Submitted</span>
                <p className="text-xs text-blue-600">Supporting document attached</p>
              </div>
            </div>
          )}

          {isFirstRejection && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-1">Request Rejected</p>
                <p className="text-xs text-red-600 leading-relaxed">
                  Your leave request was not approved. You can resubmit with a clearer explanation or attach supporting documents (medical certificate, invitation letter, etc.) to strengthen your request.
                </p>
              </div>
            </div>
          )}

          {isFinalRejection && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <XCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 mb-1">Final Decision</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  This request has been reviewed and rejected. No further action can be taken on this request. Please submit a new leave request if needed.
                </p>
              </div>
            </div>
          )}

          {isAccepted && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800 mb-1">Request Approved</p>
                <p className="text-xs text-green-600 leading-relaxed">
                  Your leave has been approved. Make sure to inform your instructors before your leave period.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        {isFirstRejection && (
          <CardFooter className="bg-gray-50 border-t pt-4">
            <Button
              onClick={() => setIsResubmitDialogOpen(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Resubmit with Explanation/Documents
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={isResubmitDialogOpen} onOpenChange={setIsResubmitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Resubmit Leave Request
            </DialogTitle>
            <DialogDescription>
              Provide additional explanation or attach supporting documents to strengthen your request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Reason Input */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Updated Reason (Optional)
              </Label>
              <Textarea
                id="reason"
                placeholder={leave.reason}
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                rows={4}
                className="resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                Leave blank to keep the original reason
              </p>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Supporting Document (PDF)
              </Label>
              
              {!applicationFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                    dragActive 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold text-amber-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF only (Max 10MB)</p>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <File className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{applicationFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(applicationFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsResubmitDialogOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResubmit}
              disabled={(!newReason.trim() && !applicationFile) || isSubmitting}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Resubmit Request
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}