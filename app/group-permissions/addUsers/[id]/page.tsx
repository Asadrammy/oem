"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Filter, X, RefreshCcw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';

// Import your API functions
import { 
  getGroupsById, 
  listUsers, 
  assignUsersToGroup 
} from '@/lib/api';

type User = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email: string;
  is_active: boolean;
};

export default function AssignUsersPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.id;

  const [roleName, setRoleName] = useState<string>('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [currentUsers, setCurrentUsers] = useState<Set<number>>(new Set());
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 9; // number of users per page

  // Fetch role data and users
  useEffect(() => {
    const fetchData = async () => {
      if (!roleId) return;

      try {
        setLoading(true);
        
        const roleResponse = await getGroupsById(Number(roleId));
        setRoleName(roleResponse.name);
        
        const currentUserIds = new Set<number>(
          (roleResponse.user_set || roleResponse.users || []).map((u: any) => Number(u.id))
        );
        setCurrentUsers(currentUserIds);
        setSelectedUsers(new Set(currentUserIds));

        const usersResponse = await listUsers();
        const users = usersResponse.results || usersResponse || [];
        setAllUsers(users);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId]);

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = [...allUsers];

    if (statusFilter !== 'All Status') {
      const isActive = statusFilter === 'Active';
      filtered = filtered.filter(user => user.is_active === isActive);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [allUsers, statusFilter, searchTerm]);

  // Pagination logic
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / pageSize);
  const displayedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const selectedCount = selectedUsers.size;

  const fetchPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  // Handle user selection
  const toggleUser = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    const displayedIds = displayedUsers.map(u => u.id);
    const allDisplayedSelected = displayedIds.every(id => selectedUsers.has(id));
    
    const newSelected = new Set(selectedUsers);
    if (allDisplayedSelected) {
      displayedIds.forEach(id => newSelected.delete(id));
    } else {
      displayedIds.forEach(id => newSelected.add(id));
    }
    setSelectedUsers(newSelected);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Status');
  };

  const handleSave = async () => {
    if (!roleId) return;
    try {
      setSaving(true);
      const usersArray = Array.from(selectedUsers);
      await assignUsersToGroup(Number(roleId), usersArray);
      alert("Users added to/from group successfully");
    } catch (error) {
      console.error('Error saving users:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const getUserDisplayName = (user: User) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.username;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-sm text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Role Details
            </button>
          </div>
        </div>

        {/* Title and Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Assign Users to Role: <span className="text-blue-600">{roleName}</span>
          </h1>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filter Users</span>
              </div>
              <div className="flex-1" />
              <span className="text-sm text-gray-500">
                Showing {displayedUsers.length} of {totalUsers} users
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search by name, username"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="min-w-32">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Status">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={handleSelectAll} className="gap-2">
                Select All
              </Button>

              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Users */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Available Users</h2>
              </div>
              <Badge variant="secondary" className="text-blue-600">
                {selectedCount} of {totalUsers} selected
              </Badge>
            </div>

            {/* User Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedUsers.map((user) => {
                const isSelected = selectedUsers.has(user.id);
                
                return (
                  <div
                    key={user.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => toggleUser(user.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleUser(user.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-blue-600 mb-1">
                          {getUserDisplayName(user)}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {user.email}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            @{user.username}
                          </div>
                          <Badge 
                            variant={user.is_active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {displayedUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found matching your filters
              </div>
            )}

            {/* Pagination */}
            
              <div className="flex justify-between items-center mt-6">
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => fetchPage(page - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      return (
                        p === 1 ||
                        p === 2 ||
                        p === totalPages ||
                        (p >= page - 1 && p <= page + 1)
                      );
                    })
                    .map((p, i, arr) => {
                      const prev = arr[i - 1];
                      return (
                        <React.Fragment key={p}>
                          {prev && p - prev > 1 && (
                            <span className="px-2 text-gray-500">…</span>
                          )}
                          <Button
                            variant={p === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => fetchPage(p)}
                          >
                            {p}
                          </Button>
                        </React.Fragment>
                      );
                    })}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => fetchPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
