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
  const [isFormValid, setIsFormValid] = useState(false);

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
  const [role, setRole] = useState("");
  const [preferredTheme, setPreferredTheme] = useState("light");
  const [fleetOperator, setFleetOperator] = useState<number | null>(null);

  // Validation state
  const [phoneError, setPhoneError] = useState("");
  const [pinError, setPinError] = useState("");
  const [emailError, setEmailError] = useState("");

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
        
        console.log("Fleet operators loaded:", operatorsResp);
        console.log("User groups loaded:", groupsResp);
        
        setFleetOperators(operatorsResp.results || []);
        setUserGroups(groupsResp || []);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    fetchData();
  }, []);

  // Validation functions
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone.trim()) return true; // Optional field
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePIN = (pin: string): boolean => {
    if (!pin.trim()) return true; // Optional field
    const pinRegex = /^\d{4,6}$/;
    return pinRegex.test(pin);
  };

  // Input handlers with validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^\d\s\-\(\)]/g, '');
    setPhoneNumber(value);
    
    if (value.trim() && !validatePhoneNumber(value)) {
      setPhoneError("Phone number must be 10-15 digits");
    } else {
      setPhoneError("");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value.trim() && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    setPin(value);
    
    if (value.trim() && !validatePIN(value)) {
      setPinError("PIN must be 4-6 digits");
    } else {
      setPinError("");
    }
  };

  // Form validation
  useEffect(() => {
    const valid = username.trim() !== "" && 
                  email.trim() !== "" && 
                  password.trim() !== "" && 
                  confirmPassword.trim() !== "" &&
                  password === confirmPassword &&
                  !phoneError && !pinError && !emailError;
    setIsFormValid(valid);
  }, [username, email, password, confirmPassword, phoneError, pinError, emailError]);

const onSubmit = async () => {
  setErr("");

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

  // Email format validation
  if (!validateEmail(email)) {
    toast({
      title: "Error",
      description: "Please enter a valid email address",
      variant: "destructive",
    });
    return;
  }

  if (!password.trim()) {
    toast({
      title: "Error",
      description: "Password is required",
      variant: "destructive",
    });
    return;
  }

  if (password !== confirmPassword) {
    toast({
      title: "Error",
      description: "Passwords do not match",
      variant: "destructive",
    });
    return;
  }

  // Phone number validation
  if (phoneNumber.trim() && !validatePhoneNumber(phoneNumber)) {
    toast({
      title: "Error",
      description: "Phone number must be 10-15 digits long",
      variant: "destructive",
    });
    return;
  }

  // PIN validation
  if (pin.trim() && !validatePIN(pin)) {
    toast({
      title: "Error",
      description: "PIN must be 4-6 digits",
      variant: "destructive",
    });
    return;
  }

  setSubmitting(true);
  try {
    // Only include profile fields that have values
    const profileData: any = {};
    
    if (phoneNumber.trim()) profileData.phone_number = phoneNumber;
    if (city.trim()) profileData.city = city;
    if (state.trim()) profileData.state = state;
    if (pin.trim()) profileData.pin = pin;
    if (address.trim()) profileData.address = address;
    if (role) profileData.role = role;
    if (preferredTheme) profileData.preferred_theme = preferredTheme;
    if (fleetOperator) profileData.fleet_operator = fleetOperator;

    const payload = {
      username,
      email,
      password,
      confirm_password: confirmPassword,
      first_name: firstName,
      last_name: lastName,
      is_active: isActive,
      profile: profileData,
    };

    await createUser(payload);

    toast({
      title: "Success",
      description: "User created successfully!",
      variant: "default",
    });

    router.push("/user");
  } catch (e: any) {
    console.error("Create user error:", e);
    console.error("Error response:", e?.response?.data);
    console.error("Error status:", e?.response?.status);
    console.error("Payload sent:", payload);
    
    const errorMessage = e?.response?.data?.message || 
                        e?.response?.data?.error || 
                        e?.response?.data?.detail ||
                        e?.response?.data?.non_field_errors?.[0] ||
                        e?.message || 
                        "Failed to create user";
    
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
                onChange={handleEmailChange}
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
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
                    onChange={handlePhoneChange}
                    placeholder="e.g., +1 (555) 123-4567 or 5551234567"
                    className={phoneError ? "border-red-500" : ""}
                  />
                  {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                  <p className="text-gray-500 text-xs mt-1">Enter 10-15 digits (international format supported)</p>
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
                    onChange={handlePinChange}
                    placeholder="4-6 digits"
                    maxLength={6}
                    className={pinError ? "border-red-500" : ""}
                  />
                  {pinError && <p className="text-red-500 text-sm mt-1">{pinError}</p>}
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
            <Button onClick={onSubmit} disabled={!isFormValid || submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "Saving…" : "Add User"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
