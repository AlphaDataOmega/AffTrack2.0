"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, MoreVertical } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { UserStatus } from "@prisma/client"
import { z } from "zod"

// Validation schemas
const UpdateUserSchema = z.object({
  id: z.string(),
  action: z.enum(['approve', 'suspend', 'resetPassword']),
  passwordHash: z.string().min(8).optional()
})

const CreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  status: z.enum(['PENDING', 'ACTIVE'])
})

type CreateUserInput = z.infer<typeof CreateUserSchema>
type UpdateUserInput = z.infer<typeof UpdateUserSchema>

interface User {
  id: string
  name: string | null
  email: string
  status: UserStatus
  isMaster: boolean
  createdAt: Date
}

export default function TeamSettingsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [newUserData, setNewUserData] = useState<CreateUserInput>({ 
    name: "", 
    email: "", 
    password: "",
    status: "PENDING"
  })
  const [newPassword, setNewPassword] = useState("")
  const { data: session } = useSession()
  const [hasPermission, setHasPermission] = useState(false)
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (session?.user?.isMaster) {
      setHasPermission(true)
      fetchUsers()
    } else {
      router.push('/platform/manage/settings/general')
    }
  }, [session, router])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to fetch users')
      }
      
      const { data } = await response.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('[TEAM_FETCH]', error)
      
      // Log client error
      await fetch('/api/manage/activity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: '[UI_ERROR] TEAM_FETCH',
          details: {
            component: 'TeamSettingsPage',
            message: error instanceof Error ? error.message : 'Failed to fetch users'
          }
        })
      })

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load team members',
        variant: "destructive"
      })
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async () => {
    setIsProcessing(true)
    try {
      // Validate input
      const validatedData = CreateUserSchema.parse(newUserData)

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-request': '1' // Add admin request header
        },
        body: JSON.stringify(validatedData)
      })

      const { data, error } = await response.json()
      
      if (!response.ok) {
        throw new Error(error?.message || 'Failed to add user')
      }

      await fetchUsers()
      
      // Reset form
      setShowAddModal(false)
      setNewUserData({ 
        name: "", 
        email: "", 
        password: "",
        status: "PENDING" 
      })

      toast({ title: "Success", description: "User added successfully" })
    } catch (error) {
      console.error('[TEAM_ADD]', error)
      
      // Log client error
      await fetch('/api/manage/activity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: '[UI_ERROR] TEAM_ADD',
          details: {
            component: 'TeamSettingsPage',
            message: error instanceof Error ? error.message : 'Failed to add user'
          }
        })
      })

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add user',
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    setIsProcessing(true)
    try {
      // Special handling for password reset
      if (action === 'resetPassword') {
        if (!newPassword || newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters')
        }
        
        const validatedData = UpdateUserSchema.parse({ 
          id: userId, 
          action,
          passwordHash: newPassword
        })

        const response = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validatedData)
        })

        let responseData;
        try {
          responseData = await response.json()
        } catch (e) {
          console.error('Failed to parse response:', e)
          throw new Error('Invalid server response')
        }
        
        if (!response.ok) {
          throw new Error(responseData?.error?.message || `Failed to ${action} user`)
        }

        setShowResetModal(false)
        setNewPassword("")
      } else {
        // Handle other actions
        const validatedData = UpdateUserSchema.parse({ 
          id: userId, 
          action
        })

        const response = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validatedData)
        })
        
        let responseData;
        try {
          responseData = await response.json()
        } catch (e) {
          console.error('Failed to parse response:', e)
          throw new Error('Invalid server response')
        }

        if (!response.ok) {
          throw new Error(responseData?.error?.message || `Failed to ${action} user`)
        }
      }

      await fetchUsers()

      toast({
        title: "Success",
        description: `User ${action}d successfully`
      })
    } catch (error) {
      console.error(`[TEAM_${action.toUpperCase()}]`, error)
      
      // Log client error
      await fetch('/api/manage/activity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `[UI_ERROR] TEAM_${action.toUpperCase()}`,
          details: {
            component: 'TeamSettingsPage',
            message: error instanceof Error ? error.message : `Failed to ${action} user`
          }
        })
      })

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} user`,
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApproveUser = (userId: string) => handleUserAction(userId, 'approve')
  const handleSuspendUser = (userId: string) => handleUserAction(userId, 'suspend')
  const handleResetPassword = () => handleUserAction(selectedUserId, 'resetPassword')

  const getInitials = (name: string | null) => {
    if (!name) return '??'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.PENDING:
        return <Badge variant="warning">Pending</Badge>
      case UserStatus.SUSPENDED:
        return <Badge variant="destructive">Suspended</Badge>
      case UserStatus.ACTIVE:
        return <Badge variant="success">Active</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  if (!hasPermission) return <div>Loading permissions...</div>

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Users</h3>
            <p className="text-sm text-gray-500">Manage users of your organization</p>
          </div>
          <Button 
            className="gap-2 bg-blue-500 hover:bg-blue-600"
            onClick={() => setShowAddModal(true)}
            disabled={isProcessing}
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No users found</div>
          ) : (
            <div className="border rounded-lg divide-y">
              {users.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{user.name || 'Unnamed User'}</p>
                        {getStatusBadge(user.status as UserStatus)}
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {user.status === 'PENDING' && (
                        <DropdownMenuItem onClick={() => handleApproveUser(user.id)}>
                          Approve User
                        </DropdownMenuItem>
                      )}
                      {user.status === 'ACTIVE' && (
                        <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                          Suspend User
                        </DropdownMenuItem>
                      )}
                      {user.status === 'SUSPENDED' && (
                        <DropdownMenuItem onClick={() => handleApproveUser(user.id)}>
                          Reactivate User
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => {
                        setSelectedUserId(user.id)
                        setShowResetModal(true)
                      }}>
                        Reset Password
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newUserData.name}
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={newUserData.status}
                onValueChange={(value: "PENDING" | "ACTIVE") => 
                  setNewUserData({...newUserData, status: value})
                }
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={isProcessing}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter a new password for this user.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetModal(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={isProcessing}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}