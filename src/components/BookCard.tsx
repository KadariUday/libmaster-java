import { Book } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: {
    id: string;
    book_id: string;
    title: string;
    author: string;
    genre: string;
    status: string;
  };
  onIssue: (book: any) => void;
  onReturn: (book: any) => void;
}

export const BookCard = ({ book, onIssue, onReturn }: BookCardProps) => {
  const isAvailable = book.status === "Available";
  
  const getGenreColor = (genre: string) => {
    const colors: { [key: string]: string } = {
      Fantasy: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Mystery: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Romance: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      History: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      Biography: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Science: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      Novels: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      Comics: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[genre] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-3 items-start flex-1 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-1">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getGenreColor(book.genre)}>
            {book.genre}
          </Badge>
          <Badge 
            variant={isAvailable ? "default" : "secondary"}
            className={isAvailable ? "bg-success text-success-foreground" : ""}
          >
            {book.status}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono ml-auto">
            {book.book_id}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {isAvailable ? (
          <Button 
            onClick={() => onIssue(book)} 
            className="w-full"
            variant="default"
          >
            Issue Book
          </Button>
        ) : (
          <Button 
            onClick={() => onReturn(book)} 
            className="w-full"
            variant="outline"
          >
            Return Book
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
