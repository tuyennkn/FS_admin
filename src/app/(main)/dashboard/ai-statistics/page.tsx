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
  Star
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Thống Kê Sách</h1>
            <p className="text-gray-600">Phân tích thông minh về doanh số bán sách</p>
          </div>
        </div>
        
        <Button 
          onClick={generateReport} 
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Tạo Báo Cáo Mới
            </>
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      {generating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Đang tạo báo cáo...</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600">{progressMessage}</p>
              <p className="text-xs text-gray-500">
                Tiến trình: {progress}% - Vui lòng không đóng trang này
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách báo cáo */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Danh Sách Báo Cáo</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadStatistics}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
              <CardDescription>
                {statistics.length} báo cáo đã tạo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {statistics.map((stat) => (
                  <div
                    key={stat._id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      currentReport?._id === stat._id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => viewReport(stat._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {stat.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(parseISO(stat.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
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
                            {stat.totalBooksAnalyzed} sách
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
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
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có báo cáo nào</p>
                    <p className="text-sm">Tạo báo cáo đầu tiên của bạn!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chi tiết báo cáo */}
        <div className="lg:col-span-2">
          {currentReport ? (
            <ReportDetail report={currentReport} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chọn một báo cáo để xem chi tiết
                </h3>
                <p className="text-gray-500 text-center">
                  Chọn báo cáo từ danh sách bên trái hoặc tạo báo cáo mới
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Component hiển thị chi tiết báo cáo
function ReportDetail({ report }: { report: AiStatistic }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{report.title}</CardTitle>
              <CardDescription className="mt-2 whitespace-pre-line">
                {report.summary}
              </CardDescription>
              <div className="flex items-center space-x-4 mt-4">
                <Badge variant="default">
                  {format(parseISO(report.start), 'dd/MM/yyyy', { locale: vi })} - {' '}
                  {format(parseISO(report.end), 'dd/MM/yyyy', { locale: vi })}
                </Badge>
                <Badge variant="default">
                  {report.totalBooksAnalyzed} sách được phân tích
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Xuất PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Books Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Sách Bán Chạy</CardTitle>
          </CardHeader>
          <CardContent>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Phân Bố Lý Do Thành Công</CardTitle>
          </CardHeader>
          <CardContent>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Xu Hướng Doanh Số</CardTitle>
          </CardHeader>
          <CardContent>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tương Quan Yếu Tố</CardTitle>
          </CardHeader>
          <CardContent>
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
      <Card>
        <CardHeader>
          <CardTitle>Phân Tích Chi Tiết Từng Sách</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.bookAnalysis.map((book, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{book.book}</h4>
                  <p className="text-sm text-gray-600">{book.reason}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{book.salesCount} cuốn</p>
                  <div className="flex items-center justify-end text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{book.rating}/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Deep Insights */}
      {report.aiInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>AI Deep Insights</span>
            </CardTitle>
            <CardDescription>
              Phân tích sâu về tâm lý khách hàng và xu hướng thị trường
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Insights */}
              {report.aiInsights.customerInsights && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🧠</span>
                    <h4 className="font-semibold text-purple-700">Customer Insights</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {report.aiInsights.customerInsights}
                  </p>
                </div>
              )}

              {/* Market Trends */}
              {report.aiInsights.marketTrends && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📈</span>
                    <h4 className="font-semibold text-green-700">Market Trends</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {report.aiInsights.marketTrends}
                  </p>
                </div>
              )}

              {/* Business Opportunities */}
              {report.aiInsights.businessOpportunities && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">💡</span>
                    <h4 className="font-semibold text-yellow-700">Business Opportunities</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {report.aiInsights.businessOpportunities}
                  </p>
                </div>
              )}

              {/* Pricing Strategy */}
              {report.aiInsights.pricingStrategy && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">💰</span>
                    <h4 className="font-semibold text-blue-700">Pricing Strategy</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {report.aiInsights.pricingStrategy}
                  </p>
                </div>
              )}

              {/* Predictions */}
              {report.aiInsights.predictions && (
                <div className="space-y-3 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🔮</span>
                    <h4 className="font-semibold text-indigo-700">Predictions (3-6 months)</h4>
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
        <Card>
          <CardHeader>
            <CardTitle>Kết Luận</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{report.conclusion}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gợi Ý Chiến Lược</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
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