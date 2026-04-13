'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LearningPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Continuous Learning</h1>
        <p className="text-gray-600 mt-2">Review AI responses to improve the system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">145</div>
            <p className="text-xs text-green-600">Learning from these</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">System Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">94%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Trends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Avg Quality</span>
              <span className="font-bold">87%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '87%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Approval Rate</span>
              <span className="font-bold">92%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '92%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Accuracy</span>
              <span className="font-bold">94%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: '94%'}}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
