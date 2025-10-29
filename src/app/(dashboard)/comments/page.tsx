'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  MessageSquare,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Star,
  BookOpen,
  User
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import commentService, { Comment } from '@/services/commentService'

export default function CommentsManagementPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'disabled'>('all')

  useEffect(() => {
    loadComments()
  }, [])

  useEffect(() => {
    filterComments()
  }, [comments, searchTerm, filterStatus])

  const loadComments = async () => {
    try {
      setLoading(true)
      const data = await commentService.getAllComments()
      setComments(data)
    } catch (error) {
      console.error('Error loading comments:', error)
      toast.error('Không thể tải danh sách bình luận')
    } finally {
      setLoading(false)
    }
  }

  const filterComments = () => {
    let filtered = [...comments]

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(c => !c.isDisabled)
    } else if (filterStatus === 'disabled') {
      filtered = filtered.filter(c => c.isDisabled)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c =>
        c.comment.toLowerCase().includes(term) ||
        c.book_id.title.toLowerCase().includes(term) ||
        c.user_id.username.toLowerCase().includes(term)
      )
    }

    setFilteredComments(filtered)
  }

  const handleToggleDisable = async (comment: Comment) => {
    try {
      await commentService.toggleDisableComment(comment._id, !comment.isDisabled)
      toast.success(comment.isDisabled ? 'Đã kích hoạt bình luận' : 'Đã ẩn bình luận')
      loadComments()
    } catch (error) {
      toast.error('Không thể cập nhật bình luận')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return

    try {
      await commentService.deleteComment(id)
      toast.success('Đã xóa bình luận')
      loadComments()
    } catch (error) {
      toast.error('Không thể xóa bình luận')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const stats = {
    total: comments.length,
    active: comments.filter(c => !c.isDisabled).length,
    disabled: comments.filter(c => c.isDisabled).length,
    avgRating: comments.length > 0
      ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
      : '0'
  }

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Bình Luận</h1>
            <p className="text-gray-600">Quản lý tất cả bình luận và đánh giá</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng Bình Luận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Đang Hiển Thị
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Đã Ẩn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.disabled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Đánh Giá TB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold">{stats.avgRating}</span>
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ Lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo nội dung, sách, người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                Tất cả
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Hiển thị
              </Button>
              <Button
                variant={filterStatus === 'disabled' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('disabled')}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Đã ẩn
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Bình Luận ({filteredComments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Đang tải...</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không có bình luận nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người Dùng</TableHead>
                    <TableHead>Sách</TableHead>
                    <TableHead>Đánh Giá</TableHead>
                    <TableHead>Nội Dung</TableHead>
                    <TableHead>Thời Gian</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead>Hành Động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComments.map((comment) => (
                    <TableRow key={comment._id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {comment.user_id.fullname || comment.user_id.username}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium max-w-xs truncate">
                              {comment.book_id.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {comment.book_id.author}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {renderStars(comment.rating)}
                      </TableCell>

                      <TableCell>
                        <div className="max-w-md">
                          <p className="line-clamp-2 text-sm">
                            {comment.comment}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          {format(parseISO(comment.createdAt), 'dd/MM/yyyy', { locale: vi })}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={comment.isDisabled ? 'destructive' : 'default'}>
                          {comment.isDisabled ? 'Đã ẩn' : 'Hiển thị'}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleDisable(comment)}
                            title={comment.isDisabled ? 'Hiện bình luận' : 'Ẩn bình luận'}
                          >
                            {comment.isDisabled ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-600" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(comment._id)}
                            title="Xóa bình luận"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
