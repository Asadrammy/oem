"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { updateUser, getUser, listFleetOperators, getUserGroups } from "@/lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FleetOperator {
  id: number;
  name: string;
}

export default function EditUserPage() {
  const { toast } = useToast();

  const router = useRouter();
  const params = useParams();
  const userId = Number(params?.id);
  
  console.log("User ID from params:", params?.id);
  console.log("Parsed user ID:", userId);

  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // user + profile state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("");
  const [preferredTheme, setPreferredTheme] = useState("light");
  const [fleetOperator, setFleetOperator] = useState<number | null>(null);

  const [fleetOperators, setFleetOperators] = useState<FleetOperator[]>([]);
  const [userGroups, setUserGroups] = useState<Array<{id: number, name: string}>>([]);

  // Fetch existing user + fleet operators
  useEffect(() => {
    async function fetchData() {
      try {
        const [userResp, opsResp, groupsResp] = await Promise.all([
          getUser(userId),
          listFleetOperators(1),
          getUserGroups(),
        ]);

        console.log("Loaded user data:", userResp);
        console.log("Fleet operators:", opsResp);
        console.log("User groups:", groupsResp);

        setUsername(userResp.username);
        setEmail(userResp.email);
        setFirstName(userResp.first_name || "");
        setLastName(userResp.last_name || "");
        setIsActive(userResp.is_active ?? true);

        if (userResp.profile) {
          setPhoneNumber(userResp.profile.phone_number || "");
          setCity(userResp.profile.city || "");
          setState(userResp.profile.state || "");
          setPin(userResp.profile.pin || "");
          setAddress(userResp.profile.address || "");
          setRole(userResp.profile.role || "");
          setPreferredTheme(userResp.profile.preferred_theme || "light");
          setFleetOperator(userResp.profile.fleet_operator || null);
        }

        setFleetOperators(opsResp.results || []);
        setUserGroups(groupsResp || []);
      } catch (e: any) {
        setErr(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  const onSubmit = async () => {
    setErr("");
    
    // Validate user ID
    if (!userId || isNaN(userId)) {
      toast({
        title: "Error",
        description: "Invalid user ID",
        variant: "destructive",
      });
      return;
    }
    
    // Basic validation
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!email.trim()) {
      toast({
        title: "Error", 
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);

    const userPayload = {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      is_active: isActive,
    };

    // Only include profile fields that have values
    const profilePayload: any = {};
    
    if (phoneNumber.trim()) profilePayload.phone_number = phoneNumber;
    if (city.trim()) profilePayload.city = city;
    if (state.trim()) profilePayload.state = state;
    if (pin.trim()) profilePayload.pin = pin;
    if (address.trim()) profilePayload.address = address;
    if (role) profilePayload.role = role;
    if (preferredTheme) profilePayload.preferred_theme = preferredTheme;
    // Temporarily comment out fleet_operator to test
    // if (fleetOperator) profilePayload.fleet_operator = fleetOperator;

    try {
      // Send user and profile data together as the API expects
      const combinedPayload = {
        ...userPayload,
        profile: profilePayload
      };
      
      console.log("Sending payload to API:", combinedPayload);
      await updateUser(userId, combinedPayload);

      toast({
        title: "Success",
        description: "User updated successfully!",
        variant: "default", // default for success
      });

      router.push("/user");
    } catch (e: any) {
      console.error("Update user error:", e);
      console.error("Error response:", e?.response?.data);
      console.error("Combined payload sent:", combinedPayload);
      
      const errorMessage = e?.response?.data?.message || 
                          e?.response?.data?.error || 
                          e?.response?.data?.detail ||
                          e?.message || 
                          "Failed to update user";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setErr(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading user data…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/user">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">Edit User</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {err && <div className="text-red-600">{err}</div>}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
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
                  <Input value={pin} onChange={(e) => setPin(e.target.value)} />
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
                <Label>Fleet Operator</Label>
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
              {submitting ? "Saving…" : "Update User"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
