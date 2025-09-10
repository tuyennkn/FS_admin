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

interface ImportResult {
  imported: number;
  total: number;
  errors: string[];
  books: any[];
}

interface BookRecord {
  title: string;
  author?: string;
  summary?: string;
  category?: string;
  publisher?: string;
  price: string;
  publishDate?: string;
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

  // Sample JSON data for reference
  const sampleJsonData = {
    books: [
      {
        title: "Sample Book Title",
        author: "Author Name",
        summary: "Book description here...",
        category: "Fiction",
        publisher: "Publisher Name",
        price: "19.99",
        publishDate: "2024-01-01"
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
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV file must have header and at least one data row');
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const books: BookRecord[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length < headers.length) continue;
      
      const book: BookRecord = {
        title: '',
        price: ''
      };
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header.toLowerCase()) {
          case 'title':
            book.title = value;
            break;
          case 'authors':
          case 'author':
            book.author = value.startsWith('By ') ? value.substring(3) : value;
            break;
          case 'description':
          case 'summary':
            book.summary = value;
            break;
          case 'category':
          case 'genre':
            book.category = value;
            break;
          case 'publisher':
            book.publisher = value;
            break;
          case 'price starting with ($)':
          case 'price':
            book.price = value.replace(/[$,]/g, '');
            break;
          case 'publish date (year)':
            if (value && !book.publishDate) {
              book.publishDate = `${value}-01-01`;
            }
            break;
          case 'publish date (month)':
            if (value && book.publishDate) {
              const year = book.publishDate.split('-')[0];
              book.publishDate = `${year}-${value.padStart(2, '0')}-01`;
            }
            break;
        }
      });
      
      if (book.title && book.price) {
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
      let booksData: BookRecord[] = [];

      if (importMode === 'csv' && csvFile) {
        // Process CSV file
        const csvText = await csvFile.text();
        booksData = convertCsvToJson(csvText);
        setProgress(30);
      } else if (importMode === 'json' && jsonData) {
        // Process JSON data
        const parsed = JSON.parse(jsonData);
        booksData = parsed.books || [];
        setProgress(30);
      } else {
        throw new Error('Please provide data to import');
      }

      if (booksData.length === 0) {
        throw new Error('No valid books found in the data');
      }

      setProgress(50);

      // Call import API
      const response = await apiService.post('/book/import-csv', {
        books: booksData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProgress(100);
      setResult(response.data.data);

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
    const csvContent = `Title,Authors,Description,Category,Publisher,Price Starting With ($),Publish Date (Month),Publish Date (Year)
Sample Book 1,By John Doe,This is a sample book description,Fiction,Sample Publisher,$19.99,1,2024
Sample Book 2,By Jane Smith,Another sample book,Non-Fiction,Another Publisher,$29.99,6,2023`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_books.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
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
                Title,Authors,Description,Category,Publisher,Price Starting With ($),Publish Date (Month),Publish Date (Year)
              </code>
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
