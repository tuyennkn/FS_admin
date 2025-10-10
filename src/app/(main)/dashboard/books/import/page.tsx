'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import { apiService } from '@/services/apiService';
import { getAccessToken } from '@/utils/tokenUtils';
import { Book } from '@/types';
import Papa from "papaparse";

interface ImportResult {
  imported: number;
  total: number;
  errors: string[];
  books: any[];
}

interface BookRecord {
  title: string;
  author?: string;
  description?: string; // Changed from summary
  genre?: string; // Changed from category
  slug?: string;
  publisher?: string;
  price: string;
  publishDate?: string;
  image?: string[];
  isbn?: string;
  pages?: number;
  language?: string;
  edition?: string;
  bookFormat?: string;
  characters?: string[];
  awards?: string[];
}

export default function ImportBooksPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<string>('');
  const [importMode, setImportMode] = useState<'csv' | 'json'>('csv');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to parse array fields from CSV
  const parseArrayField = (fieldValue: string): string[] | undefined => {
    if (!fieldValue || fieldValue.trim() === '') {
      return undefined;
    }
    
    try {
      // Try to parse as JSON first
      return JSON.parse(fieldValue);
    } catch {
      // If JSON.parse fails, try to parse Python-style array format
      // e.g., "['item1', 'item2']" or "['Sancho Panza', 'Don Quijote de la Mancha']"
      const cleaned = fieldValue
        .trim()
        .replace(/^\[|\]$/g, '') // Remove outer brackets
        .replace(/'/g, '"'); // Replace single quotes with double quotes
      
      // Split by comma and clean each item
      const items = cleaned.split(',').map(item => 
        item.trim().replace(/^"(.*)"$/, '$1') // Remove surrounding quotes
      ).filter(item => item.length > 0);
      
      return items.length > 0 ? items : undefined;
    }
  };

  // Helper function to parse genre field (convert array to comma-separated string)
  const parseGenreField = (fieldValue: string): string => {
    if (!fieldValue || fieldValue.trim() === '') {
      return "";
    }
    
    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(fieldValue);
      if (Array.isArray(parsed)) {
        return parsed.join(', ');
      }
      return fieldValue;
    } catch {
      // If JSON.parse fails, try to parse Python-style array format
      // e.g., "['Classics', 'Fiction', 'Literature']"
      const cleaned = fieldValue
        .trim()
        .replace(/^\[|\]$/g, '') // Remove outer brackets
        .replace(/'/g, ''); // Remove single quotes
      
      // Split by comma and clean each item, then join back
      const items = cleaned.split(',').map(item => 
        item.trim().replace(/^"(.*)"$/, '$1') // Remove surrounding quotes if any
      ).filter(item => item.length > 0);
      
      return items.join(', ');
    }
  };

  // Sample JSON data for reference
  const sampleJsonData = {
    books: [
      {
        title: "Sample Book Title",
        author: "Author Name",
        description: "Book description here...",
        genre: "Fiction",
        slug: "sample-book-title-123",
        publisher: "Publisher Name",
        price: "19.99",
        publishDate: "2024-01-01",
        image: ["https://example.com/cover.jpg"],
        isbn: "9781234567890",
        pages: 300,
        language: "English",
        edition: "First Edition",
        bookFormat: "Paperback",
        characters: ["Main Character", "Supporting Character"],
        awards: ["Book Award 2024"]
      }
    ]
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
        setError(null);
      } else {
        setError('Please select a valid CSV file');
        setCsvFile(null);
      }
    }
  };

  const convertCsvToJson = (csvText: string): BookRecord[] => {
    const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const books: BookRecord[] = [];

    for (const row of result.data as any[]) {
      const price = parseFloat((row["price"] || "").replace(/[$,]/g, "")) || 0;
      
      // Generate slug from title
      const slug = (row["title"] || "").toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const book: BookRecord = {
        title: row["title"]?.trim() || "",
        author: row["author"]?.trim() || "",
        description: row["description"]?.trim() || "",
        slug: slug + '-' + Date.now(),
        publisher: row["publisher"]?.trim() || "",
        price: price.toString(),
        genre: parseGenreField(row["genres"]),
        publishDate: row["publishDate"] || null,
        image: row["coverImg"] ? [row["coverImg"]] : [],
        
        // Additional attributes from demo.csv
        isbn: row["isbn"] || undefined,
        pages: row["pages"] ? parseInt(row["pages"]) : undefined,
        language: row["language"] || undefined,
        edition: row["edition"] || undefined,
        bookFormat: row["bookFormat"] || undefined,
        characters: parseArrayField(row["characters"]),
        awards: parseArrayField(row["awards"])
      };

      if (book.title && parseFloat(book.price) > 0) {
        books.push(book);
      }
    }

    return books;
  };

  const handleImport = async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      if (importMode === 'csv' && csvFile) {
        // New approach: Send CSV file directly to backend
        setProgress(10);
        
        const formData = new FormData();
        formData.append('csvFile', csvFile);

        setProgress(30);

        const response = await apiService.post('/import/books/csv', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.total) {
              const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 60); // 60% for upload
              setProgress(30 + uploadProgress);
            }
          }
        });

        setProgress(100);
        setResult(response.data.data || response.data);

      } else if (importMode === 'json' && jsonData) {
        // Keep existing approach for JSON data
        const parsed = JSON.parse(jsonData);
        const booksData = parsed.books || [];
        setProgress(30);

        if (booksData.length === 0) {
          throw new Error('No valid books found in the data');
        }

        setProgress(50);

        // Call legacy import API
        const response = await apiService.post('/book/import-csv', {
          books: booksData
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setProgress(100);
        setResult(response.data.data || response.data);

      } else {
        throw new Error('Please provide data to import');
      }

    } catch (err: any) {
      console.error('Import error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Import failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = `title,author,description,genres,publisher,price,publishDate,coverImg,isbn,pages,language,edition,bookFormat,characters,awards
"Sample Book 1","John Doe","This is a sample book description","['Fiction', 'Adventure']","Sample Publisher","19.99","2024-01-01","https://example.com/cover1.jpg","9781234567890","300","English","First Edition","Paperback","['Main Character', 'Supporting Character']","['Sample Award 2024']"
"Sample Book 2","Jane Smith","Another sample book","['Non-Fiction', 'Biography']","Another Publisher","29.99","2023-06-01","https://example.com/cover2.jpg","9781234567891","250","English","Second Edition","Hardcover","['Historical Figure']","['Biography Award 2023']"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_books.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };  const resetForm = () => {
    setCsvFile(null);
    setJsonData('');
    setResult(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Import Books</h1>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={downloadSampleCsv}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download Sample CSV</span>
        </Button>
      </div>

      {/* Import Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Import Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={importMode === 'csv' ? 'default' : 'outline'}
              onClick={() => setImportMode('csv')}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>CSV File Upload</span>
            </Button>
            <Button
              variant={importMode === 'json' ? 'default' : 'outline'}
              onClick={() => setImportMode('json')}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>JSON Data Input</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CSV Upload Mode */}
      {importMode === 'csv' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Upload your CSV file directly. The server will process and import the books automatically with AI-powered category analysis.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input
                ref={fileInputRef}
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="mt-2"
              />
            </div>

            {csvFile && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Selected file: <strong>{csvFile.name}</strong> ({(csvFile.size / 1024).toFixed(2)} KB)
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-gray-600">
              <p><strong>Expected CSV format:</strong></p>
              <code className="block bg-gray-100 p-2 rounded mt-2">
                title,author,description,genres,publisher,price,publishDate,coverImg,isbn,pages,language,edition,bookFormat,characters,awards
              </code>
              <p className="mt-2"><strong>Notes:</strong></p>
              <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                <li>Arrays should be in Python format: ['item1', 'item2']</li>
                <li>genres, characters, awards support array format</li>
                <li>price should be numeric (without $ sign)</li>
                <li>publishDate format: YYYY-MM-DD</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* JSON Input Mode */}
      {importMode === 'json' && (
        <Card>
          <CardHeader>
            <CardTitle>JSON Data Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="json-data">Paste JSON Data</Label>
              <Textarea
                id="json-data"
                value={jsonData}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJsonData(e.target.value)}
                placeholder={JSON.stringify(sampleJsonData, null, 2)}
                className="mt-2 h-64 font-mono text-sm"
              />
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>Required JSON format:</strong></p>
              <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto text-xs">
                {JSON.stringify(sampleJsonData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Button and Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Button
              onClick={handleImport}
              disabled={loading || (!csvFile && !jsonData)}
              className="w-full"
              size="lg"
            >
              {loading ? 'Importing...' : 'Start Import'}
            </Button>

            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-gray-600">
                  Processing... {progress}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Import Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                <div className="text-sm text-green-700">Successfully Imported</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                <div className="text-sm text-blue-700">Total Processed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                <div className="text-sm text-red-700">Errors</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Errors:</h4>
                <div className="space-y-1">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button onClick={resetForm} variant="outline">
                Import More Books
              </Button>
              <Button onClick={() => router.push('/dashboard/books')}>
                View Books
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
