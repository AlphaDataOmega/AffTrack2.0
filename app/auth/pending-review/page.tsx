"use client"

import Link from "next/link"
import { Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PendingReviewPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Clock className="h-12 w-12 text-blue-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Account Pending Review
        </h2>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10 bg-[#151b2e] border-[#1e293b]">
            <div className="text-center space-y-4">
              <p className="text-gray-300">
                Your account has been created and is pending administrator review.
              </p>
              <p className="text-gray-400 text-sm">
                You will receive an email notification once your account has been approved.
              </p>
              <div className="pt-4">
                <Link href="/auth/login">
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 