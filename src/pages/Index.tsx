import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookCard } from "@/components/BookCard";
import { IssueBookDialog } from "@/components/IssueBookDialog";
import { ReturnBookDialog } from "@/components/ReturnBookDialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, Library, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, available: 0, issued: 0 });

  const genres = ["Fantasy", "Mystery", "Romance", "History", "Biography", "Science", "Novels", "Comics"];

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchTerm, selectedGenre, selectedStatus, books]);

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("title");

    if (error) {
      console.error("Error fetching books:", error);
      return;
    }

    setBooks(data || []);
    
    // Calculate stats
    const total = data?.length || 0;
    const available = data?.filter(b => b.status === "Available").length || 0;
    const issued = total - available;
    setStats({ total, available, issued });
  };

  const filterBooks = () => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.book_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre !== "all") {
      filtered = filtered.filter((book) => book.genre === selectedGenre);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((book) => book.status === selectedStatus);
    }

    setFilteredBooks(filtered);
  };

  const handleIssue = (book: any) => {
    setSelectedBook(book);
    setIssueDialogOpen(true);
  };

  const handleReturn = (book: any) => {
    setSelectedBook(book);
    setReturnDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchBooks();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Library className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Library Management System</h1>
              <p className="text-muted-foreground text-sm">Manage your 3,500 book collection</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Total Books</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-success/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-5 w-5 text-success" />
                <span className="text-sm font-medium text-muted-foreground">Available</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.available}</p>
            </div>
            <div className="bg-warning/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-5 w-5 text-warning" />
                <span className="text-sm font-medium text-muted-foreground">Issued</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.issued}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by title, author, or book ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Books Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {filteredBooks.length} {filteredBooks.length === 1 ? "Book" : "Books"} Found
          </h2>
          {(searchTerm || selectedGenre !== "all" || selectedStatus !== "all") && (
            <Badge variant="outline" className="cursor-pointer" onClick={() => {
              setSearchTerm("");
              setSelectedGenre("all");
              setSelectedStatus("all");
            }}>
              Clear Filters
            </Badge>
          )}
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No books found</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onIssue={handleIssue}
                onReturn={handleReturn}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      {selectedBook && (
        <>
          <IssueBookDialog
            open={issueDialogOpen}
            onOpenChange={setIssueDialogOpen}
            book={selectedBook}
            onSuccess={handleSuccess}
          />
          <ReturnBookDialog
            open={returnDialogOpen}
            onOpenChange={setReturnDialogOpen}
            book={selectedBook}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  );
};

export default Index;
