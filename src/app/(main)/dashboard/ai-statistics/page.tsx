'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  Brain, 
  TrendingUp, 
  BookOpen, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  Star,
  Users,
  Lightbulb,
  DollarSign,
  Sparkles,
  Target,
  Camera
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import aiStatisticService, { AiStatistic, ReportStatus } from '@/services/aiStatisticService'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AiStatisticsPage() {
  const [statistics, setStatistics] = useState<AiStatistic[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [currentReport, setCurrentReport] = useState<AiStatistic | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')

  // Load danh sách báo cáo
  const loadStatistics = async () => {
    try {
      setLoading(true)
      const response = await aiStatisticService.getStatistics(1, 20)
      setStatistics(response.data)
    } catch (error) {
      console.error('Error loading statistics:', error)
      toast.error('Không thể tải danh sách báo cáo')
    } finally {
      setLoading(false)
    }
  }

  // Tạo báo cáo mới
  const generateReport = async () => {
    try {
      setGenerating(true)
      setProgress(0)
      setProgressMessage('Bắt đầu tạo báo cáo...')

      console.log('Sending request to generate statistic (user will be extracted from token)')
      const response = await aiStatisticService.generateStatistic()
      console.log('Generate statistic response:', response)
      
      toast.success('Đang tạo báo cáo thống kê!', {
        description: 'Sẽ mất khoảng 1-2 phút để hoàn thành'
      })

      // Bắt đầu polling
      aiStatisticService.pollReportStatus(
        response.id,
        (status: ReportStatus) => {
          setProgress(status.progress)
          setProgressMessage(status.message)
        },
        (report: AiStatistic) => {
          setCurrentReport(report)
          setGenerating(false)
          setProgress(100)
          setProgressMessage('Báo cáo đã hoàn thành!')
          toast.success('Báo cáo đã được tạo thành công!')
          loadStatistics() // Reload danh sách
        },
        (error) => {
          console.error('Report generation failed:', error)
          setGenerating(false)
          setProgress(0)
          toast.error('Có lỗi xảy ra khi tạo báo cáo')
        }
      )

    } catch (error) {
      console.error('Error generating report:', error)
      setGenerating(false)
      toast.error('Không thể tạo báo cáo')
    }
  }

  // Xem chi tiết báo cáo
  const viewReport = async (id: string) => {
    try {
      const report = await aiStatisticService.getStatistic(id)
      setCurrentReport(report)
    } catch (error) {
      console.error('Error viewing report:', error)
      toast.error('Không thể tải báo cáo')
    }
  }

  // Xóa báo cáo
  const deleteReport = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) return

    try {
      await aiStatisticService.deleteStatistic(id)
      toast.success('Đã xóa báo cáo')
      loadStatistics()
      if (currentReport?._id === id) {
        setCurrentReport(null)
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      toast.error('Không thể xóa báo cáo')
    }
  }

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadStatistics()
  }, [])

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI Statistics</h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Smart Recommendation & Analysis
            </p>
          </div>
        </div>
        
        <Button 
          onClick={generateReport} 
          disabled={generating}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
        >
          {generating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Create New Report
            </>
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      {generating && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <Clock className="h-5 w-5 animate-pulse" />
              <span>Creating report...</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="w-full h-3" />
              <p className="text-sm text-blue-700 font-medium">{progressMessage}</p>
              <p className="text-xs text-blue-600 flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Progress: {progress}% - Please do not close this page
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danh sách báo cáo */}
      <Card className="border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
          <CardTitle className="flex items-center justify-between text-gray-800">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Report List
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadStatistics}
              disabled={loading}
              className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {statistics.length} reports created
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statistics.map((stat) => (
              <div
                key={stat._id}
                className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  currentReport?._id === stat._id 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                onClick={() => viewReport(stat._id)}
              >
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm line-clamp-2">
                      {stat.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(parseISO(stat.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </p>
                  </div>
                  <div className="flex items-center flex-wrap gap-2">
                    <Badge
                      variant={
                        stat.status === 'completed' ? 'default' :
                        stat.status === 'generating' ? 'default' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {stat.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {stat.status === 'generating' && <Clock className="h-3 w-3 mr-1" />}
                      {stat.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {stat.status === 'completed' ? 'Hoàn thành' :
                       stat.status === 'generating' ? 'Đang tạo' : 'Lỗi'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {stat.totalBooksAnalyzed} books
                    </span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        viewReport(stat._id)
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteReport(stat._id)
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {statistics.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500 col-span-full">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-blue-400" />
                </div>
                <p className="font-medium text-gray-700">No reports found</p>
                <p className="text-sm flex items-center justify-center gap-2 mt-2">
                  <Sparkles className="h-4 w-4" />
                  Create your first report!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chi tiết báo cáo */}
      {currentReport ? (
        <ReportDetail report={currentReport} />
      ) : (
        <Card className="border-dashed border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
              <TrendingUp className="h-16 w-16 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Select a report to view details
            </h3>
            <p className="text-gray-600 text-center flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Select a report from the list above or create a new report
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Component hiển thị chi tiết báo cáo
function ReportDetail({ report }: { report: AiStatistic }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 shadow-lg bg-gradient-to-br from-white to-blue-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {report.title}
              </CardTitle>
              <CardDescription className="mt-3 text-gray-700 whitespace-pre-line leading-relaxed">
                {report.summary}
              </CardDescription>
              <div className="flex items-center flex-wrap gap-3 mt-4">
                <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(parseISO(report.start), 'dd/MM/yyyy', { locale: vi })} - {' '}
                  {format(parseISO(report.end), 'dd/MM/yyyy', { locale: vi })}
                </Badge>
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {report.totalBooksAnalyzed} books analyzed
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Books Chart */}
        <Card className="border-gray-200 shadow-md hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
              <TrendingUp className="h-5 w-5" />
              Top Selling Books
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.chartData.topBooks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="title" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reason Distribution */}
        <Card className="border-gray-200 shadow-md hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-lg flex items-center gap-2 text-green-700">
              <Target className="h-5 w-5" />
              Reason Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report.chartData.reasonDistribution as any[]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ reason, count }) => `${reason}: ${count}`}
                >
                  {report.chartData.reasonDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trends */}
        <Card className="border-gray-200 shadow-md hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
              <TrendingUp className="h-5 w-5" />
              Sales Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={report.chartData.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalSales" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Doanh số"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Correlations */}
        <Card className="border-gray-200 shadow-md hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <Sparkles className="h-5 w-5" />
              Correlations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.chartData.correlations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="factor" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="correlation" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Book Analysis */}
      <Card className="border-gray-200 shadow-md hover:shadow-xl transition-shadow">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <BookOpen className="h-5 w-5" />
            Book Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.bookAnalysis.map((book, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{book.book}</h4>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    {book.reason}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-blue-600">{book.salesCount} cuốn</p>
                  <div className="flex items-center justify-end text-sm text-gray-600 mt-1">
                    <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
                    <span className="font-medium">{book.rating}/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Deep Insights */}
      {report.aiInsights && (
        <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">AI Deep Insights</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              In-depth analysis of customer psychology and market trends
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Insights */}
              {report.aiInsights.customerInsights && (
                <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-purple-700 text-lg">Customer Insights</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {report.aiInsights.customerInsights}
                  </p>
                </div>
              )}

              {/* Market Trends */}
              {report.aiInsights.marketTrends && (
                <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-green-700 text-lg">Market Trends</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {report.aiInsights.marketTrends}
                  </p>
                </div>
              )}

              {/* Business Opportunities */}
              {report.aiInsights.businessOpportunities && (
                <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-yellow-700 text-lg">Business Opportunities</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {report.aiInsights.businessOpportunities}
                  </p>
                </div>
              )}

              {/* Pricing Strategy */}
              {report.aiInsights.pricingStrategy && (
                <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-700 text-lg">Pricing Strategy</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {report.aiInsights.pricingStrategy}
                  </p>
                </div>
              )}

              {/* Predictions */}
              {report.aiInsights.predictions && (
                <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 hover:shadow-md transition-shadow md:col-span-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-indigo-700 text-lg">Predictions (3-6 months)</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {report.aiInsights.predictions}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conclusion & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200 shadow-md hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-green-50">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Conclusion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{report.conclusion}</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-md hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Target className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-sm transition-shadow">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}