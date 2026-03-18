"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  DollarSign,
  Calendar,
  MessageSquare,
} from "lucide-react";

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;
  const [status, setStatus] = useState("QUALIFIED");

  // Mock lead data
  const lead = {
    id: leadId,
    name: "John Smith",
    email: "john@techstartup.com",
    phone: "(555) 123-4567",
    company: "TechStartup Inc",
    industry: "SaaS",
    website: "www.techstartup.com",
    status: "QUALIFIED",
    qualificationScore: 92,
    budget: "$25k-50k",
    timeline: "1-3 months",
    conversationsCount: 3,
    firstContactAt: "2026-03-10T14:30:00Z",
    ownerViewed: true,
    ownerNotes: "Hot lead - very interested in enterprise plan.",
    conversations: [
      { id: "1", title: "Initial inquiry", date: "2026-03-10" },
      { id: "2", title: "Product demo", date: "2026-03-13" },
      { id: "3", title: "Pricing discussion", date: "2026-03-16" },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{lead.name}</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1 break-words">{lead.company}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap flex-shrink-0">
          <Button variant="outline" className="text-sm whitespace-nowrap">Send Email</Button>
          <Button className="bg-primary-600 hover:bg-primary-700 text-white text-sm whitespace-nowrap">
            Contact
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Contact Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600">Email</p>
                  <p className="text-sm text-gray-900">{lead.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600">Phone</p>
                  <p className="text-sm text-gray-900">{lead.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Building className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600">Company</p>
                  <p className="text-sm text-gray-900">{lead.company}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Deal Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Deal Information
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Budget
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {lead.budget}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timeline
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {lead.timeline}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Industry
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {lead.industry}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">
                  First Contact
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  Mar 10, 2026
                </p>
              </div>
            </div>
          </div>

          {/* Conversation History */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              Conversation History
            </h2>

            <div className="space-y-3">
              {lead.conversations.map((conv) => (
                <a
                  key={conv.id}
                  href={`/conversations/${conv.id}`}
                  className="block p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <p className="font-medium text-gray-900">{conv.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{conv.date}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Qualification Score */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Qualification Score
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Score
                  </span>
                  <span className="text-3xl font-bold text-primary-600">
                    {lead.qualificationScore}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600"
                    style={{ width: `${lead.qualificationScore}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-800">
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status
            </h3>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="UNQUALIFIED">Unqualified</option>
            </select>
          </div>

          {/* Owner Notes */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Owner Notes
            </h3>
            <textarea
              defaultValue={lead.ownerNotes}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
            />
            <Button className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white">
              Save Notes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
