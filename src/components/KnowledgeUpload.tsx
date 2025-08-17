import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileText, Check, X, Loader2, Sparkles } from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
}

export const KnowledgeUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(fileList).forEach((file) => {
      // Check file type
      const allowedTypes = [
        'text/plain',
        'text/markdown',
        'application/pdf',
        'text/csv',
        'application/json'
      ];
      
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
        toast.error(`File type not supported: ${file.name}`);
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max 5MB)`);
        return;
      }

      const uploadFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        content: '',
        status: 'uploading'
      };

      newFiles.push(uploadFile);
    });

    setFiles(prev => [...prev, ...newFiles]);

    // Process each file
    newFiles.forEach((uploadFile, index) => {
      const file = fileList[Array.from(fileList).findIndex(f => f.name === uploadFile.name)];
      processFile(file, files.length + index);
    });
  }, [files.length]);

  const processFile = async (file: File, index: number) => {
    try {
      // Update status to processing
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'processing' } : f
      ));

      // Read file content
      const text = await readFileAsText(file);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update with content and mark as complete
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, content: text, status: 'complete' } : f
      ));

      toast.success(`${file.name} processed successfully`);
    } catch (error) {
      console.error('Error processing file:', error);
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error' } : f
      ));
      toast.error(`Failed to process ${file.name}`);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'complete':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const completedFiles = files.filter(f => f.status === 'complete');
  const totalContent = completedFiles.reduce((acc, file) => acc + file.content.length, 0);

  return (
    <section id="upload" className="py-20 bg-gradient-to-br from-background to-accent/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Upload Your Knowledge</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Train your AI agents with your documents, notes, and expertise. 
            Support for text, markdown, PDF, and more.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Drag & drop files here
                </h3>
                <p className="text-muted-foreground mb-4">
                  or click to select files
                </p>
                <input
                  type="file"
                  multiple
                  accept=".txt,.md,.pdf,.csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild variant="outline">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Select Files
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported: TXT, MD, PDF, CSV, JSON (max 5MB each)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Files:</span>
                <span className="font-semibold">{completedFiles.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Content:</span>
                <span className="font-semibold">{formatFileSize(totalContent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold text-green-600">
                  {completedFiles.length > 0 ? 'Ready' : 'Empty'}
                </span>
              </div>
              
              {completedFiles.length > 0 && (
                <div className="pt-4">
                  <Button className="w-full" variant="default">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Agent from Knowledge
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusIcon(file.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};