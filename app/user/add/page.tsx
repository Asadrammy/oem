"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUser, listFleetOperators, getUserGroups } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FleetOperator {
  id: number;
  name: string;
}

export default function AddUserPage() {
    const { toast } = useToast();

  const router = useRouter();
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Basic user fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isActive] = useState(true);

  // Profile fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("FLEET_USER");
  const [preferredTheme, setPreferredTheme] = useState("light");
  const [fleetOperator, setFleetOperator] = useState<number | null>(null);

  // Fleet operators dropdown
  const [fleetOperators, setFleetOperators] = useState<FleetOperator[]>([]);
  const [userGroups, setUserGroups] = useState<Array<{id: number, name: string}>>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [operatorsResp, groupsResp] = await Promise.all([
          listFleetOperators(1),
          getUserGroups()
        ]);
        setFleetOperators(operatorsResp.results || []);
        setUserGroups(groupsResp || []);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    fetchData();
  }, []);

const onSubmit = async () => {
  setErr("");

  if (password !== confirmPassword) {
    toast({
      title: "Error",
      description: "Passwords do not match",
      variant: "destructive",
    });
    return;
  }

  setSubmitting(true);
  try {
    const payload = {
      username,
      email,
      password,
      confirm_password: confirmPassword,
      first_name: firstName,
      last_name: lastName,
      is_active: isActive,
      profile: {
        phone_number: phoneNumber,
        city,
        state,
        pin,
        address,
        role,
        preferred_theme: preferredTheme,
        fleet_operator: fleetOperator, // dropdown selected ID
      },
    };

    await createUser(payload);

    toast({
      title: "Success",
      description: "User created successfully!",
      variant: "default",
    });

    router.push("/user");
  } catch (e: any) {
    toast({
      title: "Error",
      description: e.message || "Failed to create user",
      variant: "destructive",
    });
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/user">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">Add User</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Username *</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>Confirm Password *</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>State</Label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div>
                  <Label>PIN</Label>
                  <Input
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="">-- Select Role --</option>
                    {userGroups.map((group) => (
                      <option key={group.id} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Preferred Theme</Label>
                  <Input
                    value={preferredTheme}
                    onChange={(e) => setPreferredTheme(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Fleet Operator *</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={fleetOperator ?? ""}
                  onChange={(e) =>
                    setFleetOperator(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">-- Select Fleet Operator --</option>
                  {fleetOperators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/user">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={onSubmit} disabled={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Add User"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
