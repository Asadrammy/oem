"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createGroup } from "@/lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AddRolePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Form validation
  useEffect(() => {
    const valid = name.trim() !== "";
    setIsFormValid(valid);
  }, [name]);

  const onSubmit = async () => {
    setSubmitting(true);
    setErr("");

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
      };

      await createGroup(payload);

      toast({
        title: "Success",
        description: "Role created successfully!",
        variant: "default",
      });

      router.push("/group-permissions");
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to create role",
        variant: "destructive",
      });
      setErr(e.message || "Failed to create role");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/group-permissions">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roles
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">Add New Role</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {err && <div className="text-red-600">{err}</div>}

          <div>
            <Label htmlFor="name">Role Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter role name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter role description"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/group-permissions">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={onSubmit} disabled={!isFormValid || submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Create Role"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
