// Google Books API service
export interface GoogleBookInfo {
  title?: string;
  authors?: string[];
  description?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };
  language?: string;
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: Array<{
    id: string;
    volumeInfo: GoogleBookInfo;
    saleInfo?: {
      listPrice?: {
        amount: number;
        currencyCode: string;
      };
    };
  }>;
}

class GoogleBooksService {
  private readonly API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';
  private readonly BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

  async searchByISBN(isbn: string): Promise<GoogleBookInfo | null> {
    try {
      const cleanISBN = isbn.replace(/[-\s]/g, ''); // Remove dashes and spaces
      const url = `${this.BASE_URL}?q=isbn:${cleanISBN}&key=${this.API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GoogleBooksResponse = await response.json();
      
      if (data.totalItems > 0 && data.items && data.items.length > 0) {
        return data.items[0].volumeInfo;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching book info from Google Books API:', error);
      return null;
    }
  }

  async searchByTitle(title: string, author?: string): Promise<GoogleBookInfo[]> {
    try {
      let query = `intitle:${title}`;
      if (author) {
        query += `+inauthor:${author}`;
      }
      
      const url = `${this.BASE_URL}?q=${encodeURIComponent(query)}&maxResults=5&key=${this.API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GoogleBooksResponse = await response.json();
      
      if (data.totalItems > 0 && data.items) {
        return data.items.map(item => item.volumeInfo);
      }
      
      return [];
    } catch (error) {
      console.error('Error searching books from Google Books API:', error);
      return [];
    }
  }

  // Helper method to get the best available cover image
  getBestCoverImage(imageLinks?: GoogleBookInfo['imageLinks']): string {
    if (!imageLinks) return '';
    
    // Priority order: large -> medium -> small -> thumbnail -> smallThumbnail
    return imageLinks.extraLarge ||
           imageLinks.large ||
           imageLinks.medium ||
           imageLinks.small ||
           imageLinks.thumbnail ||
           imageLinks.smallThumbnail ||
           '';
  }

  // Helper method to format authors array to string
  formatAuthors(authors?: string[]): string {
    if (!authors || authors.length === 0) return '';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return authors.join(' & ');
    return authors.slice(0, -1).join(', ') + ' & ' + authors[authors.length - 1];
  }

  // Helper method to extract ISBN from industryIdentifiers
  getISBN(industryIdentifiers?: GoogleBookInfo['industryIdentifiers']): string {
    if (!industryIdentifiers) return '';
    
    // Prefer ISBN_13 over ISBN_10
    const isbn13 = industryIdentifiers.find(id => id.type === 'ISBN_13');
    if (isbn13) return isbn13.identifier;
    
    const isbn10 = industryIdentifiers.find(id => id.type === 'ISBN_10');
    if (isbn10) return isbn10.identifier;
    
    return '';
  }
}

export const googleBooksService = new GoogleBooksService();