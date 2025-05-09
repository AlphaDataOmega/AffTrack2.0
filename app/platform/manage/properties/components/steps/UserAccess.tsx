"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HelpCircle, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type PropertyForm, type User, type ApiResponse } from '../../config'

interface UserAccessProps {
  form: PropertyForm
  setForm: (form: PropertyForm) => void
}

function LoadingText() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export function UserAccess({ form, setForm }: UserAccessProps) {
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch users')
      }

      // Handle both direct array and data property formats
      const users = Array.isArray(data) ? data : data.data

      if (!users || !Array.isArray(users)) {
        throw new Error('Invalid users data format')
      }

      setAvailableUsers(users)
      
      // Pre-select users that are already added
      const currentUsers = users.filter((user: User) => form.users.includes(user.id))
      setSelectedUsers(currentUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load users',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch users on mount and when modal opens
  useEffect(() => {
    if (showModal) {
      fetchUsers()
    }
  }, [showModal]) // Only depend on showModal

  // Initialize selected users from form.users on mount
  useEffect(() => {
    if (form.users.length > 0) {
      fetchUsers()
    }
  }, []) // Empty dependency array for initialization

  const toggleUser = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id)
      if (isSelected) {
        return prev.filter(u => u.id !== user.id)
      } else {
        return [...prev, user]
      }
    })
  }

  const handleSave = () => {
    setForm({
      ...form,
      users: selectedUsers.map(user => user.id)
    })
    setShowModal(false)
    toast({
      title: "Success",
      description: "User access updated successfully"
    })
  }

  const filteredUsers = availableUsers.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <Card className="p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">User Access Management</p>
            <p className="mt-1">
              Add or remove users who should have access to this property.
              Users will be notified when access is granted or revoked.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Manage Users
          </Label>
          <Button
            onClick={() => setShowModal(true)}
            className="w-full justify-center"
          >
            Select Users
          </Button>
        </div>

        {isLoading ? (
          <LoadingText />
        ) : form.users.length > 0 && selectedUsers.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Current Users</h3>
            <div className="space-y-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{user.name || 'Unnamed User'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedUsers(prev => prev.filter(u => u.id !== user.id))
                      setForm({
                        ...form,
                        users: form.users.filter(id => id !== user.id)
                      })
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove Access
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No users have been added yet</p>
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Users</DialogTitle>
            <DialogDescription>
              Choose users who should have access to this property
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {isLoading ? (
                <LoadingText />
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No users found</div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUsers.some(u => u.id === user.id)
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border border-blue-100'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => toggleUser(user)}
                    >
                      <div>
                        <p className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                          {user.name || 'Unnamed User'}
                        </p>
                        <p className={`text-sm ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                          {user.email}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 